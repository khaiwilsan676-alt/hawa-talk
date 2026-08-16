'use client'

import React from 'react'
import { 
  Copy, 
  AlertTriangle,
  AtSign,
  Heart,
  MessageCircle,
  Mic
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
  isRoomOwner?: boolean
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
  isRoomOwner = false,
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
  const displayCountry = user.country || 'India'
  const displayFlag = user.flag || '🇮🇳'
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

  // Determine what to show
  const showLeaveSeat = isCurrentUser && isInSeat
  const showModerationRow = isRoomOwner && !isCurrentUser
  const showActions = !isCurrentUser // Show actions for all other users

  // Determine sheet height based on content
  const getSheetHeight = () => {
    // If both actions and moderation are shown
    if (showActions && showModerationRow) {
      return '40vh'
    }
    // If only actions (follow, chat, image) without moderation
    if (showActions && !showModerationRow) {
      return '30vh'
    }
    // If only leave seat button
    if (showLeaveSeat) {
      return '25vh'
    }
    // If no options at all
    return '20vh'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Transparent Backdrop */}
      <div 
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      />
      
      {/* Bottom Sheet - Dynamic height based on content */}
      <div 
        className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up"
        style={{ 
          height: getSheetHeight(), 
          minHeight: getSheetHeight(), 
          maxHeight: getSheetHeight(),
          overflow: 'hidden'
        }}
      >
        {/* Top Left - Warning Icon */}
        <div className="absolute top-3 left-4 z-20">
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Warning"
          >
            <AlertTriangle size={22} className="text-gray-700" strokeWidth={2.5} />
          </button>
        </div>

        {/* Top Right - @ Mention Icon */}
        <div className="absolute top-3 right-4 z-20">
          <button
            onClick={handleMention}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Mention user"
          >
            <AtSign size={22} className="text-gray-700" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center px-4 pt-6 pb-3 h-full overflow-y-auto">
          {/* Avatar - Simple and clean */}
          <div className="relative mb-3 shrink-0">
            <div className="relative w-20 h-20 rounded-full border-2 border-white shadow-lg bg-gray-100">
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
            </div>
          </div>

          {/* User Info */}
          <div className="text-center w-full shrink-0">
            {/* Row 1: Name + Gender Tag */}
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-base font-bold text-gray-900">
                {displayName}
              </h3>
              <span className={`px-2 py-0.5 ${genderColor} text-white text-xs font-medium rounded-full`}>
                {displayGender} {displayAge}
              </span>
            </div>

            {/* Row 2: Tags */}
            <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
              <img src="/1785131462125.png" alt="" className="h-5 w-auto object-contain" />
              <img src="/1785131792693.png" alt="" className="h-5 w-auto object-contain" />
              <img src="/1785469775751.png" alt="" className="h-4.5 w-auto object-contain" />
              <img src="/1785469365805.png" alt="" className="h-4.5 w-auto object-contain" />
            </div>

            {/* Row 3: Level Badge + Additional Image */}
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <div className="relative inline-flex items-center">
                <img 
                  src="/1785137410522.png" 
                  alt="Level" 
                  className="h-5 w-auto object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm">
                  Lv.1
                </span>
              </div>
              <img src="/1785486414756.png" alt="" className="h-5 w-auto object-contain" />
            </div>

            {/* Row 4: ID | Fans | Flag */}
            <div className="flex items-center justify-center gap-2 mt-1.5 text-sm">
              {/* ID with Copy */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500">ID:</span>
                <span className="text-gray-700 font-medium">{accountId}</span>
                {accountId !== 'N/A' && accountId !== 'User' && (
                  <button
                    onClick={handleCopyId}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                    aria-label="Copy ID"
                  >
                    <Copy size={14} strokeWidth={2} />
                  </button>
                )}
              </div>

              <span className="text-gray-300">|</span>

              {/* Fans */}
              <div className="flex items-center gap-1">
                <span className="text-gray-700 font-medium">{followers}</span>
                <span className="text-gray-500">Fans</span>
              </div>

              <span className="text-gray-300">|</span>

              {/* Flag only */}
              <div className="flex items-center">
                {displayFlag && (
                  <span className="text-base">{displayFlag}</span>
                )}
              </div>
            </div>
          </div>

          {/* Blue Leave Button - Only for current user in seat */}
          {showLeaveSeat && (
            <div className="mt-3 w-full px-2 shrink-0">
              <button
                onClick={handleLeaveSeat}
                className="w-full h-12 rounded-full bg-blue-500 text-white font-semibold text-base shadow-md shadow-blue-200 hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <div className="relative flex items-center justify-center">
                  <Mic size={20} strokeWidth={2.5} className="text-white" />
                  <span className="absolute -bottom-1 -right-1 text-[11px] font-bold text-white">↓</span>
                </div>
                <span>Leave</span>
              </button>
            </div>
          )}

          {/* Action Buttons for OTHER users */}
          {showActions && (
            <div className="mt-3 w-full flex flex-col gap-2 shrink-0">
              {/* Row: Follow, Chat, Image */}
              <div className="flex items-center gap-6 w-full justify-center">
                <button
                  onClick={onFollow}
                  className="flex items-center gap-1.5 text-pink-500 font-medium text-base hover:text-pink-600 transition-colors active:scale-95"
                >
                  <Heart size={20} className="fill-pink-500" />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>

                <button
                  onClick={onMessage}
                  className="flex items-center gap-1.5 text-gray-700 font-medium text-base hover:text-gray-900 transition-colors active:scale-95"
                >
                  <MessageCircle size={20} />
                  <span>Chat</span>
                </button>

                <button
                  onClick={onThirdAction}
                  className="flex items-center gap-1.5 group active:scale-95 transition-all"
                  aria-label="Additional action"
                >
                  <img 
                    src="/file_000000008e508208b1353ae33e2abef9.png" 
                    alt="Action" 
                    className="w-8 h-8 object-contain rounded-full group-hover:scale-110 transition-transform"
                  />
                </button>
              </div>

              {/* Moderation row - Only for room owner viewing other users */}
              {showModerationRow && (
                <div className="flex items-center justify-around w-full py-1 text-gray-500 text-sm font-medium">
                  <button 
                    onClick={onMute}
                    className="hover:text-gray-800 transition-colors py-0.5 px-2"
                  >
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    onClick={onLeaveSeat}
                    className="hover:text-gray-800 transition-colors py-0.5 px-2"
                  >
                    Leave
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    onClick={onLock}
                    className="hover:text-gray-800 transition-colors py-0.5 px-2"
                  >
                    {isLocked ? 'Unlock' : 'Lock'}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    onClick={onKickOut}
                    className="hover:text-red-600 transition-colors py-0.5 px-2"
                  >
                    Kick out
                  </button>
                </div>
              )}
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
