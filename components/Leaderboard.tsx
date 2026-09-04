'use client'

import React, { useState, useEffect } from 'react'

interface LeaderboardProps {
  onBack: () => void
}

type LeaderboardTab = 'honour' | 'charm' | 'room'
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
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('honour')
  const [activeSubTab, setActiveSubTab] = useState<LeaderboardSubTab>('daily')

  const tabs: { id: LeaderboardTab; label: string }[] = [
    { id: 'honour', label: 'Honour' },
    { id: 'charm', label: 'Charm' },
    { id: 'room', label: 'Room' },
  ]

  const subTabs: { id: LeaderboardSubTab; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
  ]

  const tabImages: Record<LeaderboardTab, { top: string }> = {
    honour: { top: '/file_00000000b83c81fa93d3e53e046c1b81.png' },
    charm: { top: '/file_0000000086f481fa8653fc12d2577596.png' },
    room: { top: '/file_00000000619c822f8a1577f69e039527.png' },
  }

  // Rank 4 to 50
  const rankCards = Array.from({ length: 47 }, (_, i) => i + 4)

  return (
    <div
      className="min-h-screen bg-[#1A0204] text-white overflow-y-auto overflow-x-hidden flex flex-col select-none relative"
      style={{ touchAction: 'manipulation', WebkitUserSelect: 'none' }}
    >
      {/* BACKGROUND TOP IMAGE: 60vh blended into Ultra-Dark Red */}
      <div
        className="absolute top-0 left-0 w-full pointer-events-none z-0 overflow-hidden"
        style={{
          height: '60vh',
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

      {/* FIXED TOP HEADER (Redesigned exactly based on your reference) */}
      <header
        className="relative z-50 flex flex-col items-center px-4 pb-3 shrink-0 w-full mt-4"
        style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 12px)' }}
      >
        {/* Main Row: Back - Tabs - Info */}
        <div className="flex items-center justify-between w-full h-[45px] mb-6 px-1">
          {/* Back Button as Image */}
          <div className="flex justify-start">
            <button
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center active:opacity-70 transition-opacity"
              aria-label="Back"
            >
              <img 
                src="/file_0000000051d881f5af4f9cf84a56dcd3.png" 
                alt="Back" 
                className="w-full h-full object-contain"
                draggable="false"
              />
            </button>
          </div>

          {/* Main Tabs Container */}
          <div className="flex items-center justify-between h-[42px] border-[1px] border-[#D4AF37] rounded-full bg-[#110A07]/80 w-[60%] max-w-[280px] overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.6)] px-[2px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 text-[15px] font-semibold h-[38px] rounded-full transition-all flex items-center justify-center ${
                  activeTab === tab.id ? 'text-white' : 'text-[#8A857D]'
                }`}
              >
                {activeTab === tab.id && (
                  <span className="absolute inset-0 bg-gradient-to-b from-[#E7B865] via-[#BA7627] to-[#743410] rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]" />
                )}
                <span className="relative z-10 drop-shadow-md">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Info Button */}
          <div className="flex justify-end">
            <button
              className="w-9 h-9 rounded-full border-[1.5px] border-[#D4AF37] flex items-center justify-center text-white bg-[#110A07]/70 active:opacity-60 transition-opacity font-bold text-[18px] shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              aria-label="Info"
            >
              ?
            </button>
          </div>
        </div>

        {/* 1. SUB-TABS SECTION (Daily, Weekly, Monthly) */}
        <div className="relative w-[75%] h-[30px] z-10 flex items-center justify-between shrink-0 mb-2">
          {subTabs.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveSubTab(st.id)}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center text-[16px] font-medium transition-colors ${
                activeSubTab === st.id ? 'text-[#F9DFC1] drop-shadow-lg' : 'text-[#8A857D]'
              }`}
            >
              <span>{st.label}</span>
              
              {/* Glowing Line Underneath Active Tab */}
              {activeSubTab === st.id && (
                <div className="absolute -bottom-2 w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#FDE3A7] to-transparent rounded-full shadow-[0_0_5px_#FDE3A7] blur-[0.5px]" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* 2. TOP IMAGES PODIUM (Top 1, 2, 3) */}
      <div className="relative z-10 w-full shrink-0 flex flex-col items-center">
        <div className="w-full flex flex-col items-center gap-1 mt-2">
          {/* Row 1: Top 1 (Center) */}
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

      {/* 5. SCROLLABLE SECTION: RANK 4 TO 50 CARDS */}
      <div className="relative z-10 w-full flex-grow overflow-y-auto overflow-x-hidden pt-2 pb-[100px]">
        <div className="w-full flex flex-col gap-1.5 items-center">
          {rankCards.map((rank) => (
            <div
              key={rank}
              className="relative w-full flex items-center justify-center overflow-hidden shrink-0 h-[80px]"
            >
              <ChromaImage
                src="/1787992320047~2.jpg"
                alt={`Rank ${rank}`}
                className="w-full h-auto object-cover"
              />
              <span className="absolute left-10 text-white font-bold text-lg">{rank}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. FIXED BOTTOM USER CARD (Dark Glossy Brown with NO Background Image) */}
      <div className="fixed bottom-0 left-0 w-full h-[90px] px-0 py-0 z-50 pointer-events-auto shadow-[0_-5px_20px_rgba(0,0,0,0.8)] border-t-[1.5px] border-[#694B2E] bg-gradient-to-b from-[#3E2114] via-[#2A1309] to-[#120703]">
        <div className="relative w-full h-full flex items-center justify-start px-6 gap-5">
           <span className="text-[#D4AF37] font-bold text-2xl drop-shadow-md">100+</span>
           <div className="w-[52px] h-[52px] rounded-full border-2 border-[#D4AF37] bg-black/60 shadow-[0_0_8px_rgba(212,175,55,0.6)]" /> 
           {/* Yahan par user ki details ayengi later... */}
        </div>
      </div>

    </div>
  )
}

