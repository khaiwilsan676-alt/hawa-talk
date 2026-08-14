'use client'

import React, { useState } from 'react'
import { 
  Copy, 
  Heart,
  MessageCircle,
  MoreHorizontal
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
  }
  onClose: () => void
  onFollow?: () => void
  onMessage?: () => void
  onCopyId?: () => void
}

export default function RoomProfile({ 
  user, 
  onClose, 
  onFollow, 
  onMessage,
  onCopyId 
}: RoomProfileProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    if (onFollow) onFollow()
  }

  const handleCopyId = () => {
    const id = user.accountId || user.id || user.uid || ''
    navigator.clipboard.writeText(id)
    if (onCopyId) onCopyId()
  }

  // Default values
  const displayName = user.name || 'User'
  const displayImage = user.image || '/default-avatar.png'
  const displayGender = user.gender || '♂'
  const displayAge = user.age || 24
  const displayCountry = user.country || 'India'
  const displayFlag = user.flag || '🇮🇳'
  const followers = user.followers || 0
  const accountId = user.accountId || user.id || user.uid || 'N/A'
  const isOnline = user.isOnline !== undefined ? user.isOnline : true

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Transparent Backdrop - NO BLUR */}
      <div 
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up"
        style={{ height: '30vh', minHeight: '280px', maxHeight: '320px' }}
      >
        {/* Top Right - More Options */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal size={20} className="text-gray-700" strokeWidth={2.5} />
          </button>
          
          {showMoreMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg py-2 w-40 z-20 border border-gray-100">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Report
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Block
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Share
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col items-center px-4 pt-8 pb-4 h-full">
          {/* Avatar - Half inside sheet - SIZE INCREASED */}
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
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* User Info */}
          <div className="text-center w-full">
            {/* Name - Row 1 */}
            <h3 className="text-lg font-bold text-gray-900">
              {displayName}
            </h3>

            {/* Gender + Tags - Row 2 - IMAGES SIZE INCREASED */}
            <div className="flex items-center justify-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-sm font-medium text-gray-700">
                {displayGender} {displayAge}
              </span>
              
              {/* Level Badge - SIZE INCREASED */}
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

              {/* Additional Tags - SIZE INCREASED */}
              <img src="/1785486414756.png" alt="" className="h-6 w-auto object-contain" />
              <img src="/1785131462125.png" alt="" className="h-6 w-auto object-contain" />
              <img src="/1785131792693.png" alt="" className="h-6 w-auto object-contain" />
              <img src="/1785469775751.png" alt="" className="h-5 w-auto object-contain" />
              <img src="/1785469365805.png" alt="" className="h-5 w-auto object-contain" />
            </div>

            {/* ID, Followers, Country - Row 4 */}
            <div className="flex items-center justify-center gap-2 mt-1.5 text-xs">
              {/* ID with Copy */}
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">ID:</span>
                <span className="text-gray-700 font-medium">{accountId}</span>
                <button
                  onClick={handleCopyId}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                  aria-label="Copy ID"
                >
                  <Copy size={12} strokeWidth={2} />
                </button>
              </div>

              <span className="text-gray-300">|</span>

              {/* Followers */}
              <div className="flex items-center gap-0.5">
                <span className="text-gray-700 font-medium">{followers}</span>
                <span className="text-gray-500">Fans</span>
              </div>

              <span className="text-gray-300">|</span>

              {/* Country Flag */}
              <div className="flex items-center gap-0.5">
                <span className="text-base">{displayFlag}</span>
                <span className="text-gray-500">{displayCountry}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Bottom */}
          <div className="flex items-center gap-3 mt-auto w-full pt-2">
            <button
              onClick={handleFollow}
              className={`flex-1 h-10 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                isFollowing 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Heart size={16} className={isFollowing ? 'fill-current' : ''} />
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </div>
            </button>

            <button
              onClick={onMessage}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-white font-semibold text-sm shadow-md shadow-cyan-200 hover:shadow-lg transition-all active:scale-95"
            >
              <div className="flex items-center justify-center gap-1.5">
                <MessageCircle size={16} />
                <span>Chat</span>
              </div>
            </button>
          </div>
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
