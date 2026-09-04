'use client'

import React, { useState, useEffect } from 'react'

interface LeaderboardProps {
  onBack: () => void
}

type LeaderboardTab = 'wealth' | 'charm' | 'room'
type LeaderboardSubTab = 'daily' | 'weekly' | 'monthly'

// Global in-memory cache to prevent re-processing same image multiple times
const processedImageCache: Record<string, string> = {}

// Ultra-fast Chroma Key green screen remover without WebGL crashes
function ChromaImage({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  const [dataUrl, setDataUrl] = useState<string>(processedImageCache[src] || '')

  useEffect(() => {
    if (processedImageCache[src]) {
      setDataUrl(processedImageCache[src])
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

      // Loop through RGBA pixels and erase green screen background cleanly
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Sharp green chroma detection
        if (g > 50 && g > r * 1.15 && g > b * 1.15) {
          data[i + 3] = 0 // Transparent
        }
      }

      ctx.putImageData(imgData, 0, 0)
      const finalUrl = canvas.toDataURL('image/png')
      processedImageCache[src] = finalUrl
      setDataUrl(finalUrl)
    }
  }, [src])

  if (!dataUrl) {
    return <div className={`opacity-0 ${className}`} style={{ minHeight: '60px' }} />
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      className={className}
      draggable="false"
    />
  )
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('wealth')
  const [activeSubTab, setActiveSubTab] = useState<LeaderboardSubTab>('daily')

  const tabs: { id: LeaderboardTab; label: string }[] = [
    { id: 'wealth', label: 'Wealth' },
    { id: 'charm', label: 'Charm' },
    { id: 'room', label: 'Room' },
  ]

  const subTabs: { id: LeaderboardSubTab; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
  ]

  const tabImages: Record<LeaderboardTab, { top: string }> = {
    wealth: { top: '/IMG-20260820-WA0068.jpg' },
    charm: { top: '/file_000000006adc82118aca1654ab78b34a.png' },
    room: { top: '/file_000000006f4082119aa31cd73d4211e2.png' },
  }

  // Find index of active sub-tab for the moveable highlight
  const activeSubTabIndex = subTabs.findIndex(st => st.id === activeSubTab)

  // Rank 4 to 50
  const rankCards = Array.from({ length: 47 }, (_, i) => i + 4)

  return (
    <div
      className="min-h-screen bg-[#1A0204] text-white overflow-y-auto overflow-x-hidden flex flex-col select-none relative"
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

      {/* FIXED TOP HEADER (Icons and Tabs styled exactly like image) */}
      <header
        className="relative z-50 flex flex-col items-center px-4 pb-3 shrink-0 w-full"
        style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 12px)' }}
      >
        {/* Main Row: Back - Tabs - Info */}
        <div className="flex items-center justify-between w-full h-[38px] mb-4">
          <div className="flex justify-start">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full border-[1.5px] border-[#D4AF37] flex items-center justify-center text-[#D4AF37] bg-black/40 active:opacity-60 transition-opacity"
              aria-label="Back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center h-full bg-black/50 border border-[#D4AF37] rounded-full px-6 py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative text-sm font-semibold transition-colors px-1"
                style={{
                  color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute -bottom-[2px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              className="w-8 h-8 rounded-full border-[1.5px] border-[#D4AF37] flex items-center justify-center text-[#D4AF37] bg-black/40 active:opacity-60 transition-opacity font-bold text-sm"
              aria-label="Info"
            >
              ?
            </button>
          </div>
        </div>

        {/* 1. SUB-TABS SECTION (Daily, Weekly, Monthly with moveable complex highlight) */}
        <div className="relative w-full h-[40px] z-10 flex items-center justify-center gap-1.5 px-4 mb-2 shrink-0">
          {subTabs.map((st, index) => (
            <button
              key={st.id}
              onClick={() => setActiveSubTab(st.id)}
              className="relative z-10 flex-1 flex items-center justify-center text-sm font-bold transition-colors"
              style={{
                color: activeSubTab === st.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {st.label}
            </button>
          ))}

          {/* Moveable Golden Highlight Shape (Semi-transparent gold with subtle top decoration) */}
          <span
            className="absolute z-0 bottom-0 top-[2px] h-full w-[calc(33.33%-6px)] bg-gradient-to-b from-[#D4AF37]/40 via-[#D4AF37]/15 to-transparent rounded-md transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(${activeSubTabIndex * 100}% + ${activeSubTabIndex * 8}px))`,
              boxShadow: '0 -2px 5px rgba(212, 175, 55, 0.4)',
            }}
          >
            {/* Subtle stylized top element, approximating the arch in reference */}
            <span className="absolute left-[35%] right-[35%] top-[-1px] h-[3px] bg-[#D4AF37] rounded-full scale-y-[1.2] blur-[0.3px]" />
          </span>
        </div>
      </header>

      {/* 2. TOP IMAGES PODIUM (Top 1, 2, 3) */}
      <div className="relative z-10 w-full shrink-0 flex flex-col items-center">
        <div className="w-full flex flex-col items-center gap-1 mt-0">
          {/* Row 1: Top 1 (Center) - Adjusted height for visual balance with header */}
          <div className="flex justify-center w-full">
            <ChromaImage
              src="/1787994771034~2.jpg"
              alt="Top 1"
              className="w-45 h-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Row 2: Top 2 & Top 3 */}
          <div className="flex justify-between items-center w-full px-0 -mt-4">
            <ChromaImage
              src="/1787994751636~2.jpg"
              alt="Top 2"
              className="w-50 h-auto object-contain drop-shadow-lg -ml-1"
            />
            <ChromaImage
              src="/1787994761762~2.jpg"
              alt="Top 3"
              className="w-50 h-auto object-contain drop-shadow-lg -mr-1"
            />
          </div>
        </div>
      </div>

      {/* 3. SPACE (5vh) */}
      <div style={{ height: '5vh' }} className="w-full shrink-0 relative z-10" />

      {/* 4. TUMHARI IMAGE THEEK SPACE KE BAAD (Edge to Edge with Corners) */}
      <div className="relative w-full z-20 flex h-[35px] sm:h-[45px] shrink-0 mt-2">
        {/* Main Center Image Edge to Edge */}
        <img
          src="/public/IMG_20260904_125516.png"
          alt="Frame Border"
          className="absolute inset-0 w-full h-full object-fill"
        />
        {/* Left Corner */}
        <img
          src="/public/IMG_20260904_125547.png"
          alt="Left Corner"
          className="absolute left-0 top-0 h-full w-auto object-contain"
        />
        {/* Right Corner (Flipped to face inwards) */}
        <img
          src="/public/IMG_20260904_125547.png"
          alt="Right Corner"
          className="absolute right-0 top-0 h-full w-auto object-contain scale-x-[-1]"
        />
      </div>

      {/* 5. SCROLLABLE SECTION: RANK 4 TO 50 CARDS (Edge-to-Edge Full Width) */}
      <div className="relative z-10 w-full pb-16 pt-2 flex flex-col items-center bg-[#1A0204]">
        <div className="w-full flex flex-col gap-1.5 items-center">
          {rankCards.map((rank) => (
            <div
              key={rank}
              className="relative w-full flex items-center justify-center overflow-hidden shrink-0"
            >
              <ChromaImage
                src="/1787992320047~2.jpg"
                alt={`Rank ${rank}`}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

