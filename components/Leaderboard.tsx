'use client'

import React, { useState, useEffect } from 'react'

interface LeaderboardProps {
  onBack: () => void
}

type LeaderboardTab = 'honour' | 'charm' | 'room'

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

      // Loop through RGBA pixels and erase green screen background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Green Chroma Key Detection
        if (g > 60 && g > r * 1.25 && g > b * 1.25) {
          data[i + 3] = 0 // Transparent alpha
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
      className="fixed inset-0 bg-[#3B0508] text-white overflow-hidden flex flex-col select-none"
      style={{ touchAction: 'manipulation', WebkitUserSelect: 'none' }}
    >
      {/* BACKGROUND TOP IMAGE: Exactly 50vh blended into Dark Red */}
      <div
        className="absolute top-0 left-0 w-full pointer-events-none z-0 overflow-hidden"
        style={{
          height: '50vh',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
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

      {/* FIXED TOP SECTION (Top 1, 2, 3 Podium) - NO SCROLL */}
      <div className="relative z-10 w-full shrink-0 flex flex-col items-center px-4">
        <div className="w-full max-w-md flex flex-col items-center gap-2 mt-2">
          {/* Row 1: Top 1 (Center) */}
          <div className="flex justify-center w-full">
            <ChromaImage
              src="/1787994771034~2.jpg"
              alt="Top 1"
              className="w-40 h-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Row 2: Top 2 (Left) & Top 3 (Right) */}
          <div className="flex justify-between items-center w-full px-6 -mt-3">
            <ChromaImage
              src="/1787994751636~2.jpg"
              alt="Top 2"
              className="w-30 h-auto object-contain drop-shadow-lg"
            />
            <ChromaImage
              src="/1787994761762~2.jpg"
              alt="Top 3"
              className="w-30 h-auto object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* 10vh Middle Gap - Fixed */}
        <div style={{ height: '15vh' }} className="w-full shrink-0" />
      </div>

      {/* ONLY SCROLLABLE AREA: TOP 4 TO 50 CARDS */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden pb-8 px-4 flex flex-col items-center">
        <div className="w-full max-w-md flex flex-col gap-2">
          {rankCards.map((rank) => (
            <div
              key={rank}
              className="relative w-full flex items-center justify-center rounded-xl overflow-hidden shrink-0"
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

