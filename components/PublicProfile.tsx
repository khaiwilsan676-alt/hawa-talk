'use client'

import React, { useEffect, useState } from 'react'
import { ChevronLeft, Edit3, MapPin, Copy } from 'lucide-react'

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

  useEffect(() => {
    // Sync values with local storage (from MePage)
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
  }, [])

  const handleCopyID = () => {
    if (user.displayAccountNumber) {
      navigator.clipboard.writeText(user.displayAccountNumber)
    }
  }

  return (
    <div className="w-full bg-white min-h-screen text-gray-900 pb-10">
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

        {/* Top Action Bar */}
        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between z-10">
          <button 
            onClick={onBack}
            className="p-1 rounded-full bg-black/20 text-white backdrop-blur-sm"
          >
            <ChevronLeft size={28} />
          </button>
          
          <button className="p-1 rounded-full bg-black/20 text-white backdrop-blur-sm">
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
    </div>
  )
}

