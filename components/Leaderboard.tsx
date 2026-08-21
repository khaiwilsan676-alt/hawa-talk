'use client'

import { useState, useEffect } from 'react'

interface LeaderboardProps {
  onBack: () => void
}

type LeaderboardTab = 'honour' | 'charm' | 'room'

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('honour')
  const [mounted, setMounted] = useState(false)

  // Mount animation
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(id)
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

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{
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
          margin: 0;
          padding: 0;
        }
        button, div, span {
          touch-action: manipulation;
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

      {/* Full screen images container */}
      <div className="w-full h-full relative">
        {/* Top image - 60% */}
        <div
          className="w-full absolute top-0 left-0 overflow-hidden"
          style={{
            height: '60%',
            animation: mounted ? 'imageFadeIn 0.5s ease-out' : 'none',
          }}
        >
          <img
            key={`${activeTab}-top`}
            src={tabImages[activeTab].top}
            alt={`${activeTab} leaderboard top`}
            className="w-full h-full object-cover"
            draggable="false"
          />
        </div>

        {/* Bottom image - 40% */}
        <div
          className="w-full absolute bottom-0 left-0 overflow-hidden"
          style={{
            height: '40%',
            animation: mounted ? 'imageFadeIn 0.5s ease-out 0.1s' : 'none',
          }}
        >
          <img
            key={`${activeTab}-bottom`}
            src={tabImages[activeTab].bottom}
            alt={`${activeTab} leaderboard bottom`}
            className="w-full h-full object-cover object-top"
            draggable="false"
          />
        </div>

        {/* OVERLAY: Header with Back, Tabs, Question Mark - ON TOP OF IMAGES */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 safe-top">
          {/* Back Arrow */}
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all"
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span 
                    className="absolute left-0 right-0 -bottom-0 h-0.5 bg-white rounded-full"
                    style={{ animation: 'tabIndicator 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Question Mark */}
          <button
            className="p-2 -mr-2 rounded-full hover:bg-white/10 active:scale-90 transition-all"
            aria-label="Info"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
