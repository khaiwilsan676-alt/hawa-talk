
'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Star, TrendingUp, Award, Crown, Zap } from 'lucide-react'

interface LevelProps {
  onBack: () => void
}

interface LevelInfo {
  level: number
  currentXP: number
  nextLevelXP: number
  totalXP: number
}

export default function Level({ onBack }: LevelProps) {
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    level: 1,
    currentXP: 250,
    nextLevelXP: 1000,
    totalXP: 250
  })

  const progressPercent = (levelInfo.currentXP / levelInfo.nextLevelXP) * 100

  const levelBenefits = [
    { level: 5, benefit: 'Unlock special emojis', icon: '😎' },
    { level: 10, benefit: 'Exclusive badge', icon: '🏅' },
    { level: 20, benefit: 'Priority customer support', icon: '⚡' },
    { level: 30, benefit: 'VIP status', icon: '👑' },
    { level: 50, benefit: 'Legendary rewards', icon: '🌟' },
  ]

  const recentActivities = [
    { action: 'Daily login', xp: 10, date: 'Today' },
    { action: 'Completed profile', xp: 50, date: 'Yesterday' },
    { action: 'Invited friend', xp: 100, date: '2 days ago' },
    { action: 'Made first transaction', xp: 25, date: '3 days ago' },
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
        <h1 className="text-lg font-semibold text-gray-900 ml-3">My Level</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Current Level Card */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90">Current Level</p>
                <h2 className="text-4xl font-bold">Level {levelInfo.level}</h2>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Star size={32} className="text-yellow-200" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span>{levelInfo.currentXP} XP</span>
                <span>{levelInfo.nextLevelXP} XP</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <p className="text-xs opacity-90">
              {levelInfo.nextLevelXP - levelInfo.currentXP} XP to reach Level {levelInfo.level + 1}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <TrendingUp size={20} className="text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">{levelInfo.totalXP}</p>
              <p className="text-xs text-gray-500">Total XP</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <Award size={20} className="text-purple-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">12</p>
              <p className="text-xs text-gray-500">Achievements</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <Zap size={20} className="text-yellow-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">5</p>
              <p className="text-xs text-gray-500">Streak Days</p>
            </div>
          </div>

          {/* Level Benefits */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Crown size={20} className="text-yellow-500" />
                Level Benefits
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {levelBenefits.map((benefit) => (
                <div key={benefit.level} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{benefit.benefit}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    Level {benefit.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Zap size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">+{activity.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
