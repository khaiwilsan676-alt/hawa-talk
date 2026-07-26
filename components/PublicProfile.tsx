'use client'

import React, { useEffect, useState } from 'react'
import { ChevronLeft, Edit3, MapPin, Copy, Camera, ChevronRight, X } from 'lucide-react'

interface PublicProfileProps {
  onBack?: () => void
}

const getOrCreateAccountNumber = (uid: string) => {
  if (!uid || uid === 'N/A') return '100379620'
  
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
  const [user, setUser] = useState({
    name: "KāβiR Khān",
    uid: "",
    displayAccountNumber: "100379620",
    photo: "",
    gender: "♂",
    age: 24,
    followers: 862,
    bio: "",
    location: "India"
  })

  const [showEditSheet, setShowEditSheet] = useState(false)
  const [editName, setEditName] = useState("")
  const [editAge, setEditAge] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editGender, setEditGender] = useState("") // empty = not selected, "male"/"female"
  const [genderLocked, setGenderLocked] = useState(false)

  useEffect(() => {
    // Sync values with local storage
    const storedName = localStorage.getItem("userName")
    const uid = localStorage.getItem("userUID") || localStorage.getItem("userPhone") || "N/A"
    const photo = localStorage.getItem("userPhoto") || ""

    const fullAccNum = getOrCreateAccountNumber(uid)
    const displayAccNum = fullAccNum !== 'N/A' ? fullAccNum.slice(0, 8) : '100379620'

    setUser(prev => ({
      ...prev,
      name: storedName || prev.name,
      uid: uid,
      displayAccountNumber: displayAccNum,
      photo: photo || prev.photo
    }))

    // Initialize edit fields
    setEditName(storedName || "KāβiR Khān")
    setEditAge("24")
    setEditBio("")
    
    // Check if gender was already locked
    const lockedGender = localStorage.getItem("userGenderLocked")
    if (lockedGender) {
      setEditGender(lockedGender)
      setGenderLocked(true)
    }
  }, [])

  const handleCopyID = () => {
    if (user.displayAccountNumber) {
      navigator.clipboard.writeText(user.displayAccountNumber)
    }
  }

  const handleOpenEditSheet = () => {
    setEditName(user.name)
    setEditAge(user.age.toString())
    setEditBio(user.bio)
    setShowEditSheet(true)
  }

  const handleCloseEditSheet = () => {
    setShowEditSheet(false)
  }

  const handleGenderSelect = (gender: string) => {
    if (genderLocked) return // Don't allow change if locked
    
    setEditGender(gender)
    setGenderLocked(true)
    localStorage.setItem("userGenderLocked", gender)
    
    // Update user state
    setUser(prev => ({
      ...prev,
      gender: gender === "male" ? "♂" : "♀"
    }))
  }

  const handleSaveEdit = () => {
    // Save to localStorage
    localStorage.setItem("userName", editName)
    if (editAge) localStorage.setItem("userAge", editAge)
    if (editBio) localStorage.setItem("userBio", editBio)
    
    // Update user state
    setUser(prev => ({
      ...prev,
      name: editName,
      age: parseInt(editAge) || prev.age,
      bio: editBio
    }))
    
    setShowEditSheet(false)
  }

  return (
    <div className="w-full bg-white min-h-screen text-gray-900 pb-10 relative">
      {/* Cover Image & Header Section */}
      <div className="relative w-full h-[340px] bg-gray-800">
        {/* User's Avatar used as Cover Background */}
        {user.photo ? (
          <img
            src={user.photo}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-4xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Top Action Bar - Plain icons without background */}
        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between z-10">
          <button 
            onClick={onBack}
            className="text-white"
          >
            <ChevronLeft size={28} />
          </button>
          
          <button 
            onClick={handleOpenEditSheet}
            className="text-white"
          >
            <Edit3 size={22} />
          </button>
        </div>

        {/* Online Status Badge */}
        <div className="absolute top-16 right-4 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          Online
        </div>

        {/* User Avatar Circle Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center">
          <div className="w-28 h-28 rounded-full shadow-lg overflow-hidden border-2 border-white bg-gray-700">
            {user.photo ? (
              <img
                src={user.photo}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Details Section */}
      <div className="px-5 pt-8">
        {/* Name (Black) & Gender/Age */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-black tracking-wide">{user.name}</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
            {user.gender} {user.age}
          </span>
        </div>

        {/* ID & Followers */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 font-medium">
          <div className="flex items-center gap-1">
            <span>ID:{user.displayAccountNumber}</span>
            <button onClick={handleCopyID} className="text-gray-400 hover:text-gray-600">
              <Copy size={12} />
            </button>
          </div>
          <span>|</span>
          <span>{user.followers} Followers</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-3">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-base">🇮🇳</span>
          <span>{user.location}</span>
        </div>

        {/* Bio Section */}
        {user.bio && (
          <div className="flex items-start gap-2 text-xs text-gray-500 mt-2">
            <Edit3 size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="italic">{user.bio}</p>
          </div>
        )}
      </div>

      {/* Content Section (Albums Only) */}
      <div className="px-5 mt-6">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Albums</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img src="/1784480382765~2.jpg" alt="Album 1" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img src="/1784480368941~2.jpg" alt="Album 2" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img src="/IMG_20260720_142332.png" alt="Album 3" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img src="/IMG_20260720_142227.png" alt="Album 4" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Bottom Sheet */}
      {showEditSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseEditSheet}
          ></div>
          
          {/* Bottom Sheet */}
          <div className="relative bg-white w-full max-w-md rounded-t-3xl animate-slide-up" style={{ height: '50vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <button onClick={handleCloseEditSheet}>
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              <h2 className="text-lg font-bold text-gray-900">Edit Information</h2>
              <div className="w-6"></div> {/* Spacer for centering */}
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-5 py-4 space-y-4" style={{ height: 'calc(50vh - 60px)' }}>
              {/* Row 1: Avatar */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Avatar</span>
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                  {user.photo ? (
                    <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Album */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Album</span>
                <button className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Camera size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Row 3: Add Photo */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700"></span>
                <button className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
                  <span className="text-2xl text-gray-400">+</span>
                </button>
              </div>

              {/* Row 4: Name */}
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

              {/* Row 5: Age */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Age</span>
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="text-sm text-gray-900 text-right bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none px-2 py-1 w-48"
                  placeholder="0"
                  min="0"
                  max="150"
                />
              </div>

              {/* Row 6: Bio */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Bio</span>
                <button className="flex items-center gap-1 text-sm text-gray-400">
                  <span>Add bio</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Row 7: Gender */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Gender</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenderSelect("male")}
                    disabled={genderLocked && editGender !== "male"}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      editGender === "male"
                        ? "bg-blue-500 text-white"
                        : genderLocked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                        : genderLocked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    ♀ Female
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-gray-100">
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

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
                }
