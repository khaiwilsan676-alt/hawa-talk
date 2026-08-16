'use client'

import React from 'react'
import { 
  Copy, 
  AlertTriangle,
  AtSign,
  Heart,
  MessageCircle
} from 'lucide-react'
import WhiteColorRemovalShader from './WhiteColorRemovalShader'

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
    isMuted?: boolean
    isLocked?: boolean
  }
  isCurrentUser?: boolean
  onClose: () => void
  onCopyId?: () => void
  onLeaveSeat?: () => void
  onMention?: (username?: string) => void
  onFollow?: () => void
  onMessage?: () => void
  onThirdAction?: () => void
  onMute?: () => void
  onLock?: () => void
  onKickOut?: () => void
}

export default function RoomProfile({ 
  user, 
  isCurrentUser = false,
  onClose, 
  onCopyId,
  onLeaveSeat,
  onMention,
  onFollow,
  onMessage,
  onThirdAction,
  onMute,
  onLock,
  onKickOut
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
  const isFollowing = user.isFollowing || false
  const isMuted = user.isMuted || false
  const isLocked = user.isLocked || false

  // Get user ID correctly
  const getUserId = () => {
    const possibleIds = [
      user.accountId,
      user.id,
      user.uid,
    ]
    
    const id = possibleIds.find(val => val && val.trim() !== '')
    
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

  // Determine dynamic height based on states
  const showActions = !isCurrentUser
  const showLeaveSeat = isCurrentUser && isInSeat

  const getSheetHeight = () => {
    if (showActions) return { height: '38vh', minHeight: '340px', maxHeight: '400px' }
    if (showLeaveSeat) return { height: '30vh', minHeight: '280px', maxHeight: '320px' }
    return { height: '20vh', minHeight: '220px', maxHeight: '260px' }
  }

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
        style={getSheetHeight()}
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
          {/* Avatar with WebGL Overlay - Half inside sheet */}
          <div className="relative -mt-14 mb-2 overflow-visible">
            <div className="relative w-20 h-20 rounded-full overflow-visible border-2 border-white shadow-md bg-gray-100">
              <img 
                src={displayImage} 
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: '50%'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png'
                }}
              />
              
              {/* WebGL Shader Overlay - Full image display, no clipping */}
              <div 
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '160%',
                  height: '160%',
                  zIndex: 2,
                  overflow: 'visible',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WhiteColorRemovalShader
                  imageSrc="/1786867564769.png"
                  threshold={0.85}
                  className="w-full h-full"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    overflow: 'visible',
                  }}
                />
              </div>
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

            {/* Row 4: ID, Followers with Flag, Country */}
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

              {/* Followers with Country Flag */}
              <div className="flex items-center gap-1">
                <span className="text-gray-700 font-medium">{followers}</span>
                <span className="text-gray-500">Fans</span>
                {displayFlag && (
                  <span className="text-base ml-1">{displayFlag}</span>
                )}
              </div>

              {displayCountry && displayFlag && (
                <>
                  <span className="text-gray-300">|</span>

                  {/* Country */}
                  <div className="flex items-center gap-0.5">
                    <span className="text-gray-500">{displayCountry}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Leave Seat Button - Only show if it's the current user AND they are in a seat */}
          {showLeaveSeat && (
            <div className="mt-auto w-full pt-2">
              <button
                onClick={handleLeaveSeat}
                className="w-full h-11 rounded-full bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-200 hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <div className="relative flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                      <line x1="12" y1="19" x2="12" y2="22"></line>
                      <polyline points="15 16 12 19 9 16"></polyline>
                    </svg>
                  </div>
                  <span>Leave</span>
                </div>
              </button>
            </div>
          )}

          {/* Action Buttons for Other Users Profile: Follow, Chat, 3rd Image, and Mute/Leave/Lock/Kick out row below */}
          {showActions && (
            <div className="mt-auto w-full pt-2 flex flex-col gap-2.5">
              {/* Top Row: Follow, Chat, 3rd Image Button */}
              <div className="flex items-center gap-3 w-full">
                {/* Follow Button */}
                <button
                  onClick={onFollow}
                  className="flex-1 h-11 rounded-full bg-pink-50 text-pink-500 border border-pink-200 font-semibold text-sm hover:bg-pink-100 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Heart size={16} className="text-pink-500 fill-pink-500" />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>

                {/* Chat Button */}
                <button
                  onClick={onMessage}
                  className="flex-1 h-11 rounded-full bg-gray-50 text-gray-800 border border-gray-200 font-semibold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <MessageCircle size={16} className="text-gray-700" />
                  <span>Chat</span>
                </button>

                {/* 3rd Column - Image inside a Circle Button */}
                <button
                  onClick={onThirdAction}
                  className="w-11 h-11 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all overflow-hidden p-2 active:scale-95 shrink-0"
                  aria-label="Additional action"
                >
                  <img 
                    src="/file_000000008e508208b1353ae33e2abef9.png" 
                    alt="Action" 
                    className="w-full h-full object-contain rounded-full"
                  />
                </button>
              </div>

              {/* Bottom Row: Mute | Leave | Lock | Kick out */}
              <div className="flex items-center justify-around w-full py-1 text-gray-500 text-xs sm:text-sm font-medium border-t border-gray-100">
                <button 
                  onClick={onMute}
                  className="hover:text-gray-800 transition-colors py-1 px-2"
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={onLeaveSeat}
                  className="hover:text-gray-800 transition-colors py-1 px-2"
                >
                  Leave
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={onLock}
                  className="hover:text-gray-800 transition-colors py-1 px-2"
                >
                  {isLocked ? 'Unlock' : 'Lock'}
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={onKickOut}
                  className="hover:text-red-600 transition-colors py-1 px-2"
                >
                  Kick out
                </button>
              </div>
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

