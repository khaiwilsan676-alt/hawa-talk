'use client'

import React, { useEffect, useState } from 'react'
import { ChevronLeft, Edit3, MapPin, Copy, ChevronRight } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'profile' | 'intimacy'>('profile')
  const [user, setUser] = useState({
    name: "KāβiR Khān",
    uid: "",
    displayAccountNumber: "100379620",
    photo: "",
    gender: "♂",
    age: 24,
    followers: 862,
    bio: "My Wife~༄❥•Angel ~Be mine forever and ever",
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
        {/* Cover Photo Background */}
        <img
          src="/1784480382765~2.jpg" // Change to your preferred cover image
          alt="Cover"
          className="w-full h-full object-cover"
        />

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

        {/* Avatar & Badges Circle Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center">
          {/* Main Avatar Frame */}
          <div className="relative">
            {/* SVIP Frame Badge Background Effect */}
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-3xl font-bold text-white border-2 border-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* SVIP2 Badge */}
            <div className="absolute -bottom-2 -left-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md border border-white shadow">
              SVIP2
            </div>
          </div>

          {/* Connected Couple Avatar */}
          <div className="relative -ml-6 mb-2">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-pink-400 to-red-400">
              <img
                src="/IMG_20260720_142354.png" // Secondary Avatar Photo
                alt="Partner"
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
            <div className="absolute -bottom-1 right-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white">
              Lv.9
            </div>
          </div>
        </div>

        {/* Honor Badges Row */}
        <div className="absolute -bottom-5 right-2 flex items-center gap-1">
          {['/1784621763019.png', '/1784562849790.png'].map((icon, idx) => (
            <img key={idx} src={icon} alt="badge" className="w-7 h-7 object-contain drop-shadow" />
          ))}
        </div>
      </div>

      {/* Profile Info Details Section */}
      <div className="px-5 pt-8">
        {/* Name & Gender/Age */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-cyan-700 tracking-wide">{user.name}</h1>
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

        {/* Tags Row */}
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-purple-100 text-purple-700 text-[11px] px-2 py-0.5 rounded-full font-semibold">
            Lv.59
          </span>
          <span className="bg-cyan-100 text-cyan-800 text-[11px] px-2 py-0.5 rounded-full font-semibold">
            SVIP2
          </span>
          <span className="bg-amber-100 text-amber-700 text-[11px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            ✨ {user.name}~Angel ✨
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-3">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-base">🇮🇳</span>
          <span>{user.location}</span>
        </div>

        {/* Bio / Bio Quote */}
        <div className="flex items-start gap-2 text-xs text-gray-500 mt-2">
          <Edit3 size={14} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="italic">{user.bio}</p>
        </div>
      </div>

      {/* Tabs Section (Profile / Intimacy) */}
      <div className="border-b border-gray-100 mt-6 px-5">
        <div className="flex gap-6 text-base font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 relative ${
              activeTab === 'profile' ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            Profile
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('intimacy')}
            className={`pb-2 relative ${
              activeTab === 'intimacy' ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            Intimacy
            {activeTab === 'intimacy' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'profile' ? (
        <div className="px-5 mt-4 space-y-6">
          {/* MBTI Personality Card */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">MBTI Personality</h3>
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-200/50 rounded-lg flex items-center justify-center text-xl">
                  🤠
                </div>
                <div>
                  <span className="font-bold text-amber-900 text-sm">ESFP</span>
                  <span className="text-amber-700 text-xs ml-1.5">- Performer</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-amber-700" />
            </div>
          </div>

          {/* Albums Section */}
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
      ) : (
        <div className="p-8 text-center text-gray-400 text-sm">
          No Intimacy details available.
        </div>
      )}
    </div>
  )
}

