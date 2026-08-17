'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  name?: string;
  displayName?: string;
  userName?: string;
  fullName?: string;
  accountId?: string | number;
  displayAccountNumber?: string;
  photo?: string;
  photoURL?: string;
  image?: string;
  avatar?: string;
  bio?: string;
  country?: string;
  countryCode?: string;
  gender?: string;
  level?: number;
  walletBalance?: number;
  [key: string]: any;
}

interface UserContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const CACHE_KEY = 'hurry_user_profile_cache';
const PENDING_QUEUE_KEY = 'hurry_pending_profile_updates';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  // Initialize and load from cache/Firebase
  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return;

      const storedUid = localStorage.getItem('userUID');
      if (!storedUid || storedUid === 'N/A') {
        setLoading(false);
        return;
      }

      setUid(storedUid);

      // 1. Try to load from localStorage cache first
      try {
        const cached = localStorage.getItem(`${CACHE_KEY}_${storedUid}`);
        if (cached) {
          setUserProfile(JSON.parse(cached));
          setLoading(false); // Display cached data immediately
        }
      } catch (e) {
        console.error("Failed to parse cached profile", e);
      }

      // 2. Fetch fresh data from Firebase
      await fetchFromFirebase(storedUid);
    };

    init();
  }, []);

  const syncPendingUpdates = useCallback(async () => {
    if (!uid || typeof window === 'undefined') return;

    try {
      const pendingStr = localStorage.getItem(`${PENDING_QUEUE_KEY}_${uid}`);
      if (!pendingStr) return;

      const pendingUpdates = JSON.parse(pendingStr);
      if (Object.keys(pendingUpdates).length === 0) return;

      // Try to sync
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, pendingUpdates, { merge: true });

      // If successful, clear the queue
      localStorage.removeItem(`${PENDING_QUEUE_KEY}_${uid}`);
      console.log('Successfully synced pending profile updates to Firebase');
    } catch (e) {
      console.error('Failed to sync pending updates, will try again later', e);
    }
  }, [uid]);

  // Try syncing pending updates when network comes back
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', syncPendingUpdates);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        syncPendingUpdates();
      }
    });
    window.addEventListener('pagehide', syncPendingUpdates);

    // Also try syncing on load if we have pending updates
    if (uid) {
      syncPendingUpdates();
    }

    return () => {
      window.removeEventListener('online', syncPendingUpdates);
      document.removeEventListener('visibilitychange', syncPendingUpdates);
      window.removeEventListener('pagehide', syncPendingUpdates);
    };
  }, [syncPendingUpdates, uid]);

  const fetchFromFirebase = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        data.uid = userId;

        setUserProfile(data);
        localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(data));

        // Also update standard localStorage fields to maintain compatibility
        if (data.name || data.displayName || data.userName) {
          localStorage.setItem('userName', data.name || data.displayName || data.userName || '');
        }
        if (data.accountId) {
          localStorage.setItem('accountNumber', String(data.accountId));
        }
      }
    } catch (error) {
      console.error("Error fetching user profile", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!uid) return;

    // Optimistically update local state and cache
    const newProfile = userProfile ? { ...userProfile, ...updates } : { uid, ...updates } as UserProfile;
    setUserProfile(newProfile);
    localStorage.setItem(`${CACHE_KEY}_${uid}`, JSON.stringify(newProfile));

    // Update standard localStorage fields to maintain compatibility
    if (updates.name || updates.displayName || updates.userName) {
      localStorage.setItem('userName', updates.name || updates.displayName || updates.userName || '');
    }
    if (updates.accountId) {
      localStorage.setItem('accountNumber', String(updates.accountId));
    }

    try {
      // We don't write to Firebase immediately to reduce unnecessary writes.
      // Instead, we always queue the updates to sync later.
      throw new Error('Force queue');
    } catch (error) {
      console.error("Error saving profile to Firebase, queuing for offline sync", error);

      // If offline/error, add to pending queue
      try {
        const pendingStr = localStorage.getItem(`${PENDING_QUEUE_KEY}_${uid}`);
        let pending = pendingStr ? JSON.parse(pendingStr) : {};
        pending = { ...pending, ...updates };
        localStorage.setItem(`${PENDING_QUEUE_KEY}_${uid}`, JSON.stringify(pending));
      } catch (e) {
        console.error('Failed to queue offline update', e);
      }
    }
  };

  const refreshProfile = async () => {
    if (uid) {
      await fetchFromFirebase(uid);
    }
  };

  return (
    <UserContext.Provider value={{ userProfile, loading, updateProfile, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
