'use client' 

import React, { useEffect, useState, useRef } from 'react'
import { ChevronLeft, Edit3, MapPin, Copy, Camera, ChevronRight, X } from 'lucide-react'

interface PublicProfileProps {
  onBack?: () => void
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

const getOrCreateAccountNumber = (uid: string) => {
  if (!uid || uid === 'N/A') return '100379620'

  // Check if this is a special account
  if (SPECIAL_ACCOUNTS[uid]) {
    return SPECIAL_ACCOUNTS[uid]
  }

  const storageKey = `user_account_number_${uid}`
  let savedAccountNumber = localStorage.getItem(storageKey)

  if (!savedAccountNumber) {
    const targetLength = uid.length
    let numericStr = ''
    for (let i = 0; i < targetLength; i++) {
      numericStr += Math.floor(Math.random() * 10).toString()
    }
    savedAccountNumber = numericStr
    localStorage.setItem(storageKey, savedAccountNumber)
  }

  return savedAccountNumber
}

export default function PublicProfile({ onBack }: PublicProfileProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const albumInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState({
    name: "KāβiR Khān",
    uid: "",
    displayAccountNumber: "100379620",
    photo: "",
    coverPhoto: "",
    gender: "♂",
    age: 24,
    followers: 862,
    bio: "",
    location: "",
    flag: ""
  })

  const [albumImages, setAlbumImages] = useState<string[]>([])
  
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [editName, setEditName] = useState("")
  const [editAge, setEditAge] = useState("")
  const [editBio, setEditBio] = useState("")
  
  const [editGender, setEditGender] = useState("")
  const [genderLocked, setGenderLocked] = useState(false)
  
  const [editCountry, setEditCountry] = useState("")
  const [countryLocked, setCountryLocked] = useState(false)
  
  const [showBioInput, setShowBioInput] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Full image view state
  const [fullImageView, setFullImageView] = useState<string | null>(null)

  // Check if this is a special account for UI modifications
  const isSpecialAccount = SPECIAL_ACCOUNTS.hasOwnProperty(user.uid || '')

  useEffect(() => {
    const storedName = localStorage.getItem("userName")
    const uid = localStorage.getItem("userUID") || localStorage.getItem("userPhone") || "N/A"
    const photo = localStorage.getItem("userPhoto") || ""
    const coverPhoto = localStorage.getItem("userCoverPhoto") || ""
    const storedBio = localStorage.getItem("userBio") || ""
    const storedCountry = localStorage.getItem("userCountry") || ""
    
    const storedAlbum = localStorage.getItem("userAlbumImages")
    if (storedAlbum) {
      setAlbumImages(JSON.parse(storedAlbum))
    }

    const fullAccNum = getOrCreateAccountNumber(uid)
    const displayAccNum = fullAccNum !== 'N/A' ? fullAccNum : '100379620'

    const matchedCountry = COUNTRIES.find(c => c.name === storedCountry)

    setUser(prev => ({
      ...prev,
      name: storedName || prev.name,
      uid: uid,
      displayAccountNumber: displayAccNum,
      photo: photo || prev.photo,
      coverPhoto: coverPhoto || prev.coverPhoto,
      bio: storedBio || prev.bio,
      location: storedCountry,
      flag: matchedCountry ? matchedCountry.flag : ""
    }))

    setEditName(storedName || "KāβiR Khān")
    setEditAge("24")
    setEditBio(storedBio || "")
    setEditCountry(storedCountry)

    const lockedGender = localStorage.getItem("userGenderLocked")
    if (lockedGender) {
      setEditGender(lockedGender)
      setGenderLocked(true)
    }

    const lockedCountryStatus = localStorage.getItem("userCountryLocked")
    if (lockedCountryStatus === "true") {
      setCountryLocked(true)
    }
  }, [])

  const handleCopyID = () => {
    if (isSpecialAccount) {
      // Special account - copy full number
      navigator.clipboard.writeText(user.displayAccountNumber)
    } else {
      // Regular account - copy only first 8 digits
      const first8Digits = user.displayAccountNumber.substring(0, 8)
      navigator.clipboard.writeText(first8Digits)
    }
  }

  const handleOpenEditSheet = () => {
    setEditName(user.name)
    setEditAge(user.age.toString())
    setEditBio(user.bio)
    setEditCountry(user.location)
    setShowEditSheet(true)
  }

  const handleCloseEditSheet = () => {
    setShowEditSheet(false)
    setShowBioInput(false)
  }

  const handleGenderSelect = (gender: string) => {
    if (genderLocked) return
    setEditGender(gender)
    setGenderLocked(true)
    localStorage.setItem("userGenderLocked", gender)
    setUser(prev => ({ ...prev, gender: gender === "male" ? "♂" : "♀" }))
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
      reader.onloadend = () => {
        const base64String = reader.result as string
        localStorage.setItem("userPhoto", base64String)
        setUser(prev => ({ ...prev, photo: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        localStorage.setItem("userCoverPhoto", base64String)
        setUser(prev => ({ ...prev, coverPhoto: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveCoverPhoto = () => {
    localStorage.removeItem("userCoverPhoto")
    setUser(prev => ({ ...prev, coverPhoto: "" }))
  }

  const handleAlbumUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (albumImages.length >= 4) {
        alert("You can only upload up to 4 images in the album.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        const updatedAlbum = [...albumImages, base64String]
        setAlbumImages(updatedAlbum)
        localStorage.setItem("userAlbumImages", JSON.stringify(updatedAlbum))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAlbumImage = (indexToRemove: number) => {
    const updated = albumImages.filter((_, index) => index !== indexToRemove)
    setAlbumImages(updated)
    localStorage.setItem("userAlbumImages", JSON.stringify(updated))
  }

  const handleSaveEdit = () => {
    localStorage.setItem("userName", editName)
    if (editAge) localStorage.setItem("userAge", editAge)
    if (editBio) localStorage.setItem("userBio", editBio)
    
    if (editCountry) {
      localStorage.setItem("userCountry", editCountry)
      localStorage.setItem("userCountryLocked", "true")
      setCountryLocked(true)
    }

    const matchedCountry = COUNTRIES.find(c => c.name === editCountry)

    setUser(prev => ({
      ...prev,
      name: editName,
      age: parseInt(editAge) || prev.age,
      bio: editBio,
      location: editCountry,
      flag: matchedCountry ? matchedCountry.flag : prev.flag
    }))

    setShowEditSheet(false)
    setShowBioInput(false)
  }

  const handleBioSave = () => {
    localStorage.setItem("userBio", editBio)
    setUser(prev => ({ ...prev, bio: editBio }))
    setShowBioInput(false)
  }

  // Get display ID: first 8 digits for regular, full for special
  const getDisplayID = () => {
    if (isSpecialAccount) {
      return user.displayAccountNumber
    }
    return user.displayAccountNumber.substring(0, 8)
  }

  return (
    <div className="w-full bg-white min-h-screen text-gray-900 pb-10 relative">
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
          <button onClick={handleOpenEditSheet} className="text-white"><Edit3 size={22} /></button>
        </div>

        <div className="absolute top-16 right-4 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> Online
        </div>

        <div className="absolute -bottom-8 left-6 flex items-center">
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
      <div className="flex flex-col gap-0.5">
  <div className="flex items-center gap-0.5">
    <h1 className="text-2xl font-bold text-black tracking-wide">{user.name}</h1>
    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
      {user.gender} {user.age}
    </span>
    <img src="/1785131462125.png" alt="Badge 1" className="h-9 w-auto object-contain" />
    <img src="/1785131792693.png" alt="Badge 2" className="h-9 w-auto object-contain" />
    <img src="/1785469775751.png" alt="Badge 3" className="h-7 w-auto object-contain" />
  </div>
  <div className="flex items-center gap-0.5">
    <img src="/1785469365805.png" alt="Badge 4" className="h-7 w-auto object-contain" />
  </div>
</div>
        {/* ID and Followers in one row */}
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
                    backgroundSize: '96%',
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
          <span className="text-gray-500">{user.followers} Followers</span>
        </div>

        {/* Level Badge - Below ID row */}
        <div className="mt-1 flex items-center -ml-2">
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
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-3">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-base">{user.flag}</span>
          <span className="text-gray-500">{user.location || "Select Country"}</span>
        </div>

        <div className="flex items-start gap-2 mt-2">
          <button onClick={handleOpenEditSheet} className="text-gray-400 hover:text-gray-600 mt-0.5 shrink-0">
            <Edit3 size={14} />
          </button>
          {user.bio ? (
            <p className="text-xs text-gray-500 italic">{user.bio}</p>
          ) : (
            <p className="text-xs text-gray-400 italic">Add bio...</p>
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

        {/* Other Tabs */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Vehicle</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091443553.png" alt="Vehicle" className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Medal</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091431545.png" alt="Medal" className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Frame</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091457562.png" alt="Frame" className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Gift</h3>
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <img src="/1785091520912.png" alt="Gift" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

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

      {/* Edit Profile Bottom Sheet */}
      {showEditSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseEditSheet}></div>

          <div className="relative bg-white w-full max-w-md rounded-t-3xl animate-slide-up flex flex-col h-[70vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <button onClick={handleCloseEditSheet}><ChevronLeft size={24} className="text-gray-700" /></button>
              <h2 className="text-lg font-bold text-gray-900">Edit Information</h2>
              <div className="w-6"></div>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1 pb-24">
              
              {/* Hidden Inputs for File Uploads */}
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

              {/* Background Cover - Now below Avatar */}
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

              {/* Album Upload & Management Section */}
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

              {/* Country Selection */}
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
                  <option value="" disabled>Select Country</option>
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
