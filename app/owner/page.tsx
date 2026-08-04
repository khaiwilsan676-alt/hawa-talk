"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, Shield, Lock, Mail, Save, Eye, EyeOff, Key, LogOut, Star, MessageSquare, Trash2, RefreshCw } from "lucide-react";
import { db } from "../../src/lib/firebase";
import { doc, setDoc, onSnapshot, collection, query, orderBy, getDocs, deleteDoc } from "firebase/firestore";

export default function OwnerPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('ownerPanelLoggedIn') === 'true');
    }
  }, []);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState("official_id");
  const [saveMessage, setSaveMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginKey, setLoginKey] = useState("");
  const [loginError, setLoginError] = useState("");

  // Feedback States
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const getDefaultIdsData = () => ({
    "100002": { email: "", password: "" },
    "100003": { email: "", password: "" },
    "500001": { email: "", password: "" },
    "500002": { email: "", password: "" },
    "500003": { email: "", password: "" },
    "500004": { email: "", password: "" },
    "500005": { email: "", password: "" },
    "700001": { email: "", password: "" },
    "700002": { email: "", password: "" },
    "700003": { email: "", password: "" },
  });

  // Load initial state safely from localStorage if available
  const [idsData, setIdsData] = useState<Record<string, any>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ownerPanelCredentials");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return getDefaultIdsData();
  });

  const focusedField = useRef<string | null>(null);
  const skipNextSave = useRef(true);
  const isLoadedFromFirestore = useRef(false);

  // Load from firestore (Real-time sync)
  useEffect(() => {
    const docRef = doc(db, "adminSettings", "credentials");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const serverData = docSnap.data().ownerPanelCredentials || {};
          const mergedData = getDefaultIdsData();
          
          Object.keys(getDefaultIdsData()).forEach(id => {
            if (serverData[id]) {
              mergedData[id as keyof typeof mergedData] = {
                email: serverData[id].email || "",
                password: serverData[id].password || ""
              };
            }
          });

          setIdsData(currentData => {
            const finalData = JSON.parse(JSON.stringify(mergedData));

            if (focusedField.current) {
              const [focusedId, focusedKey] = focusedField.current.split('-');
              if (finalData[focusedId] && currentData[focusedId]) {
                finalData[focusedId][focusedKey] = currentData[focusedId][focusedKey];
              }
            }

            if (JSON.stringify(currentData) === JSON.stringify(finalData)) {
              return currentData;
            }

            skipNextSave.current = true;
            isLoadedFromFirestore.current = true;
            
            localStorage.setItem("ownerPanelCredentials", JSON.stringify(finalData));
            return finalData;
          });
        } else {
          isLoadedFromFirestore.current = true;
        }
      },
      (error) => {
        console.error("Error fetching credentials:", error);
        isLoadedFromFirestore.current = true;
      }
    );

    return () => unsubscribe();
  }, []);

  // Track online status
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribes = Object.keys(idsData).map(id => {
      const docRef = doc(db, "adminSettings", `sessions_${id}`);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setOnlineStatus(prev => ({
            ...prev,
            [id]: docSnap.data().isLoggedIn === true
          }));
        } else {
          setOnlineStatus(prev => ({
            ...prev,
            [id]: false
          }));
        }
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [idsData]);

  // Load Feedbacks
  const loadFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const q = query(collection(db, "feedbacks"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const feedbackList: any[] = [];
      querySnapshot.forEach((doc) => {
        feedbackList.push({ id: doc.id, ...doc.data() });
      });
      setFeedbacks(feedbackList);
    } catch (error) {
      console.error("Error loading feedbacks:", error);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  // Auto-delete feedbacks older than 48 hours
  useEffect(() => {
    const checkAndDeleteOldFeedbacks = async () => {
      try {
        const q = query(collection(db, "feedbacks"));
        const querySnapshot = await getDocs(q);
        const now = Date.now();
        const fortyEightHours = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

        querySnapshot.forEach(async (document) => {
          const data = document.data();
          const feedbackTime = data.timestamp || 0;
          
          if (now - feedbackTime > fortyEightHours) {
            await deleteDoc(doc(db, "feedbacks", document.id));
            console.log(`Deleted old feedback: ${document.id}`);
          }
        });

        // Reload feedbacks after cleanup
        loadFeedbacks();
      } catch (error) {
        console.error("Error cleaning up old feedbacks:", error);
      }
    };

    // Run cleanup when activeView is moderator
    if (activeView === "moderator") {
      checkAndDeleteOldFeedbacks();
    }

    // Set interval to check every 10 minutes
    const interval = setInterval(() => {
      if (activeView === "moderator") {
        checkAndDeleteOldFeedbacks();
      }
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, [activeView]);

  // Load feedbacks when switching to moderator view
  useEffect(() => {
    if (activeView === "moderator") {
      loadFeedbacks();
    }
  }, [activeView]);

  const handleLogin = () => {
    if (loginUsername === "HAWA.IN" && loginPassword === "HAWA.OWNER/CEO" && loginKey === "25/7/2026") {
      setIsLoggedIn(true);
      setLoginError("");
      localStorage.setItem('ownerPanelLoggedIn', 'true');
    } else {
      setLoginError("Invalid credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('ownerPanelLoggedIn');
    setLoginUsername("");
    setLoginPassword("");
    setLoginKey("");
  };

  // ✅ FIRESTORE SAVE & SYNC FUNCTION
  const handleSave = useCallback(async (customData?: Record<string, any>) => {
    try {
      const targetData = customData || idsData;
      const credentials: any[] = [];
      
      Object.entries(targetData).forEach(([id, data]: [string, any]) => {
        const email = (data.email || "").trim();
        const password = (data.password || "").trim();
        if (email && password) {
          credentials.push({
            id: id,
            email: email,
            password: password,
            type: id.startsWith('5') ? 'official' : id.startsWith('7') ? 'admin' : 'special'
          });
        }
      });

      const docRef = doc(db, "adminSettings", "credentials");
      await setDoc(docRef, {
        ownerPanelCredentials: targetData,
        officialCredentials: credentials
      }, { merge: true });

      localStorage.setItem('ownerPanelCredentials', JSON.stringify(targetData));
      localStorage.setItem('officialCredentials', JSON.stringify(credentials));

      setSaveMessage("Credentials saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving credentials:", error);
      setSaveMessage("Error saving credentials!");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }, [idsData]);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (!isLoadedFromFirestore.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [idsData, handleSave]);

  const handleChange = (id: string, field: string, value: string) => {
    skipNextSave.current = false;
    setIdsData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleIDLogout = async (id: string) => {
    try {
      const docRef = doc(db, "adminSettings", `sessions_${id}`);
      await setDoc(docRef, {
        isLoggedIn: false,
        forceLogoutTimestamp: Date.now()
      }, { merge: true });

      const loggedInSessions = JSON.parse(localStorage.getItem('loggedInSessions') || '{}')
      delete loggedInSessions[id]
      localStorage.setItem('loggedInSessions', JSON.stringify(loggedInSessions))
      localStorage.removeItem(`session_${id}`)
      localStorage.removeItem(`user_data_${id}`)
      localStorage.setItem(`forceLogout_${id}`, Date.now().toString())

      setSaveMessage(`ID ${id} logged out successfully!`)
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      console.error(`Error logging out ID ${id}:`, error);
    }
  }

  const handleLogoutGroup = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const docRef = doc(db, "adminSettings", `sessions_${id}`);
        await setDoc(docRef, {
          isLoggedIn: false,
          forceLogoutTimestamp: Date.now()
        }, { merge: true });

        const loggedInSessions = JSON.parse(localStorage.getItem('loggedInSessions') || '{}')
        delete loggedInSessions[id]
        localStorage.setItem('loggedInSessions', JSON.stringify(loggedInSessions))
        localStorage.removeItem(`session_${id}`)
        localStorage.removeItem(`user_data_${id}`)
        localStorage.setItem(`forceLogout_${id}`, Date.now().toString())
      }

      setSaveMessage(`Selected IDs logged out successfully!`)
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      console.error(`Error logging out group:`, error);
    }
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time remaining
  const getTimeRemaining = (timestamp: number) => {
    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    const expiryTime = timestamp + fortyEightHours;
    const remaining = expiryTime - now;

    if (remaining <= 0) return 'Expired';

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m remaining`;
  };

  // Delete single feedback
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await deleteDoc(doc(db, "feedbacks", feedbackId));
      setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
      setSaveMessage("Feedback deleted!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Owner Panel Login</h1>
            <p className="text-gray-500 text-sm mt-1">Enter credentials to continue</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                User Name
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Key className="w-4 h-4" /> Key
              </label>
              <input
                type="password"
                placeholder="Enter key"
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition cursor-pointer mt-2"
            >
              Sign In
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            Owner Panel • Secure Access
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 relative flex flex-col min-w-[1024px] overflow-x-auto">
      
      {/* TOP NAVBAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition active:scale-95 cursor-pointer"
          >
            <Menu className="w-7 h-7 text-white" />
          </button>
          <h1 className="text-xl font-bold tracking-wide text-gray-900">Owner Control Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          {activeView !== "moderator" && (
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition cursor-pointer"
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPasswords ? "Hide" : "Show"}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium text-red-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
            Logout
          </button>
          {saveMessage && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
              {saveMessage}
            </div>
          )}
        </div>
      </header>

      {/* DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="relative w-80 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-6 flex flex-col justify-between z-10 border-r border-slate-700">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-700 mb-6">
                <Shield className="w-6 h-6 text-yellow-400" />
                <span className="font-bold text-lg text-white">Owner Menu</span>
              </div>
              <button
                onClick={() => {
                  setActiveView("official_id");
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-5 py-4 text-white font-semibold rounded-xl transition border shadow-md cursor-pointer mb-3 ${
                  activeView === "official_id"
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600'
                }`}
              >
                <span>MANAGE IDs</span>
                <span className="text-xs bg-yellow-400 text-black px-2.5 py-1 rounded-full font-bold">
                  Official/Admin/Special
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveView("moderator");
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-5 py-4 text-white font-semibold rounded-xl transition border shadow-md cursor-pointer ${
                  activeView === "moderator"
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600'
                }`}
              >
                <span>MODERATOR</span>
                <span className="text-xs bg-green-400 text-black px-2.5 py-1 rounded-full font-bold">
                  Feedbacks
                </span>
              </button>
            </div>
            <div className="text-xs text-slate-500 text-center pb-2">
              Owner Panel
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 w-full max-w-5xl mx-auto overflow-y-auto bg-white">
        
        {/* MODERATOR VIEW - FEEDBACKS */}
        {activeView === "moderator" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-blue-600" />
                Feedback Submissions
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {feedbacks.length} items
                </span>
              </h2>
              <button
                onClick={loadFeedbacks}
                disabled={loadingFeedbacks}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loadingFeedbacks ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
              ⏰ Feedbacks are automatically deleted after 48 hours.
            </div>

            {loadingFeedbacks ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-500">Loading feedbacks...</p>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No feedback submissions yet</p>
                <p className="text-gray-400 text-sm mt-1">Feedback from users will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                          feedback.type === 'app_bug' ? 'bg-red-100 text-red-700' :
                          feedback.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                          feedback.type === 'recharge' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {feedback.typeLabel || feedback.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(feedback.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-orange-500 font-medium">
                          ⏳ {getTimeRemaining(feedback.timestamp)}
                        </span>
                        <button
                          onClick={() => handleDeleteFeedback(feedback.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition cursor-pointer group"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</h3>
                        <p className="text-gray-700 leading-relaxed">{feedback.description}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">Contact Info</h3>
                        <p className="text-gray-700 font-medium">{feedback.contactInfo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === "official_id" && (
          <div className="space-y-8">

            {/* SPECIAL OFFICIAL IDs (100002, 100003) */}
            <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-lg bg-amber-50/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-amber-600 tracking-wider uppercase flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Special Official IDs
                </h2>
                <button
                  onClick={() => handleLogoutGroup(["100002", "100003"])}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout All Special
                </button>
              </div>

              <div className="space-y-3">
                {["100002", "100003"].map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm"
                  >
                    <span className="w-24 text-sm font-bold text-amber-600">ID: {id}</span>
                    
                    {/* Email */}
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-lg border border-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Email"
                        value={idsData[id]?.email || ""}
                        onChange={(e) => handleChange(id, "email", e.target.value)}
                        onFocus={() => focusedField.current = `${id}-email`}
                        onBlur={() => focusedField.current = null}
                        className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* Password */}
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-lg border border-gray-300">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="Password"
                        value={idsData[id]?.password || ""}
                        onChange={(e) => handleChange(id, "password", e.target.value)}
                        onFocus={() => focusedField.current = `${id}-password`}
                        onBlur={() => focusedField.current = null}
                        className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* STATUS + LOGOUT BUTTON */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        onlineStatus[id] 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {onlineStatus[id] ? 'Logined' : 'Offline'}
                      </span>
                      
                      <button
                        onClick={() => handleIDLogout(id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> LOGOUT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* OFFICIAL IDs (500001 - 500005) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-blue-600 tracking-wider uppercase flex items-center gap-2">
                  <Lock className="w-5 h-5" /> Official IDs
                </h2>
                <button
                  onClick={() => handleLogoutGroup(["500001", "500002", "500003", "500004", "500005"])}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout All Official
                </button>
              </div>

              <div className="space-y-3">
                {["500001", "500002", "500003", "500004", "500005"].map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-200"
                  >
                    <span className="w-24 text-sm font-bold text-blue-600">ID: {id}</span>
                    
                    {/* Email */}
                    <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Email"
                        value={idsData[id]?.email || ""}
                        onChange={(e) => handleChange(id, "email", e.target.value)}
                        onFocus={() => focusedField.current = `${id}-email`}
                        onBlur={() => focusedField.current = null}
                        className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* Password */}
                    <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-300">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="Password"
                        value={idsData[id]?.password || ""}
                        onChange={(e) => handleChange(id, "password", e.target.value)}
                        onFocus={() => focusedField.current = `${id}-password`}
                        onBlur={() => focusedField.current = null}
                        className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* STATUS + LOGOUT BUTTON */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        onlineStatus[id] 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {onlineStatus[id] ? 'Logined' : 'Offline'}
                      </span>
                      
                      <button
                        onClick={() => handleIDLogout(id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> LOGOUT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ADMIN IDs (700001 - 700003) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-purple-600 tracking-wider uppercase flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Admin IDs
                </h2>
                <button
                  onClick={() => handleLogoutGroup(["700001", "700002", "700003"])}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout All Admin
                </button>
              </div>

              <div className="space-y-3">
                {["700001", "700002", "700003"].map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-200"
                  >
                    <span className="w-24 text-sm font-bold text-purple-600">ID: {id}</span>
                    
                    {/* Email */}
                    <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Email"
                        value={idsData[id]?.email || ""}
                        onChange={(e) => handleChange(id, "email", e.target.value)}
                        onFocus={() => focusedField.current = `${id}-email`}
                        onBlur={() => focusedField.current = null}
                        className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* Password */}
                    <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-300">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="Password"
                        value={idsData[id]?.password || ""}
                        onChange={(e) => handleChange(id, "password", e.target.value)}
                        onFocus={() => focusedField.current = `${id}-password`}
                        onBlur={() => focusedField.current = null}
                        className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* STATUS + LOGOUT BUTTON */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        onlineStatus[id] 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {onlineStatus[id] ? 'Logined' : 'Offline'}
                      </span>
                      
                      <button
                        onClick={() => handleIDLogout(id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> LOGOUT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={() => handleSave()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-5 h-5" /> Save All Credentials
            </button>

          </div>
        )}
      </main>
    </div>
  );
    }
