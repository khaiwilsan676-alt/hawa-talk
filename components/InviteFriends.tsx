'use client'

import React, { useState } from 'react'
import { 
  ArrowLeft, 
  Copy, 
  Share2, 
  Users, 
  Gift, 
  MessageCircle, 
  Mail, 
  Link2, 
  MoreHorizontal, 
  X,
  Download
} from 'lucide-react'

// Custom Facebook SVG component to prevent lucide-react build errors
const FacebookIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

interface InviteFriendsProps {
  onBack: () => void
}

export default function InviteFriends({ onBack }: InviteFriendsProps) {
  const [copied, setCopied] = useState(false)
  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null)
  
  // State for Bottom 30vh Red Sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  
  // Get user info from localStorage
  const userId = typeof window !== 'undefined' 
    ? (localStorage.getItem('userUID') || localStorage.getItem('accountNumber') || 'N/A')
    : 'N/A'
  const userName = typeof window !== 'undefined'
    ? (localStorage.getItem('userName') || 'User')
    : 'User'
  
  const inviteCode = userId !== 'N/A' ? userId : 'WELCOME123'
  const inviteLink = `https://yourapp.com/invite/${inviteCode}`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true)
      setCopiedType('code')
      setTimeout(() => {
        setCopied(false)
        setCopiedType(null)
      }, 2000)
    })
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true)
      setCopiedType('link')
      setTimeout(() => {
        setCopied(false)
        setCopiedType(null)
      }, 2000)
    })
  }

  const handleShare = (platform: string) => {
    const shareText = `Join me on this amazing app! Use my invite code: ${inviteCode} or click here: ${inviteLink}`
    
    switch(platform) {
      case 'whatsapp':
        navigator.clipboard.writeText(inviteLink).then(() => {
          setCopied(true)
          setCopiedType('link')
          setTimeout(() => {
            setCopied(false)
            setCopiedType(null)
          }, 2000)
        })
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
        break

      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`, '_blank')
        break

      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`, '_blank')
        break

      case 'email':
        window.location.href = `mailto:?subject=Join me on this app!&body=${encodeURIComponent(shareText)}`
        break

      case 'copy':
        handleCopyLink()
        break

      case 'more':
        if (navigator.share) {
          navigator.share({
            title: 'Invite Code & Link',
            text: shareText,
            url: inviteLink,
          }).catch(() => {})
        } else {
          const blob = new Blob([shareText], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `invite_${inviteCode}.txt`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
        break

      default:
        break
    }
  }

  // Top list share options (No Green Colors)
  const shareOptions = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={24} />, color: 'bg-amber-600' },
    { id: 'telegram', label: 'Telegram', icon: <Share2 size={24} />, color: 'bg-blue-500' },
    { id: 'email', label: 'Email', icon: <Mail size={24} />, color: 'bg-red-500' },
    { id: 'copy', label: 'Copy Link', icon: <Link2 size={24} />, color: 'bg-gray-600' },
  ]

  const rewards = [
    { amount: '50', description: 'Coins for each friend who joins' },
    { amount: '100', description: 'Bonus coins when 5 friends join' },
    { amount: '500', description: 'Special reward for 10 friends' },
  ]

  return (
    <div className="min-h-screen relative flex flex-col bg-[#4d0515] overflow-hidden select-none">
      {/* Top 40vh Image with bottom smooth fade into the maroon color */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] z-0 pointer-events-none overflow-hidden">
        <img
          src="/IMG-20260821-WA0100.jpg"
          alt="Top Background"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4d0515]/50 to-[#4d0515]" />
      </div>

      {/* Middle Transition Image (1788074201753~2.jpg) */}
      <div className="absolute top-[32vh] left-1/2 -translate-x-1/2 w-full max-w-md z-0 pointer-events-none flex justify-center opacity-85">
        <img
          src="/1788074201753~2.jpg"
          alt="Middle Sheet Ornament"
          className="w-full object-contain pointer-events-none"
        />
      </div>

      {/* Fixed Bottom Image (1788074191602~2.jpg) - Click opens Red Sheet */}
      <div 
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-0 left-0 right-0 z-20 flex justify-center cursor-pointer active:scale-95 transition-transform"
      >
        <img
          src="/1788074191602~2.jpg"
          alt="Bottom Decor Clickable"
          className="w-full max-w-md object-contain object-bottom pointer-events-auto"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center p-4 bg-black/30 backdrop-blur-md border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white ml-3">Invite Friends</h1>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 flex-1 p-4 overflow-y-auto pb-36">
        <div className="max-w-md mx-auto space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white text-center shadow-xl backdrop-blur-sm">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Invite Friends & Earn Rewards!</h2>
            <p className="text-sm opacity-90 mb-4">
              Share your invite code with friends and earn exciting rewards when they join
            </p>
            
            {/* Invite Code Display */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-3">
              <p className="text-xs opacity-80 mb-1">Your Invite Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-bold tracking-wider">{inviteCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="bg-white/30 hover:bg-white/40 rounded-lg p-2 transition-colors cursor-pointer"
                >
                  <Copy size={18} />
                </button>
              </div>
              {copied && copiedType === 'code' && (
                <div className="text-xs mt-2 text-amber-200 font-medium">✓ Code copied!</div>
              )}
            </div>

            {/* Invite Link */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-transparent text-xs outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-white/30 hover:bg-white/40 rounded-lg px-3 py-1.5 text-xs transition-colors cursor-pointer"
                >
                  Copy
                </button>
              </div>
              {copied && copiedType === 'link' && (
                <div className="text-xs mt-2 text-amber-200 font-medium">✓ Link copied!</div>
              )}
            </div>
          </div>

          {/* Share Options */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Share Via</h3>
            <div className="grid grid-cols-4 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleShare(option.id)}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className={`${option.color} w-14 h-14 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg`}>
                    {option.icon}
                  </div>
                  <span className="text-xs text-gray-600">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rewards Section */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gift size={20} className="text-purple-600" />
              Rewards for You
            </h3>
            <div className="space-y-3">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {reward.amount}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Coins</p>
                    <p className="text-xs text-gray-600">{reward.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              How It Works
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
                <p className="text-sm text-gray-700">Share your invite code with friends</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
                <p className="text-sm text-gray-700">Friends register using your code</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">3</div>
                <p className="text-sm text-gray-700">Earn coins and rewards automatically!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop overlay for bottom sheet */}
      {isSheetOpen && (
        <div 
          onClick={() => setIsSheetOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-[2px]"
        />
      )}

      {/* Bottom 30vh RED Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 h-[30vh] bg-red-600 text-white rounded-t-3xl z-50 transition-transform duration-300 ease-out shadow-2xl flex flex-col p-4 ${
          isSheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Top Handle & Close Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-red-500/40">
          <div className="w-10 h-1 bg-white/40 rounded-full mx-auto" />
          <button 
            onClick={() => setIsSheetOpen(false)} 
            className="absolute right-4 top-3 text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Buttons in Red Sheet */}
        <div className="flex-1 grid grid-cols-4 gap-2 items-center justify-center pt-3 text-center">
          {/* WhatsApp */}
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-white text-red-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <MessageCircle size={28} />
            </div>
            <span className="text-xs font-semibold text-white">WhatsApp</span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleShare('facebook')}
            className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <FacebookIcon size={24} />
            </div>
            <span className="text-xs font-semibold text-white">Facebook</span>
          </button>

          {/* Link Icon */}
          <button
            onClick={() => handleShare('copy')}
            className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-white/20 text-white border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Link2 size={28} />
            </div>
            <span className="text-xs font-semibold text-white">Copy Link</span>
          </button>

          {/* More Button (Save File / Share) */}
          <button
            onClick={() => handleShare('more')}
            className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-white/20 text-white border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <MoreHorizontal size={28} />
            </div>
            <span className="text-xs font-semibold text-white">More</span>
          </button>
        </div>

        {/* Copy Feedback inside sheet */}
        {copied && (
          <div className="text-center text-xs text-amber-200 font-medium pb-1 animate-pulse">
            ✓ Link copied successfully!
          </div>
        )}
      </div>
    </div>
  )
}

