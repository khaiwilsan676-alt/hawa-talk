
'use client'

import React, { useState } from 'react'
import { ArrowLeft, Copy, Share2, Users, Gift, MessageCircle, Facebook, Twitter, Mail } from 'lucide-react'

interface InviteFriendsProps {
  onBack: () => void
}

export default function InviteFriends({ onBack }: InviteFriendsProps) {
  const [copied, setCopied] = useState(false)
  
  // Get user info from localStorage
  const userId = localStorage.getItem('userUID') || localStorage.getItem('accountNumber') || 'N/A'
  const userName = localStorage.getItem('userName') || 'User'
  
  const inviteCode = userId !== 'N/A' ? userId : 'WELCOME123'
  const inviteLink = `https://yourapp.com/invite/${inviteCode}`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOptions = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={24} />, color: 'bg-green-500' },
    { id: 'facebook', label: 'Facebook', icon: <Facebook size={24} />, color: 'bg-blue-600' },
    { id: 'twitter', label: 'Twitter', icon: <Twitter size={24} />, color: 'bg-sky-500' },
    { id: 'email', label: 'Email', icon: <Mail size={24} />, color: 'bg-red-500' },
  ]

  const rewards = [
    { amount: '50', description: 'Coins for each friend who joins' },
    { amount: '100', description: 'Bonus coins when 5 friends join' },
    { amount: '500', description: 'Special reward for 10 friends' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 bg-white border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 ml-3">Invite Friends</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white text-center">
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
            </div>

            {copied && (
              <div className="text-xs bg-green-500/50 rounded-lg px-3 py-1.5">
                ✓ Copied to clipboard!
              </div>
            )}
          </div>

          {/* Share Options */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Share Via</h3>
            <div className="grid grid-cols-4 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
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
    </div>
  )
}
