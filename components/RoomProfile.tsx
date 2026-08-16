'use client'

import React from 'react'
import { 
  Copy, 
  AlertTriangle,
  Mic,
  ChevronDown,
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
  }
  isOwner?: boolean      // Kya yeh profile user KI APNI hai?
  isRoomOwner?: boolean  // Kya profile DEKHNE WALA user ROOM KA OWNER hai?
  onClose: () => void
  onCopyId?: () => void
  onLeaveSeat?: () => void
  onMention?: (username?: string) => void
  onFollow?: () => void
  onMessage?: () => void
  onMute?: () => void
  onLock?: () => void
  onKick?: () => void
  onInvite?: () => void
}

export default function RoomProfile({ 
  user, 
  isOwner = false,
  isRoomOwner = false,
  onClose, 
  onCopyId,
  onLeaveSeat,
  onMention,
  onFollow,
  onMessage,
  onMute,
  onLock,
  onKick,
  onInvite
}: RoomProfileProps) {
  // Default values
  const displayName = user.name || 'User'
  const displayImage = user.image || '/default-avatar.png'
  const displayGender = user.gender || '♂'
  const displayAge = user.age || 24
  const displayCountry = user.country || ''
  const displayFlag = user.flag || ''
  const followers = user.followers || 0
  const isInSeat = user.isInSeat !== undefined ? user.isInSeat : false

  const getUserId = () => {
    const possibleIds = [user.accountId, user.id, user.uid]
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

  const getGenderColor = (gender: string) => {
    const lowerGender = gender.toLowerCase()
    if (lowerGender === 'male' || lowerGender === 'm' || lowerGender === '♂') return 'bg-blue-500'
    else if (lowerGender === 'female' || lowerGender === 'f' || lowerGender === '♀') return 'bg-pink-500'
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
      
      {/* Bottom Sheet */}
      <div 
        className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up flex flex-col"
        style={{ 
          height: isOwner ? '30vh' : '28vh', // Height adjusted as 2nd row is now conditional
          minHeight: isOwner ? '280px' : '260px', 
          maxHeight: isOwner ? '320px' : '300px' 
        }}
      >
        {/* Top Left - Warning Icon */}
        <div className="absolute top-3 left-3 z-10">
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <AlertTriangle size={20} className="text-gray-700" strokeWidth={2.5} />
          </button>
        </div>

        {/* Top Right - @ Mention Icon */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleMention}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <AtSign size={20} className="text-gray-700" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col items-center px-4 pt-8 h-full">
          {/* Avatar */}
          <div className="relative -mt-14 mb-2 overflow-visible">
            <div className="relative w-20 h-20 rounded-full overflow-visible border-2 border-white shadow-md bg-gray-100">
              <img 
                src={displayImage} 
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
                style={{ position: 'relative', zIndex: 1, borderRadius: '50%' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png' }}
              />
              <div 
                className="absolute pointer-events-none"
                style={{
                  top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '160%', height: '160%', zIndex: 2, overflow: 'visible',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <WhiteColorRemovalShader
                  imageSrc="/1786867564769.png"
                  threshold={0.85}
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', maxWidth: 'none', maxHeight: 'none', overflow: 'visible' }}
                />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="text-center w-full">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
              <span className={`px-2 py-0.5 ${genderColor} text-white text-xs font-medium rounded-full`}>
                {displayGender} {displayAge}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
              <img src="/1785131462125.png" alt="" className="h-6 w-auto object-contain" />
              <img src="/1785131792693.png" alt="" className="h-6 w-auto object-contain" />
              <img src="/1785469775751.png" alt="" className="h-5 w-auto object-contain" />
              <img src="/1785469365805.png" alt="" className="h-5 w-auto object-contain" />
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <div className="relative inline-flex items-center">
                <img src="/1785137410522.png" alt="Level" className="h-6 w-auto object-contain" />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-sm">Lv.1</span>
              </div>
              <img src="/1785486414756.png" alt="" className="h-6 w-auto object-contain" />
            </div>

            <div className="flex items-center justify-center gap-2 mt-1.5 text-xs">
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">ID:</span>
                <span className="text-gray-700 font-medium">{accountId}</span>
                {accountId !== 'N/A' && accountId !== 'User' && (
                  <button onClick={handleCopyId} className="text-gray-400 hover:text-gray-600 transition-colors p-0.5">
                    <Copy size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-700 font-medium">{followers}</span>
                <span className="text-gray-500">Fans</span>
                {displayFlag && <span className="text-base ml-0.5">{displayFlag}</span>}
              </div>
              {displayCountry && displayFlag && (
                <>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-0.5">
                    <span className="text-gray-500">{displayCountry}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ===== FOOTER ACTIONS ===== */}
          <div className="mt-auto w-full px-2 pb-4 flex flex-col gap-3">
            
            {/* 1. SELF PROFILE (Owner): Blue Leave Button */}
            {isOwner ? (
              isInSeat && (
                <button
                  onClick={handleLeaveSeat}
                  className="w-full h-12 rounded-full bg-blue-500 text-white font-semibold text-base shadow-md shadow-blue-200 hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <div className="relative flex items-center justify-center">
                    <Mic size={20} strokeWidth={2.5} />
                    <ChevronDown size={14} strokeWidth={3} className="absolute -bottom-1.5 right-[-4px]" />
                  </div>
                  <span>Leave</span>
                </button>
              )
            ) : (
              /* 2. OTHER USER PROFILE: Follow + Chat (ALWAYS visible) */
              <>
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={onFollow}
                    className="flex-1 h-10 rounded-lg border border-pink-200 bg-pink-50/50 text-pink-500 font-medium text-sm hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Heart size={18} strokeWidth={2} />
                    <span>Follow</span>
                  </button>
                  <button
                    onClick={onMessage}
                    className="flex-1 h-10 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} strokeWidth={2} />
                    <span>Chat</span>
                  </button>
                </div>

                {/* 3. DYNAMIC SECOND ROW: ONLY for ROOM OWNER viewing OTHER users who are IN SEAT */}
                {isRoomOwner && isInSeat && (
                  <div className="w-full flex items-center justify-center gap-4 text-sm font-medium text-gray-400 py-1">
                    <button onClick={onMute} className="hover:text-gray-600 transition-colors">Mute</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={handleLeaveSeat} className="hover:text-gray-600 transition-colors">Leave</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={onLock} className="hover:text-gray-600 transition-colors">Lock</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={onKick} className="hover:text-gray-600 transition-colors">Kick out</button>
                  </div>
                )}
                
                {/* NOTE: User-to-User (Normal viewer) ke case mein, kyunki isRoomOwner false hai, 
                    upar wala block kabhi render nahi hoga. Aur sirf Follow/Chat dikhega. */}
              </>
            )}
            
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  )
}
