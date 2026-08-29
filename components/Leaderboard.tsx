'use client'

import React, { useState, useEffect } from 'react'

interface LeaderboardProps {
  onBack: () => void
}

type LeaderboardTab = 'honour' | 'charm' | 'room'

// Global cache for processed images to avoid lag
const processedImageCache: Record<string, string> = {}

// Chroma Key Processor: Supports removing 'green' or 'white'
function ChromaImage({
  src,
  alt,
  className = '',
  removeType = 'green',
}: {
  src: string
  alt: string
  className?: string
  removeType?: 'green' | 'white'
}) {
  const cacheKey = `${src}-${removeType}`
  const [dataUrl, setDataUrl] = useState<string>(processedImageCache[cacheKey] || '')

  useEffect(() => {
    if (processedImageCache[cacheKey]) {
      setDataUrl(processedImageCache[cacheKey])
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || 300
      canvas.height = img.naturalHeight || 300
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      if (!ctx) return
      ctx.drawImage(img, 0, 0)

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (removeType === 'green') {
          // Green screen removal
          if (g > 50 && g > r * 1.15 && g > b * 1.15) {
            data[i + 3] = 0
          }
        } else if (removeType === 'white') {
          // White background removal
          if (r > 215 && g > 215 && b > 215) {
            data[i + 3] = 0
          }
        }
      }

      ctx.putImageData(imgData, 0, 0)
      const finalUrl = canvas.toDataURL('image/png')
      processedImageCache[cacheKey] = finalUrl
      setDataUrl(finalUrl)
    }
  }, [src, removeType, cacheKey])

  if (!dataUrl) {
    return <div className={`opacity-0 ${className}`} style={{ minHeight: '30px' }} />
  }

  return <img src={dataUrl} alt={alt} className={className} draggable="false" />
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('honour')

  const tabs: { id: LeaderboardTab; label: string }[] = [
    { id: 'honour', label: 'Honour' },
    { id: 'charm', label: 'Charm' },
    { id: 'room', label: 'Room' },
  ]

  const tabImages: Record<LeaderboardTab, { top: string }> = {
    honour: { top: '/IMG-20260820-WA0068.jpg' },
    charm: { top: '/file_000000006adc82118aca1654ab78b34a.png' },
    room: { top: '/file_000000006f4082119aa31cd73d4211e2.png' },
  }

  // Rank 4 to 50
  const rankCards = Array.from({ length: 47 }, (_, i) => i + 4)

  return (
    <div
      className="fixed inset-0 bg-[#1A0204] text-white overflow-hidden flex flex-col select-none"
      style={{ touchAction: 'manipulation', WebkitUserSelect: 'none' }}
    >
      {/* BACKGROUND TOP IMAGE: 50vh blended into Ultra-Dark Red */}
      <div
        className="absolute top-0 left-0 w-full pointer-events-none z-0 overflow-hidden"
        style={{
          height: '50vh',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
        }}
      >
        <img
          key={`${activeTab}-top`}
          src={tabImages[activeTab].top}
          alt={`${activeTab} top`}
          className="w-full h-full object-cover"
          draggable="false"
        />
      </div>

      {/* FIXED TOP HEADER */}
      <header className="relative z-50 flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={onBack}
          className="p-2 text-white active:opacity-60 transition-opacity"
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <div className="flex items-center justify-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative pb-1.5 font-semibold text-base transition-colors"
              style={{
                color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        <button
          className="p-2 text-white active:opacity-60 transition-opacity text-xl font-bold"
          aria-label="Info"
        >
          ?
        </button>
      </header>

      {/* FIXED PODIUM SECTION: Top 1, 2, 3 with Avatars, Frames, and Details */}
      <div className="relative z-10 w-full shrink-0 flex flex-col items-center px-3">
        <div className="w-full max-w-md relative flex flex-col items-center mt-2">
          
          {/* Top 1 (Center) */}
          <div className="flex flex-col items-center z-20">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Circle Avatar */}
              <img
                src="/assets/logo.png"
                alt="User Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#D4AF37] shadow-md z-0"
              />
              {/* Top 1 Frame Layer Over Avatar */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <ChromaImage
                  src="/1787994771034~2.jpg"
                  alt="Top 1 Frame"
                  className="w-45 h-full object-contain"
                  removeType="green"
                />
              </div>
            </div>
            {/* User Name & Score */}
            <span className="text-xs font-bold text-white mt-1">User</span>
            <div className="flex items-center gap-1 mt-0.5">
              <ChromaImage
                src="/1786855398290.png"
                alt="Score Icon"
                className="w-4 h-4 object-contain"
                removeType="white"
              />
              <span className="text-[11px] font-semibold text-[#FFD700]">82828</span>
            </div>
          </div>

          {/* Row for Top 2 (Far Left) & Top 3 (Far Right) */}
          <div className="w-full flex justify-between items-center -mt-16 px-1 z-10">
            {/* Top 2 (Left Corner) */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <img
                  src="/assets/logo.png"
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#C0C0C0] shadow-md z-0"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <ChromaImage
                    src="/1787994751636~2.jpg"
                    alt="Top 2 Frame"
                    className="w-40 h-full object-contain"
                    removeType="green"
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-white mt-0.5">User</span>
              <div className="flex items-center gap-1 mt-0.5">
                <ChromaImage
                  src="/1786855398290.png"
                  alt="Score Icon"
                  className="w-3.5 h-3.5 object-contain"
                  removeType="white"
                />
                <span className="text-[10px] font-semibold text-[#FFD700]">82828</span>
              </div>
            </div>

            {/* Top 3 (Right Corner) */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <img
                  src="/assets/logo.png"
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#CD7F32] shadow-md z-0"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <ChromaImage
                    src="/1787994761762~2.jpg"
                    alt="Top 3 Frame"
                    className="w-40 h-full object-contain"
                    removeType="green"
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-white mt-0.5">User</span>
              <div className="flex items-center gap-1 mt-0.5">
                <ChromaImage
                  src="/1786855398290.png"
                  alt="Score Icon"
                  className="w-3.5 h-3.5 object-contain"
                  removeType="white"
                />
                <span className="text-[10px] font-semibold text-[#FFD700]">82828</span>
              </div>
            </div>
          </div>

        </div>

        {/* 10vh Fixed Middle Gap */}
        <div style={{ height: '10vh' }} className="w-full shrink-0" />
      </div>

      {/* SCROLLABLE 4 TO 50 CARDS SECTION */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden pb-8 px-4 flex flex-col items-center">
        <div className="w-full max-w-md flex flex-col gap-1.5">
          {rankCards.map((rank) => (
            <div
              key={rank}
              className="relative w-full flex items-center rounded-xl overflow-hidden shrink-0 h-16"
            >
              {/* Card Background Image (Green removed) */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <ChromaImage
                  src="/1787992320047~2.jpg"
                  alt={`Rank ${rank}`}
                  className="w-120 h-full object-cover"
                  removeType="green"
                />
              </div>

              {/* Card Foreground Content */}
              <div className="relative z-10 w-full flex items-center justify-between px-4">
                {/* Left Side: Avatar + Name */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white/70 w-4">{rank}</span>
                  <img
                    src="/assets/logo.png"
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border border-white/40 shadow-sm"
                  />
                  <span className="text-sm font-bold text-white tracking-wide">User</span>
                </div>

                {/* Right Side: Score Icon (White removed) + Text */}
                <div className="flex items-center gap-1.5">
                  <ChromaImage
                    src="/1786855398290.png"
                    alt="Score Icon"
                    className="w-5 h-5 object-contain"
                    removeType="white"
                  />
                  <span className="text-sm font-extrabold text-[#FFD700] tracking-wide">
                    7273773
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

