'use client'

import React from 'react'
import { 
  Copy, 
  AlertTriangle,
  Mic,
  ChevronDown,
  AtSign
} from 'lucide-react'

interface RoomProfileProps {
  user: {
    id?: string
    uid?: string
    accountId?: string
    name: string
    image: string
    gender?: string
    age?: number
    country?: string
    flag?: string
    followers?: number
    bio?: string
    isFollowing?: boolean
    isOnline?: boolean
    isInSeat?: boolean
  }
  onClose: () => void
  onCopyId?: () => void
  onLeaveSeat?: () => void
  onMention?: (username?: string) => void
  onFollow?: () => void
  onMessage?: () => void
}

export default function RoomProfile({ 
  user, 
  onClose, 
  onCopyId,
  onLeaveSeat,
  onMention
}: RoomProfileProps) {
  // Default values
  const displayName = user.name || 'User'
  const displayImage = user.image || '/default-avatar.png'
  const displayGender = user.gender || '♂'
  const displayAge = user.age || 24
  const displayCountry = user.country || ''
  const displayFlag = user.flag || ''
  const followers = user.followers || 0
  const isOnline = user.isOnline !== undefined ? user.isOnline : true
  const isInSeat = user.isInSeat !== undefined ? user.isInSeat : false

  // Get user ID correctly
  const getUserId = () => {
    // Check all possible ID fields
    const possibleIds = [
      user.accountId,
      user.id,
      user.uid,
    ]
    
    // Find first non-empty ID
    const id = possibleIds.find(val => val && val.trim() !== '')
    
    // Return the found ID or fallback to name
    return id || 'User'
  }

  const accountId = getUserId()

  const handleCopyId = () => {
    if (accountId && accountId !== 'N/A' && accountId !== 'User') {
      navigator.clipboard.writeText(accountId)
      if (onCopyId) onCopyId()
    }
  }

  const handleLeaveSeat = () => {
    if (onLeaveSeat) onLeaveSeat()
  }

  const handleMention = () => {
    if (onMention) onMention(displayName)
  }

  // Determine gender color
  const getGenderColor = (gender: string) => {
    const lowerGender = gender.toLowerCase()
    if (lowerGender === 'male' || lowerGender === 'm' || lowerGender === '♂') {
      return 'bg-blue-500'
    } else if (lowerGender === 'female' || lowerGender === 'f' || lowerGender === '♀') {
      return 'bg-pink-500'
    }
    return 'bg-gray-500'
  }

  const genderColor = getGenderColor(displayGender)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Transparent Backdrop */}
      <div 
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      />
      
      {/* Bottom Sheet - Dynamic Height */}
      <div 
        className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up"
        style={{ 
          height: isInSeat ? '30vh' : '20vh', 
          minHeight: isInSeat ? '280px' : '220px', 
          maxHeight: isInSeat ? '320px' : '260px' 
        }}
      >
        {/* Top Left - Warning Icon */}
        <div className="absolute top-3 left-3 z-10">
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Warning"
          >
            <AlertTriangle size={20} className="text-gray-700" strokeWidth={2.5} />
          </button>
        </div>

        {/* Top Right - @ Mention Icon */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleMention}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Mention user"
          >
            <AtSign size={20} className="text-gray-700" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center px-4 pt-8 pb-4 h-full">
          {/* Avatar - Half inside sheet */}
          <div className="relative -mt-14 mb-2">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100">
              <img 
                src={displayImage} 
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png'
                }}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center w-full">
            {/* Row 1: Name + Gender Tag */}
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {displayName}
              </h3>
              <span className={`px-2 py-0.5 ${genderColor} text-white text-xs font-medium rounded-full`}>
                {displayGender} {displayAge}
              </span>
            </div>

            {/* Row 2: Tags */}
            <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
              <img src="/1785131462125.png" alt="" className="h-6 w-auto object-contain" />
              <img src="/1785131792693.png" alt="" className="h-6 w-auto object-contain" />
              <img src="/1785469775751.png" alt="" className="h-5 w-auto object-contain" />
              <img src="/1785469365805.png" alt="" className="h-5 w-auto object-contain" />
            </div>

            {/* Row 3: Level Badge + Additional Image */}
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <div className="relative inline-flex items-center">
                <img 
                  src="/1785137410522.png" 
                  alt="Level" 
                  className="h-6 w-auto object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-sm">
                  Lv.1
                </span>
              </div>
              <img src="/1785486414756.png" alt="" className="h-6 w-auto object-contain" />
            </div>

            {/* Row 4: ID, Followers, Country */}
            <div className="flex items-center justify-center gap-2 mt-1.5 text-xs">
              {/* ID with Copy */}
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">ID:</span>
                <span className="text-gray-700 font-medium">{accountId}</span>
                {accountId !== 'N/A' && accountId !== 'User' && (
                  <button
                    onClick={handleCopyId}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                    aria-label="Copy ID"
                  >
                    <Copy size={12} strokeWidth={2} />
                  </button>
                )}
              </div>

              <span className="text-gray-300">|</span>

              {/* Followers */}
              <div className="flex items-center gap-0.5">
                <span className="text-gray-700 font-medium">{followers}</span>
                <span className="text-gray-500">Fans</span>
              </div>

              {displayCountry && displayFlag && (
                <>
                  <span className="text-gray-300">|</span>

                  {/* Country Flag */}
                  <div className="flex items-center gap-0.5">
                    <span className="text-base">{displayFlag}</span>
                    <span className="text-gray-500">{displayCountry}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Leave Seat Button - Only show if user is in seat */}
          {isInSeat && (
            <div className="mt-auto w-full pt-2">
              <button
                onClick={handleLeaveSeat}
                className="w-full h-10 rounded-xl bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-200 hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95"
              >
                <div className="flex items-center justify-center gap-2">
                  <Mic size={16} />
                  <ChevronDown size={16} />
                  <span>Leave</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
          }
