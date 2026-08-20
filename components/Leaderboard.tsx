'use client'

import { useState, useEffect } from 'react'

interface LeaderboardProps {
  onBack: () => void
}

type LeaderboardTab = 'honour' | 'charm' | 'room'

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('honour')
  const [viewportHeight, setViewportHeight] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Set viewport height for dynamic sizing
  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      setViewportHeight(window.innerHeight)
    }
    setHeight()
    window.addEventListener('resize', setHeight)
    window.addEventListener('orientationchange', setHeight)
    
    // Android fix
    const isAndroid = navigator.userAgent.toLowerCase().includes('android')
    if (isAndroid) {
      setTimeout(setHeight, 100)
      setTimeout(setHeight, 300)
    }
    
    return () => {
      window.removeEventListener('resize', setHeight)
      window.removeEventListener('orientationchange', setHeight)
    }
  }, [])

  // Mount animation
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(id)
  }, [])

  // Viewport meta for mobile
  useEffect(() => {
    const existingMeta = document.querySelector('meta[name="viewport"]')
    if (existingMeta) {
      existingMeta.remove()
    }
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    document.head.appendChild(meta)
    return () => {
      const metaTag = document.querySelector('meta[name="viewport"]')
      if (metaTag && metaTag.getAttribute('content') === 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover') {
        metaTag.remove()
      }
    }
  }, [])

  // Tab data
  const tabs: { id: LeaderboardTab; label: string }[] = [
    { id: 'honour', label: 'Honour' },
    { id: 'charm', label: 'Charm' },
    { id: 'room', label: 'Room' },
  ]

  // Image data for each tab
  const tabImages: Record<LeaderboardTab, { top: string; bottom: string }> = {
    honour: {
      top: '/IMG-20260820-WA0068.jpg',
      bottom: '/IMG_20260821_005021.png'
    },
    charm: {
      top: '/file_000000006adc82118aca1654ab78b34a.png',
      bottom: '/IMG_20260821_004949.png'
    },
    room: {
      top: '/file_000000006f4082119aa31cd73d4211e2.png',
      bottom: '/IMG_20260821_005004.png'
    }
  }

  const topHeight = viewportHeight ? `calc(var(--vh, 1vh) * 40)` : '40vh'
  const bottomHeight = viewportHeight ? `calc(var(--vh, 1vh) * 60)` : '60vh'

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{
        minHeight: viewportHeight ? `calc(var(--vh, 1vh) * 100)` : '100vh',
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      <style>{`
        * {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          touch-action: manipulation;
        }
        button, div, span {
          touch-action: manipulation;
        }
        @keyframes slideInLeft {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes tabIndicator {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes imageFadeIn {
          0% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 safe-top">
        {/* Back Arrow */}
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-90 transition-all"
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Tabs */}
        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-1.5 text-sm font-bold transition-colors ${
                activeTab === tab.id
                  ? 'text-[#1D1D1F]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span 
                  className="absolute left-0 right-0 -bottom-0 h-0.5 bg-[#1D1D1F] rounded-full"
                  style={{ animation: 'tabIndicator 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Question Mark */}
        <button
          className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:scale-90 transition-all"
          aria-label="Info"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Top 40Vh */}
        <div
          className="w-full relative overflow-hidden"
          style={{
            height: topHeight,
            minHeight: topHeight,
            animation: mounted ? 'imageFadeIn 0.5s ease-out' : 'none',
          }}
        >
          <img
            key={`${activeTab}-top`}
            src={tabImages[activeTab].top}
            alt={`${activeTab} leaderboard top`}
            className="w-full h-full object-cover"
            style={{
              animation: 'imageFadeIn 0.4s ease-out',
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
            draggable="false"
          />
        </div>

        {/* Bottom 60Vh */}
        <div
          className="w-full relative overflow-hidden"
          style={{
            height: bottomHeight,
            minHeight: bottomHeight,
            animation: mounted ? 'imageFadeIn 0.5s ease-out 0.1s' : 'none',
          }}
        >
          <img
            key={`${activeTab}-bottom`}
            src={tabImages[activeTab].bottom}
            alt={`${activeTab} leaderboard bottom`}
            className="w-full h-full object-cover"
            style={{
              animation: 'imageFadeIn 0.4s ease-out',
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
            draggable="false"
          />
        </div>
      </div>
    </div>
  )
      }
