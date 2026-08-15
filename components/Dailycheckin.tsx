'use client'

import React, { useState, useEffect } from 'react'

const SIGN_IN_REWARDS = [
  { day: 1, reward: '50 💎', icon: '💎', color: '#FF6B6B' },
  { day: 2, reward: '100 🪙', icon: '🪙', color: '#FFA726' },
  { day: 3, reward: '150 💎', icon: '💎', color: '#66BB6A' },
  { day: 4, reward: '200 🪙', icon: '🪙', color: '#42A5F5' },
  { day: 5, reward: 'Frame', icon: '🖼️', color: '#AB47BC' },
  { day: 6, reward: '300 💎', icon: '💎', color: '#EF5350' },
  { day: 7, reward: '500 🪙', icon: '🪙', color: '#FFD700' },
];

export default function Dailycheckin() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [currentSignInDay, setCurrentSignInDay] = useState(1)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Load sign-in day from localStorage
  useEffect(() => {
    const savedDay = localStorage.getItem('signInDay')
    if (savedDay) {
      setCurrentSignInDay(parseInt(savedDay))
    }
  }, [])

  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      setViewportHeight(window.innerHeight)
    }

    setHeight()
    window.addEventListener('resize', setHeight)
    window.addEventListener('orientationchange', setHeight)

    return () => {
      window.removeEventListener('resize', setHeight)
      window.removeEventListener('orientationchange', setHeight)
    }
  }, [])

  const handleImageClick = () => {
    setIsSignInModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsSignInModalOpen(false)
  }

  const handleSignIn = () => {
    const nextDay = currentSignInDay < 7 ? currentSignInDay + 1 : 1
    setCurrentSignInDay(nextDay)
    localStorage.setItem('signInDay', nextDay.toString())
    setIsSignInModalOpen(false)
    alert(`Day ${currentSignInDay} reward claimed! 🎉`)
  }

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes modalOverlayIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <div className="fixed bottom-24 right-4 z-40">
        <img
          src="/IMG_20260719_203213.png"
          alt="Corner decoration"
          className="rounded-2xl object-cover cursor-pointer hover:scale-105 transition-transform active:scale-95"
          style={{
            width: '70px',
            height: '70px',
          }}
          onClick={handleImageClick}
        />
      </div>

      {isSignInModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            animation: 'modalOverlayIn 0.3s ease-out',
            height: viewportHeight ? 'calc(var(--vh, 1vh) * 100)' : '100vh'
          }}
          onClick={handleCloseModal}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden"
            style={{
              animation: 'modalFadeIn 0.3s ease-out',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div
              className="relative px-6 pt-8 pb-6 text-center"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full" />
              </div>
              <h2 className="text-2xl font-bold text-white relative z-10">
                Daily Sign-in
              </h2>
              <p className="text-blue-100 text-sm mt-1 relative z-10">
                Day {currentSignInDay} of 7
              </p>
            </div>

            <div className="px-6 pt-6 pb-4">
              <div className="grid grid-cols-4 gap-2 mb-2">
                {SIGN_IN_REWARDS.slice(0, 4).map((item, index) => (
                  <div
                    key={item.day}
                    className={`relative rounded-xl p-2 text-center transition-all ${
                      index + 1 < currentSignInDay
                        ? 'bg-green-50 border-2 border-green-400'
                        : index + 1 === currentSignInDay
                        ? 'bg-blue-50 border-2 border-blue-500 animate-pulse'
                        : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                    }`}
                    style={{ minHeight: '80px' }}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-semibold text-gray-700">
                      Day {item.day}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {item.reward}
                    </div>
                    {index + 1 < currentSignInDay && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                {SIGN_IN_REWARDS.slice(4, 6).map((item, index) => (
                  <div
                    key={item.day}
                    className={`relative rounded-xl p-3 text-center transition-all ${
                      index + 5 < currentSignInDay
                        ? 'bg-green-50 border-2 border-green-400'
                        : index + 5 === currentSignInDay
                        ? 'bg-blue-50 border-2 border-blue-500 animate-pulse'
                        : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                    }`}
                    style={{ minHeight: '70px' }}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-semibold text-gray-700">
                      Day {item.day}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {item.reward}
                    </div>
                    {index + 5 < currentSignInDay && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div
                  className={`relative rounded-xl p-4 text-center transition-all ${
                    7 < currentSignInDay
                      ? 'bg-green-50 border-2 border-green-400'
                      : 7 === currentSignInDay
                      ? 'bg-blue-50 border-2 border-blue-500 animate-pulse'
                      : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                  }`}
                  style={{ minHeight: '100px' }}
                >
                  <div className="text-4xl mb-2">🎁</div>
                  <div className="text-sm font-bold text-gray-800">
                    Day 7 - Big Reward!
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    500 🪙 + Special Frame
                  </div>
                  {7 < currentSignInDay && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSignIn}
                disabled={currentSignInDay > 7}
                className={`w-full py-3.5 rounded-xl font-bold text-white text-base transition-all transform active:scale-95 ${
                  currentSignInDay > 7
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
                }`}
              >
                {currentSignInDay > 7 ? 'All Rewards Claimed! 🎉' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
