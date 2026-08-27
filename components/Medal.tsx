'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Star } from 'lucide-react'
import Image from 'next/image'

interface MedalProps {
  onBack: () => void
}

interface MedalItem {
  id: string
  name: string
  image: string
  stars: number
  category: 'achievement' | 'gift' | 'activity'
}

export default function Medal({ onBack }: MedalProps) {
  const [activeTab, setActiveTab] = useState<'achievement' | 'gift' | 'activity'>('achievement')

  // Sample data mapped to your provided images
  const medals: MedalItem[] = [
    {
      id: '1',
      name: 'Decabillionaire',
      image: '/IMG_20260828_003941.png',
      stars: 5,
      category: 'achievement',
    },
    {
      id: '2',
      name: 'Charm Legend',
      image: '/IMG_20260828_003922.png',
      stars: 5,
      category: 'achievement',
    },
    {
      id: '3',
      name: 'Billionaire',
      image: '/IMG_20260828_003958.png',
      stars: 4,
      category: 'achievement',
    },
    {
      id: '4',
      name: 'Charm Luminary',
      image: '/IMG_20260828_003922.png',
      stars: 4,
      category: 'achievement',
    },
  ]

  const filteredMedals = medals.filter((m) => m.category === activeTab)

  return (
    <div className="min-h-screen bg-[#0d0718] text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Background Radial Webshader/Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="p-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-lg font-medium text-white tracking-wide">Medal</h1>
        <div className="w-7" /> {/* Placeholder to center title */}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 relative z-10">
        <div className="max-w-md mx-auto space-y-5">
          {/* Current Medal Showcase Section */}
          <div className="relative pt-2 pb-6">
            {/* Section Divider Title */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-amber-400/50" />
              <span className="text-xs text-amber-200/90 font-medium tracking-wide">
                Current Medal
              </span>
              <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-amber-400/50" />
            </div>

            {/* Showcase 2x5 Grid */}
            <div className="grid grid-cols-5 gap-2 px-1 relative z-10">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl bg-[#160e29]/70 border border-purple-500/20 flex items-center justify-center shadow-inner shadow-black/40 hover:border-amber-400/40 transition-colors cursor-pointer backdrop-blur-sm"
                >
                  <Plus size={14} className="text-amber-400/70" />
                </div>
              ))}
            </div>

            {/* Glowing Podium/Pedestal base */}
            <div className="relative -mt-2">
              <div className="h-6 w-3/4 mx-auto rounded-[100%] bg-gradient-to-r from-blue-600/30 via-purple-500/40 to-blue-600/30 blur-md" />
              <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mt-1 cursor-pointer hover:text-gray-200 transition-colors">
                <span>Obtained Medal(s): 0</span>
                <span className="text-indigo-400 font-medium">Check</span>
                <ChevronRight size={12} className="text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-around border-b border-white/10 pb-2 text-sm">
            <button
              onClick={() => setActiveTab('achievement')}
              className={`relative py-1 font-semibold transition-colors ${
                activeTab === 'achievement'
                  ? 'text-amber-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Achievement
              {activeTab === 'achievement' && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-amber-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('gift')}
              className={`relative py-1 font-semibold transition-colors ${
                activeTab === 'gift'
                  ? 'text-amber-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Gift
              {activeTab === 'gift' && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-amber-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`relative py-1 font-semibold transition-colors ${
                activeTab === 'activity'
                  ? 'text-amber-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Activity
              {activeTab === 'activity' && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-amber-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Medal Cards Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {filteredMedals.map((medal) => (
              <div
                key={medal.id}
                className="bg-[#120a22]/80 border border-purple-800/30 rounded-2xl p-4 flex flex-col items-center justify-between text-center hover:border-purple-600/50 transition-all duration-300 backdrop-blur-md shadow-lg shadow-black/50"
              >
                {/* 3D Medal Image */}
                <div className="relative w-28 h-28 my-1 flex items-center justify-center">
                  <Image
                    src={medal.image}
                    alt={medal.name}
                    width={112}
                    height={112}
                    className="object-contain drop-shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
                    priority
                  />
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 my-1.5">
                  {Array.from({ length: medal.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Medal Name */}
                <h3 className="text-xs font-medium text-gray-200 tracking-wide">
                  {medal.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

