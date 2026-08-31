'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  ChevronLeft,
  Edit3,
  MapPin,
  Copy,
  Camera,
  ChevronRight,
  X,
  Heart,
  MessageCircle,
  MoreHorizontal,
} from 'lucide-react'
import { getUser, saveUser, updateUser, updateRoom } from '../src/lib/googleSheets'

// Import the WebRTC ChatScreen component
import ChatScreen from './ChatScreen' // adjust path if necessary

// ============ IndexedDB Functions for Profile Data ============
const PROFILE_DB_NAME = 'ProfileDataDB';
const PROFILE_STORE = 'profileData';

const openProfileDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PROFILE_DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROFILE_STORE)) {
        db.createObjectStore(PROFILE_STORE, { keyPath: 'uid' });
      }
    };
  });
};

const saveProfileToDB = async (profileData: any) => {
  try {
    const db = await openProfileDB();
    const transaction = db.transaction([PROFILE_STORE], 'readwrite');
    const store = transaction.objectStore(PROFILE_STORE);
    store.put(profileData);

    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        db.close();
        resolve(true);
      };
    });
  } catch (error) {
    console.error('Error saving profile to IndexedDB:', error);
  }
};

const loadProfileFromDB = async (uid: string): Promise<any | null> => {
  try {
    const db = await openProfileDB();
    const transaction = db.transaction([PROFILE_STORE], 'readonly');
    const store = transaction.objectStore(PROFILE_STORE);
    const request = store.get(uid);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };
      request.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch (error) {
    console.error('Error loading profile from IndexedDB:', error);
    return null;
  }
};

interface UserProfile {
  uid: string
  name: string
  displayAccountNumber: string
  photo: string
  coverPhoto: string
  gender: '♂' | '♀'
  age: number
  followers: number
  bio: string
  location: string
  flag: string
  countryCode: string
  albumImages: string[]
  officialTag?: string
  adminTag?: string
  vipTag?: string
  premiumTag?: string
}

interface PublicProfileProps {
  onBack?: () => void
  onJoinRoom?: (roomId: string) => void
  targetUser?: {
    uid: string;
    name?: string;
    photo?: string;
    accountNumber?: string;
  } | null;
}

// Special Accounts Mapping
const SPECIAL_ACCOUNTS: { [key: string]: string } = {
  'HUSxSvQnabgU029dWYt1TUV04hd2': '100002',
  'ADqW31RGBMaosOzy0HiqexKSD7h1': '100003',
  '100002': '100002',
  '100003': '100003'
}

// Official & Admin IDs List
const OFFICIAL_IDS = ['500001', '500002', '500003', '500004', '500005']
const ADMIN_IDS = ['700001', '700002', '700003']

// List of all countries
const COUNTRIES = [
  { name: 'India', flag: '🇮🇳', code: 'IN' },
  { name: 'United States', flag: '🇺🇸', code: 'US' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU' },
  { name: 'UAE', flag: '🇦🇪', code: 'AE' },
  { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
  { name: 'Pakistan', flag: '🇵🇰', code: 'PK' },
  { name: 'Bangladesh', flag: '🇧🇩', code: 'BD' },
  { name: 'Nepal', flag: '🇳🇵', code: 'NP' },
  { name: 'Sri Lanka', flag: '🇱🇰', code: 'LK' },
  { name: 'Singapore', flag: '🇸🇬', code: 'SG' },
  { name: 'Malaysia', flag: '🇲🇾', code: 'MY' },
  { name: 'Indonesia', flag: '🇮🇩', code: 'ID' },
  { name: 'Philippines', flag: '🇵🇭', code: 'PH' },
  { name: 'Japan', flag: '🇯🇵', code: 'JP' },
  { name: 'South Korea', flag: '🇰🇷', code: 'KR' },
  { name: 'China', flag: '🇨🇳', code: 'CN' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE' },
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'Italy', flag: '🇮🇹', code: 'IT' },
  { name: 'Spain', flag: '🇪🇸', code: 'ES' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
  { name: 'Mexico', flag: '🇲🇽', code: 'MX' },
  { name: 'South Africa', flag: '🇿🇦', code: 'ZA' },
  { name: 'Nigeria', flag: '🇳🇬', code: 'NG' },
  { name: 'Egypt', flag: '🇪🇬', code: 'EG' },
  { name: 'Russia', flag: '🇷🇺', code: 'RU' },
  { name: 'Turkey', flag: '🇹🇷', code: 'TR' },
  { name: 'Netherlands', flag: '🇳🇱', code: 'NL' },
]

export const getOrCreateAccountNumber = (uid: string) => {
  if (!uid || uid === 'N/A') return '100379620'

  if (OFFICIAL_IDS.includes(uid) || ADMIN_IDS.includes(uid)) {
    return uid
  }

  if (SPECIAL_ACCOUNTS[uid]) {
    return SPECIAL_ACCOUNTS[uid]
  }

  let hash = 0
  for (let i = 0; i < uid.length; i++) {
    hash = (hash << 5) - hash + uid.charCodeAt(i)
    hash |= 0
  }
  const positiveHash = Math.abs(hash)
  return String(10000000 + (positiveHash % 90000000))
}

const isValidName = (name: string | null | undefined): boolean => {
  if (!name) return false;
  const trimmed = name.trim();
  if (!trimmed) return false;

  if (/^\d{8,}$/.test(trimmed)) return false;
  if (/^User\s*\(?\d*\)?$/i.test(trimmed)) return false;
  if (/^Account\s*\d*$/i.test(trimmed)) return false;

  return true;
};

export default function PublicProfile({ onBack, onJoinRoom, targetUser }: PublicProfileProps) {
  const [user, setUser] = useState<UserProfile>({
    uid: '',
    name: 'Loading...',
    displayAccountNumber: '',
    photo: '/default-avatar.png',
    coverPhoto: '/cover.png',
    gender: '♀',
    age: 18,
    followers: 0,
    bio: '',
    location: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    albumImages: [],
    officialTag: undefined,
    adminTag: undefined,
    vipTag: undefined,
    premiumTag: undefined
  })

  const [isSelf, setIsSelf] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [isEditingAge, setIsEditingAge] = useState(false)
  const [showCountrySelector, setShowCountrySelector] = useState(false)
  const [tempName, setTempName] = useState('')
  const [tempBio, setTempBio] = useState('')
  const [tempAge, setTempAge] = useState('18')
  const [isCountryLocked, setIsCountryLocked] = useState(false)

  const [albumImages, setAlbumImages] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<'profile' | 'cover' | 'album' | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const albumInputRef = useRef<HTMLInputElement>(null)

  const [showChat, setShowChat] = useState(false)

  const isSpecialAccount = SPECIAL_ACCOUNTS.hasOwnProperty(user.uid || '')

  const saveToFirestore = async (updateData: Record<string, any>) => {
    const currentUid =
      user.uid || localStorage.getItem('userUID') || localStorage.getItem('userPhone')
    if (currentUid && currentUid !== 'N/A') {
      try {
        await updateUser({ id: currentUid, appLongId: currentUid, ...updateData })

        const roomUpdateData = { ...updateData }
        delete roomUpdateData.name
        delete roomUpdateData.displayName
        delete roomUpdateData.userName
        delete roomUpdateData.image
        delete roomUpdateData.photo
        delete roomUpdateData.photoURL
        delete roomUpdateData.coverPhoto
        delete roomUpdateData.coverImage

        if (Object.keys(roomUpdateData).length > 0) {
          await updateRoom({ roomId: currentUid, id: currentUid, ...roomUpdateData })
        }
      } catch (err) {
        console.error('Error saving data to Google Sheets:', err)
      }
    }
  }

  // Save current user data to IndexedDB
  const saveCurrentUserToDB = async () => {
    const uid = user.uid || localStorage.getItem('userUID') || localStorage.getItem('userPhone');
    if (uid && uid !== 'N/A') {
      const profileData = {
        uid: uid,
        name: user.name,
        displayAccountNumber: user.displayAccountNumber,
        photo: user.photo,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        country: user.location,
        countryCode: user.countryCode,
        gender: user.gender,
        age: user.age,
        followers: user.followers,
        albumImages: albumImages,
        officialTag: user.officialTag,
        adminTag: user.adminTag,
        vipTag: user.vipTag,
        premiumTag: user.premiumTag,
      };
      await saveProfileToDB(profileData);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      let isViewingSelf = false
      let uid = ''

      if (targetUser && targetUser.uid) {
        const currentSelfUid = localStorage.getItem('userUID') || localStorage.getItem('userPhone')
        if (targetUser.uid === currentSelfUid) {
          isViewingSelf = true
          uid = currentSelfUid
        } else {
          isViewingSelf = false
          uid = targetUser.uid
        }
      } else {
        isViewingSelf = true
        uid = localStorage.getItem('userUID') || localStorage.getItem('userPhone') || 'N/A'
      }

      setIsSelf(isViewingSelf)

      let initialName = localStorage.getItem('userName') || ''
      let photo = localStorage.getItem('userPhoto') || '/default-avatar.png'
      let coverPhoto = localStorage.getItem('userCoverPhoto') || '/cover.png'
      let storedBio = localStorage.getItem('userBio') || ''
      let storedCountry = localStorage.getItem('userCountry') || 'India'
      let storedCountryCode = localStorage.getItem('userCountryCode') || 'IN'
      let storedGender: '♂' | '♀' = (localStorage.getItem('userGender') as '♂' | '♀') || '♀'
      let storedAge = localStorage.getItem('userAge') || '18'
      let storedFollowers = 0
      let officialTag: string | undefined = undefined
      let adminTag: string | undefined = undefined
      let vipTag: string | undefined = undefined
      let premiumTag: string | undefined = undefined

      const storedAlbum = localStorage.getItem('userAlbumImages')
      if (storedAlbum) {
        setAlbumImages(JSON.parse(storedAlbum))
      }

      let displayAccNum = localStorage.getItem('accountNumber') || ''

      // Target User lookup
      if (!isViewingSelf && targetUser) {
        const targetUid = targetUser.uid
        initialName = targetUser.name || ''
        photo = targetUser.photo || '/default-avatar.png'
        displayAccNum = targetUser.accountNumber || getOrCreateAccountNumber(targetUid)

        const cachedProfile = await loadProfileFromDB(targetUid);
        if (cachedProfile && isMounted) {
          const matchedCountry = COUNTRIES.find(
            (c) =>
              c.code === cachedProfile.countryCode || c.name === cachedProfile.country || c.flag === cachedProfile.country
          ) || { name: 'India', flag: '🇮🇳', code: 'IN' }

          setUser({
            uid: targetUid,
            name: isValidName(cachedProfile.name) ? cachedProfile.name : (isValidName(initialName) ? initialName : targetUid.substring(0, 8)),
            displayAccountNumber: cachedProfile.displayAccountNumber || displayAccNum,
            photo: cachedProfile.photo || photo,
            coverPhoto: cachedProfile.coverPhoto || '/cover.png',
            gender: cachedProfile.gender || '♀',
            age: cachedProfile.age || 18,
            followers: cachedProfile.followers || 0,
            bio: cachedProfile.bio || '',
            location: matchedCountry.name,
            flag: matchedCountry.flag,
            countryCode: matchedCountry.code,
            albumImages: cachedProfile.albumImages || [],
            officialTag: cachedProfile.officialTag || officialTag,
            adminTag: cachedProfile.adminTag || adminTag,
            vipTag: cachedProfile.vipTag || vipTag,
            premiumTag: cachedProfile.premiumTag || premiumTag,
          });
          setAlbumImages(cachedProfile.albumImages || []);
        }

        try {
          const res = await getUser(targetUid);
          const data = res && (res.user || res.data || res);

          if (isMounted && data && (data.id || data.AppLongId || data['App long ID'] || data.Name || data.name)) {
            displayAccNum = data.accountId || data.accountNumber || data['Account Number']
              ? String(data.accountId || data.accountNumber || data['Account Number'])
              : displayAccNum;

            const docName = data.name || data.Name || data.displayName || data.userName || data.fullName;
            const finalName = isValidName(docName) ? docName : (isValidName(initialName) ? initialName : targetUid.substring(0, 8));

            photo = data.photo || data.photoURL || data.image || data.avatar || data.Avtar || photo;
            coverPhoto = data.coverPhoto || data.coverImage || data.backCover || data['Back Cover'] || coverPhoto;
            let bio = data.bio || data.Bio || data.about || '';
            let country = data.country || data.Country || data.location || 'India';
            let countryCode = data.countryCode || 'IN';
            let gender = data.gender || data.Gender || '♀';
            let age = data.age || data.Age ? parseInt(data.age || data.Age) : 18;
            let followers = data.followers !== undefined ? data.followers : 0;
            let officialTag = data.officialTag;
            let adminTag = data.adminTag;
            let vipTag = data.vipTag;
            let premiumTag = data.premiumTag;

            let album = [];
            if (data.albumImages && Array.isArray(data.albumImages)) {
              album = data.albumImages;
            } else if (data.album && Array.isArray(data.album)) {
              album = data.album;
            }

            if (!displayAccNum) {
              displayAccNum = getOrCreateAccountNumber(targetUid);
            }

            const matchedCountry = COUNTRIES.find(
              (c) =>
                c.code === countryCode || c.name === country || c.flag === country
            ) || { name: 'India', flag: '🇮🇳', code: 'IN' };

            const profileData = {
              uid: targetUid,
              name: finalName,
              displayAccountNumber: displayAccNum,
              photo,
              coverPhoto,
              gender: gender === 'female' || gender === '♀' ? '♀' : '♂',
              age,
              followers,
              bio,
              location: matchedCountry.name,
              flag: matchedCountry.flag,
              countryCode: matchedCountry.code,
              albumImages: album,
              officialTag,
              adminTag,
              vipTag,
              premiumTag,
            };

            setAlbumImages(album);
            setUser(profileData);
            await saveProfileToDB(profileData);
          }
        } catch (err) {
          console.warn('Google Sheets fetch error for Target User:', err);
        }
        return;
      }

      // Current User lookup
      if (uid && uid !== 'N/A') {
        try {
          const res = await getUser(uid);
          const data = res && (res.user || res.data || res);

          if (isMounted && data && (data.id || data.AppLongId || data['App long ID'] || data.Name || data.name)) {
            if (data.accountId || data.accountNumber || data['Account Number']) {
              displayAccNum = String(data.accountId || data.accountNumber || data['Account Number'])
              localStorage.setItem('accountNumber', displayAccNum)
            }
            const docName = data.name || data.Name || data.displayName || data.userName
            if (isValidName(docName)) {
              storedName = docName
              localStorage.setItem('userName', storedName)
            }
            if (data.photo || data.photoURL || data.image || data.avatar || data.Avtar) {
              photo = data.photo || data.photoURL || data.image || data.avatar || data.Avtar || photo
              localStorage.setItem('userPhoto', photo)
            }
            if (data.coverPhoto || data.coverImage || data.backCover || data['Back Cover']) {
              coverPhoto = data.coverPhoto || data.coverImage || data.backCover || data['Back Cover'] || coverPhoto
              localStorage.setItem('userCoverPhoto', coverPhoto)
            }
            if (data.bio || data.Bio) {
              storedBio = data.bio || data.Bio
              localStorage.setItem('userBio', storedBio)
            }
            if (data.country || data.Country || data.location) {
              storedCountry = data.country || data.Country || data.location
              localStorage.setItem('userCountry', storedCountry)
            }
            if (data.countryCode) {
              storedCountryCode = data.countryCode
              localStorage.setItem('userCountryCode', storedCountryCode)
            }
            if (data.gender || data.Gender) {
              storedGender = (data.gender || data.Gender) as any
              localStorage.setItem('userGender', storedGender)
            }
            if (data.age || data.Age) {
              storedAge = String(data.age || data.Age)
              localStorage.setItem('userAge', storedAge)
            }
            if (data.albumImages && Array.isArray(data.albumImages)) {
              setAlbumImages(data.albumImages)
              localStorage.setItem('userAlbumImages', JSON.stringify(data.albumImages))
            }

            if (!displayAccNum) {
              displayAccNum = getOrCreateAccountNumber(uid)
            }
          }

          if (!isValidName(storedName)) {
            storedName = displayAccNum
          }

          const matchedCountry = COUNTRIES.find(
            (c) =>
              c.code === storedCountryCode || c.name === storedCountry || c.flag === storedCountry
          ) || { name: 'India', flag: '🇮🇳', code: 'IN' }

          if (isMounted) {
            setUser({
              uid: uid,
              name: storedName,
              displayAccountNumber: displayAccNum,
              photo: photo,
              coverPhoto: coverPhoto,
              gender: storedGender === 'female' || storedGender === '♀' ? '♀' : '♂',
              age: parseInt(storedAge) || 18,
              followers: storedFollowers,
              bio: storedBio,
              location: matchedCountry.name,
              flag: matchedCountry.flag,
              countryCode: matchedCountry.code,
              albumImages: albumImages,
              officialTag: officialTag,
              adminTag: adminTag,
              vipTag: vipTag,
              premiumTag: premiumTag,
            })

            saveCurrentUserToDB()
          }
        } catch (err) {
          console.warn('Google Sheets fetch error for Current User:', err);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [targetUser]);

  const copyId = () => {
    navigator.clipboard.writeText(user.displayAccountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenderToggle = async () => {
    if (!isSelf) return
    const newGender = user.gender === '♂' ? '♀' : '♂'
    setUser((prev) => ({ ...prev, gender: newGender }))
    localStorage.setItem('userGender', newGender)
    await saveToFirestore({ gender: newGender })
    saveCurrentUserToDB()
  }

  const handleCountrySelect = async (countryName: string, flag: string, code: string) => {
    if (!isSelf || isCountryLocked) return
    setUser((prev) => ({
      ...prev,
      location: countryName,
      flag: flag,
      countryCode: code,
    }))
    localStorage.setItem('userCountry', countryName)
    localStorage.setItem('userCountryCode', code)
    localStorage.setItem('userCountryLocked', 'true')
    setIsCountryLocked(true)
    setShowCountrySelector(false)

    await saveToFirestore({
      country: countryName,
      countryCode: code,
      countryLocked: true,
      setupComplete: true
    })
    saveCurrentUserToDB()
  }

  const handleNameSave = async () => {
    if (!isSelf) return
    if (tempName.trim()) {
      setUser((prev) => ({ ...prev, name: tempName }))
      localStorage.setItem('userName', tempName)
      await saveToFirestore({ name: tempName, displayName: tempName, userName: tempName })
      saveCurrentUserToDB()
    }
    setIsEditingName(false)
  }

  const handleBioSave = async () => {
    if (!isSelf) return
    setUser((prev) => ({ ...prev, bio: tempBio }))
    localStorage.setItem('userBio', tempBio)
    await saveToFirestore({ bio: tempBio, about: tempBio })
    saveCurrentUserToDB()
    setIsEditingBio(false)
  }

  const handleAgeSave = async () => {
    if (!isSelf) return
    const ageNum = parseInt(tempAge) || 18
    setUser((prev) => ({ ...prev, age: ageNum }))
    localStorage.setItem('userAge', tempAge)
    await saveToFirestore({ age: ageNum })
    saveCurrentUserToDB()
    setIsEditingAge(false)
  }

  const compressAndConvertImage = (
    file: File,
    maxWidth: number,
    quality: number = 0.7
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = (maxWidth * height) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas context failed'))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          const dataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(dataUrl)
        }
        img.onerror = (error) => reject(error)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSelf) return
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressedBase64 = await compressAndConvertImage(file, 400, 0.7)
        setUser((prev) => ({ ...prev, photo: compressedBase64 }))
        localStorage.setItem('userPhoto', compressedBase64)

        await saveToFirestore({
          photo: compressedBase64,
          photoURL: compressedBase64,
          image: compressedBase64,
          avatar: compressedBase64
        })
        saveCurrentUserToDB()
      } catch (err) {
        console.error('Error compressing avatar image:', err)
      }
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSelf) return
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressedBase64 = await compressAndConvertImage(file, 800, 0.7)
        setUser((prev) => ({ ...prev, coverPhoto: compressedBase64 }))
        localStorage.setItem('userCoverPhoto', compressedBase64)

        await saveToFirestore({
          coverPhoto: compressedBase64,
          coverImage: compressedBase64,
          backCover: compressedBase64
        })
        saveCurrentUserToDB()
      } catch (err) {
        console.error('Error compressing cover image:', err)
      }
    }
  }

  const handleAlbumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSelf) return
    const file = e.target.files?.[0]
    if (file && albumImages.length < 3) {
      try {
        const compressedBase64 = await compressAndConvertImage(file, 600, 0.7)
        const updatedAlbum = [...albumImages, compressedBase64]
        setAlbumImages(updatedAlbum)
        localStorage.setItem('userAlbumImages', JSON.stringify(updatedAlbum))

        await saveToFirestore({
          albumImages: updatedAlbum,
          album: updatedAlbum
        })
        saveCurrentUserToDB()
      } catch (err) {
        console.error('Error compressing album image:', err)
      }
    }
  }

  const handleOpenPhotoPreview = (type: 'profile' | 'cover' | 'album', src: string) => {
    setSelectedPhotoForPreview(type)
    setPreviewImage(src)
  }

  const handleReplacePhotoFromPreview = () => {
    if (!isSelf) return
    setPreviewImage(null)

    if (selectedPhotoForPreview === 'profile' && avatarInputRef.current) {
      avatarInputRef.current.click()
    } else if (selectedPhotoForPreview === 'cover' && coverInputRef.current) {
      coverInputRef.current.click()
    } else if (selectedPhotoForPreview === 'album' && albumInputRef.current) {
      albumInputRef.current.click()
    }
  }

  // Active user data
  const currentUid = localStorage.getItem('userUID') || 'N/A'
  const currentName = localStorage.getItem('userName') || 'Me'
  const currentPhoto = localStorage.getItem('userPhoto') || '/default-avatar.png'

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto relative overflow-hidden font-sans">

      {/* Hidden File Inputs */}
      {isSelf && (
        <>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={albumInputRef}
            onChange={handleAlbumUpload}
            accept="image/*"
            className="hidden"
          />
        </>
      )}

      {/* Background Cover Area */}
      <div className="relative h-64 w-full bg-slate-800 flex-shrink-0">
        <img
          src={user.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => handleOpenPhotoPreview('cover', user.coverPhoto)}
        />

        {/* Cover Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

        {/* Top Header Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pt-[calc(env(safe-area-inset-top)+8px)]">
          <button
            onClick={onBack || (() => window.history.back())}
            className="p-2 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/50 transition cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Edit Cover Camera Button */}
        {isSelf && (
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition shadow-lg cursor-pointer"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 -mt-10 relative z-20 pb-24">

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center relative">

          {/* Avatar Container */}
          <div className="relative -mt-16 mb-3">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 relative group cursor-pointer">
              <img
                src={user.photo}
                alt={user.name}
                className="w-full h-full object-cover"
                onClick={() => handleOpenPhotoPreview('profile', user.photo)}
              />
            </div>

            {/* Avatar Edit Camera Button */}
            {isSelf && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition cursor-pointer border-2 border-white"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Name & Special Tags */}
          <div className="flex items-center gap-2 mb-1 justify-center flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{user.name}</h1>

            {/* Tag Badges */}
            {user.officialTag && (
              <span className="bg-blue-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                OFFICIAL
              </span>
            )}
            {user.adminTag && (
              <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                ADMIN
              </span>
            )}
            {user.vipTag && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                VIP
              </span>
            )}
          </div>

          {/* Account ID & Copy */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600 mb-3 cursor-pointer hover:bg-slate-200 transition" onClick={copyId}>
            <span>ID: {user.displayAccountNumber}</span>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            {copied && <span className="text-green-600 text-[10px] font-bold ml-1">Copied!</span>}
          </div>

          {/* Badges Row (Gender, Age, Location) */}
          <div className="flex items-center gap-2 justify-center flex-wrap mb-4">

            {/* Gender & Age Badge */}
            <button
              onClick={handleGenderToggle}
              disabled={!isSelf}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm transition ${
                user.gender === '♀' ? 'bg-pink-500' : 'bg-blue-500'
              } ${isSelf ? 'hover:opacity-90 cursor-pointer' : ''}`}
            >
              <span>{user.gender}</span>
              <span>{user.age}</span>
            </button>

            {/* Country / Location Badge */}
            <button
              onClick={() => isSelf && !isCountryLocked && setShowCountrySelector(true)}
              disabled={!isSelf || isCountryLocked}
              className={`flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs ${
                isSelf && !isCountryLocked ? 'hover:bg-slate-200 cursor-pointer' : ''
              }`}
            >
              <span className="text-sm">{user.flag}</span>
              <span>{user.location}</span>
            </button>
          </div>

          {/* Bio Section */}
          <div className="w-full bg-slate-50 rounded-2xl p-3 text-xs text-slate-600 relative border border-slate-100">
            <p className="whitespace-pre-wrap leading-relaxed">{user.bio || 'No bio yet.'}</p>
            {isSelf && (
              <button
                onClick={() => {
                  setTempBio(user.bio)
                  setIsEditingBio(true)
                }}
                className="absolute top-2 right-2 text-slate-400 hover:text-blue-600 p-1 rounded-full transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Album Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">Album ({albumImages.length}/3)</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {albumImages.map((src, index) => (
              <div
                key={index}
                onClick={() => handleOpenPhotoPreview('album', src)}
                className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 relative group cursor-pointer shadow-2xs"
              >
                <img src={src} alt={`Album ${index}`} className="w-full h-full object-cover" />
              </div>
            ))}

            {isSelf && albumImages.length < 3 && (
              <button
                onClick={() => albumInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition cursor-pointer bg-slate-50/50"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-semibold">Upload</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Floating Action Bar for non-self viewing */}
      {!isSelf && (
        <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center gap-3">
          <button
            onClick={() => setShowChat(true)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat</span>
          </button>
        </div>
      )}

      {/* Country Selector Modal */}
      {showCountrySelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Select Country</h3>
              <button
                onClick={() => setShowCountrySelector(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-1 pr-1">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCountrySelect(c.name, c.flag, c.code)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition cursor-pointer text-left border border-transparent hover:border-slate-100"
                >
                  <span className="text-2xl">{c.flag}</span>
                  <span className="text-sm font-semibold text-slate-700 flex-1">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Bio Modal */}
      {isEditingBio && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-800 text-lg mb-3">Edit Bio</h3>
            <textarea
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              maxLength={150}
              rows={4}
              placeholder="Write something about yourself..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditingBio(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBioSave}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview / Change Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-between p-4">
          <div className="w-full flex justify-end">
            <button
              onClick={() => setPreviewImage(null)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center w-full max-h-[75vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
          </div>

          <div className="w-full max-w-xs flex gap-3 mb-6">
            {isSelf && (
              <button
                onClick={handleReplacePhotoFromPreview}
                className="flex-1 bg-white text-slate-900 font-bold py-3 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition cursor-pointer text-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Change Photo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Embedded Fullscreen WebRTC Chat Screen */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-white">
          <ChatScreen
            chatId={`${[currentUid, user.uid].sort().join('_')}`}
            currentUser={{
              uid: currentUid,
              name: currentName,
              photo: currentPhoto,
            }}
            targetUser={{
              uid: user.uid,
              name: user.name,
              photo: user.photo,
            }}
            onBack={() => setShowChat(false)}
            onJoinRoom={onJoinRoom}
          />
        </div>
      )}
    </div>
  )
}
