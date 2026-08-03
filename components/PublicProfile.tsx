'use client' 

import React, { useEffect, useState, useRef } from 'react'
import { ChevronLeft, Edit3, MapPin, Copy, Camera, ChevronRight, X, Heart, MessageCircle } from 'lucide-react'
import { db } from "../src/lib/firebase"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"

export interface TargetUser {
  id?: string
  uid?: string
  name?: string
  displayAccountNumber?: string
  accountId?: string
  photo?: string
  image?: string
  coverPhoto?: string
  gender?: string
  age?: number | string
  followers?: number
  bio?: string
  location?: string
  country?: string
  flag?: string
}

interface PublicProfileProps {
  onBack?: () => void
  isOtherUser?: boolean // Set to true when viewing someone else's profile
  targetUser?: TargetUser | null // Passed target user data from Search or User card
}

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' }
]

// Special accounts configuration
const SPECIAL_ACCOUNTS: { [key: string]: string } = {
  'HUSxSvQnabgU029dWYt1TUV04hd2': '100002',
  'ADqW31RGBMaosOzy0HiqexKSD7h1': '100003'
}

// Official/Admin IDs list
const OFFICIAL_IDS = ['500001', '500002', '500003', '500004', '500005']
const ADMIN_IDS = ['700001', '700002', '700003']

const getOrCreateAccountNumber = (uid: string) => {
  if (!uid || uid === 'N/A') return '100379620'

  if (OFFICIAL_IDS.includes(uid) || ADMIN_IDS.includes(uid)) {
    return uid
  }

  if (SPECIAL_ACCOUNTS[uid]) {
    return SPECIAL_ACCOUNTS[uid]
  }

  // Check stored account number first
  const savedAcc = typeof window !== 'undefined' ? localStorage.getItem('accountNumber') : null
  if (savedAcc) {
    return savedAcc
  }

  const storageKey = `user_account_number_${uid}`
  let savedAccountNumber = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null

  if (!savedAccountNumber) {
    let hash = 0
    for (let i = 0; i < uid.length; i++) {
      hash = (hash << 5) - hash + uid.charCodeAt(i)
      hash |= 0
    }
    const positiveHash = Math.abs(hash)
    savedAccountNumber = String(10000000 + (positiveHash % 90000000))
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, savedAccountNumber)
    }
  }

  return savedAccountNumber
}

export default function PublicProfile({ onBack, isOtherUser = false, targetUser = null }: PublicProfileProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const albumInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState({
    name: "Hawa User",
    uid: "",
    displayAccountNumber: "100379620",
    photo: "",
    coverPhoto: "",
    gender: "♂",
    age: 24,
    followers: 0,
    bio: "",
    location: "India",
    flag: "🇮🇳"
  })

  const [albumImages, setAlbumImages] = useState<string[]>([])
  
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [editName, setEditName] = useState("")
  const [editAge, setEditAge] = useState("")
  const [editBio, setEditBio] = useState("")
  
  const [editGender, setEditGender] = useState("")
  const [genderLocked, setGenderLocked] = useState(false)
  
  const [editCountry, setEditCountry] = useState("India")
  const [countryLocked, setCountryLocked] = useState(false)
  
  const [showBioInput, setShowBioInput] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Full image view state
  const [fullImageView, setFullImageView] = useState<string | null>(null)

  // Follow State for Other User Profile
  const [isFollowing, setIsFollowing] = useState(false)

  // Check if this is a special account for UI modifications
  const isSpecialAccount = SPECIAL_ACCOUNTS.hasOwnProperty(user.uid || '')

  // Helper function: Direct Firestore "users" collection save
  const saveToFirestore = async (updateData: Record<string, any>) => {
    const currentUid = user.uid || localStorage.getItem("userUID") || localStorage.getItem("userPhone")
    if (currentUid && currentUid !== "N/A") {
      try {
        const userDocRef = doc(db, "users", currentUid)
        await setDoc(userDocRef, updateData, { merge: true })
      } catch (err) {
        console.error("Error saving data to Firestore users collection:", err)
      }
    }
  }

  useEffect(() => {
    let unsubscribe: () => void;

    const loadProfileData = async () => {
      // -------------------------------------------------------------
      // 1. IF VIEWING ANOTHER USER PROFILE (OTHER USER - REALTIME LISTEN)
      // -------------------------------------------------------------
      if (isOtherUser && targetUser) {
        const targetUid = targetUser.uid || targetUser.id || 'N/A'
        
        let displayAccNum = targetUser.displayAccountNumber || targetUser.accountId || ''
        let name = targetUser.name || "User"
        let photo = targetUser.photo || targetUser.image || ""
        let coverPhoto = targetUser.coverPhoto || ""
        let bio = targetUser.bio || ""
        let country = targetUser.location || targetUser.country || "India"
        let gender = targetUser.gender || "♂"
        let age = targetUser.age ? (typeof targetUser.age === 'number' ? targetUser.age : parseInt(targetUser.age)) : 22
        let followers = targetUser.followers || 0
        let album: string[] = []

        if (targetUid && targetUid !== "N/A") {
          try {
            const userDocRef = doc(db, "users", targetUid)
            
            // Real-time Listener so changes made by User B show instantly to User A
            unsubscribe = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data()
                
                displayAccNum = data.accountId ? String(data.accountId) : (data.displayAccountNumber || displayAccNum)
                name = data.name || data.displayName || data.userName || name
                photo = data.photo || data.photoURL || data.image || data.avatar || photo
                coverPhoto = data.coverPhoto || data.coverImage || coverPhoto
                bio = data.bio || data.about || bio
                country = data.country || data.location || country
                gender = data.gender || gender
                age = data.age ? parseInt(data.age) : age
                followers = data.followers !== undefined ? data.followers : followers
                
                if (data.albumImages && Array.isArray(data.albumImages)) {
                  album = data.albumImages
                } else if (data.album && Array.isArray(data.album)) {
                  album = data.album
                }

                if (!displayAccNum) {
                  displayAccNum = getOrCreateAccountNumber(targetUid)
                }

                const matchedCountry = COUNTRIES.find(c => c.name === country || c.flag === country) || { name: 'India', flag: '🇮🇳' }

                setAlbumImages(album)
                setUser({
                  name,
                  uid: targetUid,
                  displayAccountNumber: displayAccNum,
                  photo,
                  coverPhoto,
                  gender: gender === "female" || gender === "♀" ? "♀" : "♂",
                  age,
                  followers,
                  bio,
                  location: matchedCountry.name,
                  flag: matchedCountry.flag
                })
              }
            })
          } catch (err) {
            console.warn("Firestore fetch error for Target User:", err)
          }
        }
        return
      }

      // -------------------------------------------------------------
      // 2. IF VIEWING OWN PUBLIC PROFILE
      // -------------------------------------------------------------
      let storedName = localStorage.getItem("userName") || ""
      const uid = localStorage.getItem("userUID") || localStorage.getItem("userPhone") || "N/A"
      let photo = localStorage.getItem("userPhoto") || ""
      let coverPhoto = localStorage.getItem("userCoverPhoto") || ""
      let storedBio = localStorage.getItem("userBio") || ""
      let storedCountry = localStorage.getItem("userCountry") || "India"
      let storedAge = localStorage.getItem("userAge") || ""
      let storedGender = localStorage.getItem("userGenderLocked") || ""
      let isCountryLockedInStorage = localStorage.getItem("userCountryLocked") === "true"
      
      const storedAlbum = localStorage.getItem("userAlbumImages")
      if (storedAlbum) {
        setAlbumImages(JSON.parse(storedAlbum))
      }

      let displayAccNum = localStorage.getItem("accountNumber") || ""

      if (uid && uid !== "N/A") {
        try {
          const userDocRef = doc(db, "users", uid)
          const docSnap = await getDoc(userDocRef)
          if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.accountId) {
              displayAccNum = String(data.accountId)
              localStorage.setItem("accountNumber", displayAccNum)
            }
            if (data.name) storedName = data.name
            if (data.photo || data.photoURL || data.image) {
              photo = data.photo || data.photoURL || data.image || photo
            }
            if (data.coverPhoto || data.coverImage) {
              coverPhoto = data.coverPhoto || data.coverImage || coverPhoto
            }
            if (data.bio) storedBio = data.bio
            if (data.country || data.location) storedCountry = data.country || data.location
            if (data.countryLocked !== undefined) {
              isCountryLockedInStorage = data.countryLocked
              if (data.countryLocked) localStorage.setItem("userCountryLocked", "true")
            }
            if (data.gender) storedGender = data.gender
            if (data.age) storedAge = String(data.age)
            if (data.albumImages && Array.isArray(data.albumImages)) {
              setAlbumImages(data.albumImages)
            }
          }
        } catch (err) {
          console.warn("Firestore fetch error in PublicProfile:", err)
        }
      }

      if (!displayAccNum) {
        displayAccNum = getOrCreateAccountNumber(uid)
      }

      const matchedCountry = COUNTRIES.find(c => c.name === storedCountry) || { name: 'India', flag: '🇮🇳' }

      setUser(prev => ({
        ...prev,
        name: storedName || prev.name,
        uid: uid,
        displayAccountNumber: displayAccNum,
        photo: photo || prev.photo,
        coverPhoto: coverPhoto || prev.coverPhoto,
        bio: storedBio || prev.bio,
        location: matchedCountry.name,
        flag: matchedCountry.flag,
        gender: storedGender === "female" || storedGender === "♀" ? "♀" : "♂",
        age: storedAge ? parseInt(storedAge) : prev.age
      }))

      setEditName(storedName || "Hawa User")
      setEditAge(storedAge || "24")
      setEditBio(storedBio || "")
      setEditCountry(matchedCountry.name)
      setCountryLocked(isCountryLockedInStorage)

      if (storedGender) {
        setEditGender(storedGender === "female" || storedGender === "♀" ? "female" : "male")
        setGenderLocked(true)
      }
    }

    loadProfileData()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [isOtherUser, targetUser])

  const handleCopyID = () => {
    if (user.displayAccountNumber && user.displayAccountNumber !== 'N/A') {
      navigator.clipboard.writeText(user.displayAccountNumber)
      alert("ID Copied!")
    }
  }

  const handleOpenEditSheet = () => {
    if (isOtherUser) return
    setEditName(user.name)
    setEditAge(user.age.toString())
    setEditBio(user.bio)
    setEditCountry(user.location || "India")
    setShowEditSheet(true)
  }

  const handleCloseEditSheet = () => {
    setShowEditSheet(false)
    setShowBioInput(false)
  }

  const handleGenderSelect = async (gender: string) => {
    if (genderLocked) return
    setEditGender(gender)
    setGenderLocked(true)
    const formattedGender = gender === "male" ? "♂" : "♀"
    localStorage.setItem("userGenderLocked", gender)
    setUser(prev => ({ ...prev, gender: formattedGender }))
    
    // Save to Firestore "users" collection
    await saveToFirestore({ gender: formattedGender })
  }

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (countryLocked) return
    const selectedCountry = e.target.value
    setEditCountry(selectedCountry)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        localStorage.setItem("userPhoto", base64String)
        setUser(prev => ({ ...prev, photo: base64String }))
        
        // Save to Firestore "users" collection
        await saveToFirestore({ photo: base64String, image: base64String, photoURL: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        localStorage.setItem("userCoverPhoto", base64String)
        setUser(prev => ({ ...prev, coverPhoto: base64String }))
        
        // Save to Firestore "users" collection
        await saveToFirestore({ coverPhoto: base64String, coverImage: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveCoverPhoto = async () => {
    localStorage.removeItem("userCoverPhoto")
    setUser(prev => ({ ...prev, coverPhoto: "" }))
    
    // Save to Firestore "users" collection
    await saveToFirestore({ coverPhoto: "", coverImage: "" })
  }

  const handleAlbumUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (albumImages.length >= 4) {
        alert("You can only upload up to 4 images in the album.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        const updatedAlbum = [...albumImages, base64String]
        setAlbumImages(updatedAlbum)
        localStorage.setItem("userAlbumImages", JSON.stringify(updatedAlbum))
        
        // Save to Firestore "users" collection
        await saveToFirestore({ albumImages: updatedAlbum, album: updatedAlbum })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAlbumImage = async (indexToRemove: number) => {
    const updated = albumImages.filter((_, index) => index !== indexToRemove)
    setAlbumImages(updated)
    localStorage.setItem("userAlbumImages", JSON.stringify(updated))
    
    // Save to Firestore "users" collection
    await saveToFirestore({ albumImages: updated, album: updated })
  }

  const handleSaveEdit = async () => {
    localStorage.setItem("userName", editName)
    if (editAge) localStorage.setItem("userAge", editAge)
    if (editBio) localStorage.setItem("userBio", editBio)
    
    // Lock country ONE TIME permanently on Save
    if (editCountry) {
      localStorage.setItem("userCountry", editCountry)
      localStorage.setItem("userCountryLocked", "true")
      setCountryLocked(true)
    }

    const matchedCountry = COUNTRIES.find(c => c.name === editCountry) || { name: 'India', flag: '🇮🇳' }

    setUser(prev => ({
      ...prev,
      name: editName,
      age: parseInt(editAge) || prev.age,
      bio: editBio,
      location: matchedCountry.name,
      flag: matchedCountry.flag
    }))

    // ALL DETAILS SAVE TO FIRESTORE "users" COLLECTION
    await saveToFirestore({
      name: editName,
      displayName: editName,
      userName: editName,
      age: parseInt(editAge) || user.age,
      bio: editBio,
      about: editBio,
      country: matchedCountry.name,
      location: matchedCountry.name,
      countryLocked: true // Locked permanently in Firestore
    })

    setShowEditSheet(false)
    setShowBioInput(false)
  }

  const handleBioSave = async () => {
    localStorage.setItem("userBio", editBio)
    setUser(prev => ({ ...prev, bio: editBio }))
    setShowBioInput(false)
    
    // Save to Firestore "users" collection
    await saveToFirestore({ bio: editBio, about: editBio })
  }

  const getDisplayID = () => {
    return user.displayAccountNumber
  }

  // Follow Toggle Logic for target profile
  const handleToggleFollow = () => {
    setIsFollowing(prev => {
      const nextState = !prev
      setUser(u => ({
        ...u,
        followers: nextState ? u.followers + 1 : Math.max(0, u.followers - 1)
      }))
      return nextState
    })
  }

  return (
    <div className={`w-full bg-white min-h-screen text-gray-900 relative ${isOtherUser ? 'pb-24' : 'pb-10'}`}>
      {/* Cover Image & Header Section */}
      <div className="relative w-full h-[340px] bg-gray-800">
        {user.coverPhoto ? (
          <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        ) : user.photo ? (
          <img src={user.photo} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-4xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between z-10">
          <button onClick={onBack} className="text-white"><ChevronLeft size={28} /></button>
          {!isOtherUser && (
            <button onClick={handleOpenEditSheet} className="text-white"><Edit3 size={22} /></button>
          )}
        </div>

        <div className="absolute top-16 right-4 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> Online
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-1 left-6 flex items-center">
          <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden border-3 border-white bg-gray-700">
            {user.photo ? (
              <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Details Section */}
      <div className="px-5 pt-5">
        {/* Name + Gender + Badges */}
        <div className="flex flex-wrap items-center gap-0.5">
          <h1 className="text-2xl font-bold text-black tracking-wide">{user.name}</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-0.5 whitespace-nowrap">
            {user.gender} {user.age}
          </span>
          <img src="/1785131462125.png" alt="Badge 1" className="h-9 w-auto object-contain" />
          <img src="/1785131792693.png" alt="Badge 2" className="h-9 w-auto object-contain" />
          <img src="/1785469775751.png" alt="Badge 3" className="h-7 w-auto object-contain" />
          <img src="/1785469365805.png" alt="Badge 4" className="h-7 w-auto object-contain" />
        </div>

        {/* ID and Followers */}
        <div className="flex items-center gap-1 text-xs mt-0.5 font-medium">
          <div className="flex items-center gap-1">
            {isSpecialAccount ? (
              <>
                <span 
                  className="relative font-bold rounded text-white -ml-2.5"
                  style={{
                    backgroundImage: 'url(/1785137282040.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minWidth: '90px',
                    paddingLeft: '0px',
                    paddingRight: '5px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                  }}
                >
                  <span className="relative text-xs" style={{ paddingLeft: '32px' }}>
                    {user.displayAccountNumber}
                  </span>
                </span>
                <button onClick={handleCopyID} className="text-gray-400 hover:text-gray-600"><Copy size={12} /></button>
              </>
            ) : (
              <>
                <span className="text-gray-500">ID:{getDisplayID()}</span>
                <button onClick={handleCopyID} className="text-gray-400 hover:text-gray-600"><Copy size={12} /></button>
              </>
            )}
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">{user.followers} Fans</span>
        </div>

        {/* Level Badge */}
        <div className="mt-1 flex items-center gap-1 -ml-2">
          <div className="relative inline-flex items-center justify-center ml-0.5">
            <img 
              src="/1785137410522.png" 
              alt="Level Badge" 
              className="h-6 w-auto object-contain"
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm" style={{ paddingLeft: '10px' }}>
              Lv.1
            </span>
          </div>
          <img 
            src="/1785486414756.png" 
            alt="Level Side" 
            className="h-6 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-3">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-base">{user.flag}</span>
          <span className="text-gray-500">{user.location || "India"}</span>
        </div>

        <div className="flex items-start gap-2 mt-2">
          {!isOtherUser && (
            <button onClick={handleOpenEditSheet} className="text-gray-400 hover:text-gray-600 mt-0.5 shrink-0">
              <Edit3 size={14} />
            </button>
          )}
          {user.bio ? (
            <p className="text-xs text-gray-500 italic">{user.bio}</p>
          ) : (
            <p className="text-xs text-gray-400 italic">{isOtherUser ? "No bio added yet" : "Add bio..."}</p>
          )}
        </div>

        {/* Profile Tab Only */}
        <div className="flex gap-0 mt-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-2 text-sm font-semibold transition-colors relative ${
              activeTab === "profile" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            Profile
            {activeTab === "profile" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-blue-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Content Tabs Section */}
      <div className="px-5 mt-6 space-y-4">
        {/* Albums Tab */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2 flex justify-between items-center">
            Albums
            <span className="text-xs text-gray-400 font-normal">{albumImages.length}/4</span>
          </h3>
          {albumImages.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto">
              {albumImages.map((img, index) => (
                <div 
                  key={index} 
                  className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setFullImageView(img)}
                >
                  <img src={img} alt={`Album ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-28 rounded-2xl overflow-hidden bg-gray-100">
              <img src="/IMG_20260726_225835.jpg" alt="Default Album" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Vehicle */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Vehicle</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091443553.png" alt="Vehicle" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Medal */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Medal</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091431545.png" alt="Medal" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Frame */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Frame</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091457562.png" alt="Frame" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Gift */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Gift</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091520912.png" alt="Gift" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* FULL MATCHING BOTTOM ACTION BAR (Shows only when viewing another user's profile) */}
      {isOtherUser && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md px-6 py-3.5 border-t border-gray-100 flex items-center justify-between gap-4 max-w-md mx-auto shadow-lg">
          {/* Follow / Following Button */}
          <button
            onClick={handleToggleFollow}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#ff5874] to-[#ff6b8b] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 text-white font-medium text-lg shadow-md shadow-pink-200"
          >
            <Heart className="w-6 h-6 fill-white stroke-none" />
            <span>{isFollowing ? 'Following' : 'Follow'}</span>
          </button>

          {/* Chat Button */}
          <button
            onClick={() => alert("Chat opened!")}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#1dc4e9] to-[#1de9b6] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 text-white font-medium text-lg shadow-md shadow-cyan-200"
          >
            <MessageCircle className="w-6 h-6 fill-white stroke-none" />
            <span>Chat</span>
          </button>
        </div>
      )}

      {/* Full Image View Modal */}
      {fullImageView && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullImageView(null)}
        >
          <button 
            onClick={() => setFullImageView(null)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <X size={24} />
          </button>
          <img 
            src={fullImageView} 
            alt="Full view" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Edit Profile Bottom Sheet (Only rendered when viewing OWN profile) */}
      {!isOtherUser && showEditSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseEditSheet}></div>

          <div className="relative bg-white w-full max-w-md rounded-t-3xl animate-slide-up flex flex-col h-[70vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <button onClick={handleCloseEditSheet}><ChevronLeft size={24} className="text-gray-700" /></button>
              <h2 className="text-lg font-bold text-gray-900">Edit Information</h2>
              <div className="w-6"></div>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1 pb-24">
              
              <input type="file" ref={avatarInputRef} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              <input type="file" ref={albumInputRef} accept="image/*" onChange={handleAlbumUpload} className="hidden" />
              <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} className="hidden" />

              {/* Avatar */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Avatar</span>
                <div 
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 cursor-pointer"
                >
                  {user.photo ? (
                    <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Background Cover */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Background Cover</span>
                  <div className="flex items-center gap-2">
                    {user.coverPhoto && (
                      <button 
                        onClick={handleRemoveCoverPhoto}
                        className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                    <button 
                      onClick={() => coverInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <Camera size={14} /> Add Photo
                    </button>
                  </div>
                </div>
                {user.coverPhoto && (
                  <div className="w-full h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={user.coverPhoto} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Album Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Album Photos ({albumImages.length}/4)</span>
                  {albumImages.length < 4 && (
                    <button 
                      onClick={() => albumInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors"
                    >
                      <Camera size={14} /> Add Photo
                    </button>
                  )}
                </div>

                {albumImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {albumImages.map((img, idx) => (
                      <div key={idx} className="relative w-full h-16 rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveAlbumImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Name</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-sm text-gray-900 text-right bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none px-2 py-1 w-48"
                  placeholder="Enter name"
                />
              </div>

              {/* Age */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Age</span>
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="text-sm text-gray-900 text-right bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none px-2 py-1 w-48"
                  placeholder="0" min="0" max="150"
                />
              </div>

              {/* Bio */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Bio</span>
                {showBioInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="text-sm text-gray-900 text-right bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none px-2 py-1 w-36"
                      placeholder="Add bio" autoFocus
                    />
                    <button onClick={handleBioSave} className="text-xs text-blue-500 font-medium">Save</button>
                  </div>
                ) : (
                  <button onClick={() => setShowBioInput(true)} className="flex items-center gap-1 text-sm text-gray-400">
                    <span className="max-w-[180px] truncate">{editBio || "Add bio"}</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Country Selection (Default: India, Lock on first Save) */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Country</span>
                <select
                  value={editCountry}
                  onChange={handleCountrySelect}
                  disabled={countryLocked}
                  className={`text-sm text-right outline-none px-2 py-1 bg-transparent border-b w-48 ${
                    countryLocked ? 'text-gray-400 border-transparent cursor-not-allowed' : 'text-gray-900 border-gray-200 focus:border-blue-500'
                  }`}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Gender</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenderSelect("male")}
                    disabled={genderLocked && editGender !== "male"}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      editGender === "male"
                        ? "bg-blue-500 text-white"
                        : genderLocked ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    ♂ Male
                  </button>
                  <button
                    onClick={() => handleGenderSelect("female")}
                    disabled={genderLocked && editGender !== "female"}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      editGender === "female"
                        ? "bg-pink-500 text-white"
                        : genderLocked ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    ♀ Female
                  </button>
                </div>
              </div>

            </div>

            {/* Save Button */}
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-gray-100 shrink-0">
              <button
                onClick={handleSaveEdit}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

