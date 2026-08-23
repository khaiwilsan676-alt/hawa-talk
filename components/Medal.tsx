
'use client'

import React, { useState } from 'react'
import { ArrowLeft, Trophy, Medal as MedalIcon, Star, Lock, Award } from 'lucide-react'

interface MedalProps {
  onBack: () => void
}

interface MedalData {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  unlockedDate?: string
}

export default function Medal({ onBack }: MedalProps) {
  const [medals, setMedals] = useState<MedalData[]>([
    { id: '1', name: 'First Steps', description: 'Complete your profile', icon: '👶', rarity: 'common', unlocked: true, unlockedDate: '2024-01-15' },
    { id: '2', name: 'Social Butterfly', description: 'Invite 5 friends', icon: '🦋', rarity: 'rare', unlocked: true, unlockedDate: '2024-02-20' },
    { id: '3', name: 'Chat Master', description: 'Send 100 messages', icon: '💬', rarity: 'epic', unlocked: true, unlockedDate: '2024-03-10' },
    { id: '4', name: 'Early Bird', description: 'Login before 6 AM', icon: '🌅', rarity: 'rare', unlocked: false },
    { id: '5', name: 'Collector', description: 'Collect 50 items', icon: '🎯', rarity: 'epic', unlocked: false },
    { id: '6', name: 'Legend', description: 'Reach Level 50', icon: '👑', rarity: 'legendary', unlocked: false },
    { id: '7', name: 'Millionaire', description: 'Earn 1M coins', icon: '💰', rarity: 'legendary', unlocked: false },
    { id: '8', name: 'Team Player', description: 'Join a family group', icon: '👨‍👩‍👧‍👦', rarity: 'common', unlocked: true, unlockedDate: '2024-01-20' },
  ])

  const rarityColors = {
    common: 'bg-gray-100 text-gray-600',
    rare: 'bg-blue-100 text-blue-600',
    epic: 'bg-purple-100 text-purple-600',
    legendary: 'bg-amber-100 text-amber-600'
  }

  const unlockedCount = medals.filter(m => m.unlocked).length
  const totalCount = medals.length

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
        <h1 className="text-lg font-semibold text-gray-900 ml-3">My Medals</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Stats Card */}
          <div className="bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">{unlockedCount}/{totalCount}</h2>
                <p className="text-sm opacity-90">Medals Unlocked</p>
              </div>
              <Trophy size={48} className="opacity-80" />
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Medals Grid */}
          <div className="grid grid-cols-2 gap-3">
            {medals.map((medal) => (
              <div
                key={medal.id}
                className={`bg-white rounded-2xl p-4 shadow-sm transition-all ${
                  medal.unlocked ? 'hover:shadow-md' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-3xl">
                    {medal.unlocked ? medal.icon : '🔒'}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${rarityColors[medal.rarity]}`}>
                    {medal.rarity}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{medal.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{medal.description}</p>
                {medal.unlocked && medal.unlockedDate && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Award size={12} />
                    Unlocked: {medal.unlockedDate}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Locked Medals Info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={18} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Locked Medals</h3>
            </div>
            <p className="text-sm text-gray-600">
              Complete tasks and achieve milestones to unlock more medals!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
