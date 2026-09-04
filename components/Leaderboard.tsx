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

  // Find index of active sub-tab for the moveable highlight
  const activeSubTabIndex = subTabs.findIndex(st => st.id === activeSubTab)

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

      {/* FIXED TOP HEADER */}
      <header
        className="relative z-50 flex flex-col w-full mt-4"
        style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 12px)' }}
      >
        {/* Row 1: Back Icon (Corner) - Tabs Card (Center) - Info Icon (Corner) */}
        {/* Yahan mb-1.5 kar diya hai gap kam karne ke liye */}
        <div className="relative flex items-center justify-center w-full h-[45px] mb-1.5">
          
          {/* Back Button as Image - Ekdam Left Corner */}
          <button
            onClick={onBack}
            className="absolute left-2 flex items-center justify-center active:opacity-70 transition-opacity p-1"
            aria-label="Back"
          >
            <img 
              src="/file_0000000051d881f5af4f9cf84a56dcd3.png" 
              alt="Back" 
              className="w-10 h-10 object-contain"
              draggable="false"
            />
          </button>

          {/* Main Tabs Container - Center */}
          <div className="flex items-center justify-between h-[42px] border-[1px] border-[#D4AF37] rounded-full bg-[#110A07]/80 w-[55%] max-w-[260px] overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.6)] px-[2px]">
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

                    {/* Info Button - Image, Ekdam Right Corner */}
          <button
            className="absolute right-2 flex items-center justify-center active:opacity-70 transition-opacity p-1"
            aria-label="Info"
          >
            <img 
              src="/file_0000000073ec820b832b6dafb168dabe.png" 
              alt="Info" 
              className="w-10 h-10 object-contain"
              draggable="false"
            />
          </button>


                {/* 1. SUB-TABS SECTION (Daily, Weekly, Monthly) */}
        {/* Yahan gap-4 likha hai, isko gap-2 ya gap-1 karke apne hisaab se space set kar lena bss */}
        <div className="relative h-[40px] z-10 flex items-center justify-start gap-1 ml-4 shrink-0 self-start">
          {subTabs.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveSubTab(st.id)}
              className="relative z-10 px-3 flex items-center justify-center text-[15px] font-bold transition-colors"
              style={{
                color: activeSubTab === st.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <span className="relative z-10">{st.label}</span>
              
              {/* Golden Highlight sidha active tab ke andar laga diya, ab math ki zarurat nahi */}
              {activeSubTab === st.id && (
                <span className="absolute z-0 bottom-0 top-[2px] left-0 right-0 bg-gradient-to-b from-[#D4AF37]/40 via-[#D4AF37]/15 to-transparent rounded-md shadow-[0_-2px_5px_rgba(212,175,55,0.4)]">
                   <span className="absolute left-[20%] right-[20%] top-[-1px] h-[3px] bg-[#FFF] rounded-full blur-[0.5px]" />
                </span>
              )}
            </button>
          ))}
        </div>


          {/* Moveable Golden Highlight Shape - Adjusted math for fixed width left alignment */}
          <span
            className="absolute z-0 bottom-0 top-[2px] h-full w-[calc(33.33%-4px)] bg-gradient-to-b from-[#D4AF37]/40 via-[#D4AF37]/15 to-transparent rounded-md transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(${activeSubTabIndex * 100}% + ${activeSubTabIndex * 6}px))`,
              boxShadow: '0 -2px 5px rgba(212, 175, 55, 0.4)',
            }}
          >
            <span className="absolute left-[30%] right-[30%] top-[-1px] h-[3px] bg-[#FFF] rounded-full scale-y-[1.2] blur-[0.5px]" />
          </span>
        </div>
      </header>

      {/* 2. TOP IMAGES PODIUM (Top 1, 2, 3) */}
      <div className="relative z-10 w-full shrink-0 flex flex-col items-center">
        <div className="w-full flex flex-col items-center gap-0.5 mt-1">
          {/* Row 1: Top 1 (Center) */}
          <div className="flex justify-center w-full">
            <ChromaImage
              src="/1787994771034~2.jpg"
              alt="Top 1"
              className="w-45 h-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Row 2: Top 2 & Top 3 */}
          <div className="flex justify-between items-center w-full px-0 mt-4">
            <ChromaImage
              src="/1787994751636~2.jpg"
              alt="Top 2"
              className="w-40 h-auto object-contain drop-shadow-lg -ml-1"
            />
            <ChromaImage
              src="/1787994761762~2.jpg"
              alt="Top 3"
              className="w-40 h-auto object-contain drop-shadow-lg -mr-1"
            />
          </div>
        </div>
      </div>

      {/* 3. SPACE (5vh) */}
      <div style={{ height: '5vh' }} className="w-full shrink-0 relative z-10" />

            {/* 4. FRAME AFTER SPACE (Sirf Top Wali Image, Apni jagah fix rahegi) */}
      <div className="relative w-full z-20 flex h-[35px] sm:h-[45px] shrink-0 mt-2">
        <img
          src="/IMG_20260904_125516.png"
          alt="Frame Border"
          className="absolute inset-0 w-full h-full object-fill"
        />
      </div>

      {/* 5. SCROLLABLE SECTION: RANK 4 TO 50 CARDS WIDE */}
      <div className="relative z-10 w-full flex-grow overflow-y-auto overflow-x-hidden pt-2 pb-[100px]">
        
        {/* Is div ko relative rakha hai taaki side frames iske andar fix rahein */}
        <div className="relative w-full flex flex-col gap-1.5 items-center">
          
          {/* LEFT CORNER IMAGE - Absolute hai toh cards ko touch/shift nahi karegi */}
          <img
            src="/IMG_20260904_125547.png"
            alt="Left Frame"
            className="absolute left-0 top-0 h-full w-[25px] sm:w-[35px] object-fill z-20 pointer-events-none"
          />
          
          {/* RIGHT CORNER IMAGE - Absolute hai toh cards ko touch/shift nahi karegi */}
          <img
            src="/IMG_20260904_125547.png"
            alt="Right Frame"
            className="absolute right-0 top-0 h-full w-[25px] sm:w-[35px] object-fill z-20 pointer-events-none scale-x-[-1]"
          />

          {/* Tere 4 to 50 Cards (Bina kisi shift ke apni jagah par aayenge) */}
          {rankCards.map((rank) => (
            <div
              key={rank}
              className="relative w-full flex items-center justify-start overflow-hidden shrink-0 h-[80px]"
            >
              <ChromaImage
                src="/1787992320047~2.jpg"
                alt={`Rank ${rank}`}
                className="absolute inset-0 w-full h-full object-fill"
              />
              <span className="relative z-10 left-10 text-white font-bold text-lg">{rank}</span>
            </div>
          ))}
        </div>
      </div>


      {/* 6. FIXED BOTTOM USER CARD */}
      <div className="fixed bottom-0 left-0 w-full h-[90px] px-0 py-0 z-50 pointer-events-auto shadow-[0_-5px_20px_rgba(0,0,0,0.8)] border-t-[1.5px] border-[#694B2E] bg-gradient-to-b from-[#3E2114] via-[#2A1309] to-[#120703]">
        <div className="relative w-full h-full flex items-center justify-start px-6 gap-5">
           <span className="text-[#D4AF37] font-bold text-2xl drop-shadow-md">100+</span>
           <div className="w-[52px] h-[52px] rounded-full border-2 border-[#D4AF37] bg-black/60 shadow-[0_0_8px_rgba(212,175,55,0.6)]" /> 
        </div>
      </div>

    </div>
  )
}

