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

  // Card colors for each tab with glossy 3D effects
  const cardColors: Record<LeaderboardTab, {
    primary: string;
    secondary: string;
    highlight: string;
    shadow: string;
    gradient: string;
  }> = {
    honour: {
      primary: '#8B5CF6', // Purple
      secondary: '#6D28D9',
      highlight: '#A78BFA',
      shadow: 'rgba(139, 92, 246, 0.6)',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #4C1D95 100%)'
    },
    charm: {
      primary: '#3B82F6', // Blue
      secondary: '#2563EB',
      highlight: '#60A5FA',
      shadow: 'rgba(59, 130, 246, 0.6)',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1E40AF 100%)'
    },
    room: {
      primary: '#10B981', // Green
      secondary: '#059669',
      highlight: '#34D399',
      shadow: 'rgba(16, 185, 129, 0.6)',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #065F46 100%)'
    },
  }

  const goldenColor = '#D4AF37'

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
        @keyframes cardPop {
          0% { transform: scale(0.85) rotateX(-15deg); opacity: 0; }
          60% { transform: scale(1.1) rotateX(5deg); }
          100% { transform: scale(1.08) rotateX(0deg); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.4), 0 0 30px rgba(212, 175, 55, 0.2), 0 8px 25px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 25px rgba(212, 175, 55, 0.7), 0 0 50px rgba(212, 175, 55, 0.4), 0 8px 35px rgba(0,0,0,0.6); }
        }
        @keyframes float3D {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-2px) rotateX(2deg); }
        }
      `}</style>

      {/* Full screen images container */}
      <div className="w-full h-full relative">
        {/* Top image - 50vh */}
        <div
          className="w-full absolute top-0 left-0 overflow-hidden"
          style={{
            height: '50vh',
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

        {/* Bottom image - 50vh */}
        <div
          className="w-full absolute bottom-0 left-0 overflow-hidden"
          style={{
            height: '50vh',
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
        <div className="absolute top-0 left-0 right-0 z-50 px-5 py-4 safe-top">
          {/* Top Row: Back, Tabs (Top Middle), Question Mark - All in one line */}
          <div className="flex items-center justify-between gap-2.8">
            {/* Back Arrow - Compact Glossy 3D Circle */}
            <button
              onClick={onBack}
              className="relative w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all shrink-0"
              style={{
                background: cardColors[activeTab].gradient,
                border: `2px solid ${goldenColor}`,
                boxShadow: `
                  0 8px 25px ${cardColors[activeTab].shadow},
                  0 0 20px rgba(212, 175, 55, 0.4),
                  inset 0 2px 4px rgba(255,255,255,0.3),
                  inset 0 -2px 4px rgba(0,0,0,0.3)
                `,
                animation: 'glowPulse 2s ease-in-out infinite, float3D 3s ease-in-out infinite',
                transform: 'perspective(500px) rotateX(5deg)',
                transformStyle: 'preserve-3d'
              }}
              aria-label="Back"
            >
              {/* Glossy overlay */}
              <span 
                className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                style={{
                  background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)'
                }}
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={goldenColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            {/* Pill Card Container - TOP MIDDLE - Between Back and Question Mark */}
            <div 
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full backdrop-blur-md bg-black/50 border border-white/30 flex-1"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)',
                transform: 'perspective(500px) rotateX(5deg)',
                transformStyle: 'preserve-3d',
                maxWidth: '37px'
              }}
            >
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-4 py-2.5 rounded-full font-bold text-sm transition-all duration-300"
                  style={{
                    background: activeTab === tab.id ? cardColors[tab.id].gradient : 'transparent',
                    color: activeTab === tab.id ? goldenColor : 'rgba(255,255,255,0.7)',
                    border: activeTab === tab.id ? `2px solid ${goldenColor}` : '2px solid transparent',
                    boxShadow: activeTab === tab.id 
                      ? `
                        0 15px 35px ${cardColors[tab.id].shadow},
                        0 0 25px rgba(212, 175, 55, 0.6),
                        inset 0 2px 4px rgba(255,255,255,0.3),
                        inset 0 -2px 4px rgba(0,0,0,0.3)
                      ` 
                      : 'none',
                    animation: activeTab === tab.id ? 'cardPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                    transform: activeTab === tab.id ? 'scale(1.1) rotateX(5deg)' : 'scale(1) rotateX(0deg)',
                    transformStyle: 'preserve-3d',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    textShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {activeTab === tab.id && (
                    <span 
                      className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                      style={{
                        background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)'
                      }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Question Mark - Glossy 3D Circle with simple ? sign */}
            <button
              className="relative w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all shrink-0"
              style={{
                background: cardColors[activeTab].gradient,
                border: `2px solid ${goldenColor}`,
                boxShadow: `
                  0 8px 25px ${cardColors[activeTab].shadow},
                  0 0 20px rgba(212, 175, 55, 0.4),
                  inset 0 2px 4px rgba(255,255,255,0.3),
                  inset 0 -2px 4px rgba(0,0,0,0.3)
                `,
                animation: 'glowPulse 2s ease-in-out infinite, float3D 3s ease-in-out infinite 0.5s',
                transform: 'perspective(500px) rotateX(5deg)',
                transformStyle: 'preserve-3d'
              }}
              aria-label="Info"
            >
              {/* Glossy overlay */}
              <span 
                className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                style={{
                  background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)'
                }}
              />
              <span 
                className="relative z-10 text-xl font-bold"
                style={{
                  color: goldenColor,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  lineHeight: '1',
                  fontSize: '24px'
                }}
              >
                ?
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
        }
