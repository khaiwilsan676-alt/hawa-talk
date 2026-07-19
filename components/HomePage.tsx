'use client' 

import { useState, useEffect, useRef } from 'react'

import MessagePage from './MessagePage'
import MePage from './MePage'

interface UserCard {
  id: string  
  name: string
  country: string
  score: number
  image: string
}

const userCards: UserCard[] = [
  {
    id: '1',
    name: 'JIYA',
    country: '🇮🇳',
    score: 5,
    image: '/1784466691241~2.jpg'
  },
  {
    id: '2',
    name: 'Ginni',
    country: '🇮🇳',
    score: 4,
    image: '/1784466691241~2.jpg'
  },
  {
    id: '3',
    name: 'new_user',
    country: '🇮🇳',
    score: 7,
    image: '/1784466691241~2.jpg'
  },
  {
    id: '4',
    name: 'User123',
    country: '🇮🇳',
    score: 3,
    image: '/1784466691241~2.jpg'
  }
]

// Banners with just images, no text
const BANNERS = [
  {
    image: '/1784458869444~2.jpg'
  },
  {
    image: '/1784458869444~2.jpg'
  }
]

type Tab = 'mine' | 'popular'
type Page = 'home' | 'message' | 'me'

const CATEGORY_CARDS = [
  {
    label: 'Honour',
    icon: '',
    outerFrom: '#FFED99',
    outerTo: '#FFE27A',
    textColor: '#7A4E1B',
    innerBg: '#FFF6CC',
    innerBorder: 'rgba(122,78,27,0.08)',
  },
  {
    label: 'Charm',
    icon: '',
    outerFrom: '#A2D8FF',
    outerTo: '#8ECBFF',
    textColor: '#184E6E',
    innerBg: '#C8E8FF',
    innerBorder: 'rgba(24,78,110,0.08)',
  },
  {
    label: 'Room',
    icon: '',
    outerFrom: '#D1B1FF',
    outerTo: '#C39BFF',
    textColor: '#4E2A7A',
    innerBg: '#DFC8FF',
    innerBorder: 'rgba(78,42,122,0.08)',
  },
];

// Mine tab ke liye room cards data
const MINE_ROOMS = [
  {
    id: '1',
    roomName: 'Royal Lounge',
    members: 12,
    isLive: true,
    image: '/1784466691241~2.jpg'
  },
  {
    id: '2',
    roomName: 'Fun Zone',
    members: 8,
    isLive: false,
    image: '/1784466691241~2.jpg'
  }
]

export default function HomePage({ onLogout }) {
  const [activeTab, setActiveTab] = useState<Tab>('popular')
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [mounted, setMounted] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(false) // Track if a chat is open
  
  // Touch swipe ke liye refs
  const bannerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    
    touchEndX.current = e.touches[0].clientX
    const diff = touchEndX.current - touchStartX.current
    setSwipeOffset(diff)
    
    if (Math.abs(diff) > 10) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (!isSwiping) return
    
    const diff = touchEndX.current - touchStartX.current
    const threshold = 50
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)
      } else {
        setCurrentBanner((prev) => (prev + 1) % BANNERS.length)
      }
    }
    
    setIsSwiping(false)
    setSwipeOffset(0)
    touchStartX.current = 0
    touchEndX.current = 0
  }

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX
    touchEndX.current = e.clientX
    setIsSwiping(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return
    touchEndX.current = e.clientX
    const diff = touchEndX.current - touchStartX.current
    setSwipeOffset(diff)
  }

  const handleMouseUp = () => {
    if (!isSwiping) return
    
    const diff = touchEndX.current - touchStartX.current
    const threshold = 50
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)
      } else {
        setCurrentBanner((prev) => (prev + 1) % BANNERS.length)
      }
    }
    
    setIsSwiping(false)
    setSwipeOffset(0)
    touchStartX.current = 0
    touchEndX.current = 0
  }

  const handleMouseLeave = () => {
    if (isSwiping) {
      handleMouseUp()
    }
  }

  // Zoom prevent karne ka meta tag dynamically add karo
  useEffect(() => {
    const existingMeta = document.querySelector('meta[name="viewport"]')
    if (existingMeta) {
      existingMeta.remove()
    }
    
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    document.head.appendChild(meta)

    return () => {
      const metaTag = document.querySelector('meta[name="viewport"]')
      if (metaTag && metaTag.getAttribute('content') === 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no') {
        metaTag.remove()
      }
    }
  }, [])

  // Reset chat state when navigating away from message page
  useEffect(() => {
    if (currentPage !== 'message') {
      setIsChatOpen(false)
    }
  }, [currentPage])

  // AI tag hatane ka function
  useEffect(() => {
    const removeAITags = () => {
      const aiElements = document.querySelectorAll('[class*="ai"], [class*="AI"], [id*="ai"], [id*="AI"]')
      aiElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none'
          el.style.visibility = 'hidden'
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
        }
      })

      const allElements = document.querySelectorAll('*')
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          const text = el.textContent?.toLowerCase() || ''
          const className = el.className?.toLowerCase() || ''
          const id = el.id?.toLowerCase() || ''
          
          if (
            (text.includes('ai') && el.children.length === 0 && el.textContent?.trim().length <= 5) ||
            className.includes('ai-') ||
            id.includes('ai-') ||
            className.includes('_ai') ||
            id.includes('_ai')
          ) {
            el.style.display = 'none'
            el.style.visibility = 'hidden'
            el.style.opacity = '0'
          }
        }
      })
    }

    removeAITags()

    const observer = new MutationObserver(() => {
      removeAITags()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-100 to-white"
      style={{ 
        paddingBottom: isChatOpen ? '0px' : '96px',
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700&display=swap');
        
        * {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          touch-action: manipulation;
        }
        
        button, a, div, span {
          touch-action: manipulation;
        }
        
        @keyframes cardIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInBanner {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        @keyframes slideDown {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Bottom Right Corner Image - Hide when chat is open */}
      {!isChatOpen && (
        <div className="fixed bottom-24 right-4 z-40">
          <img 
            src="/IMG_20260719_203213.png" 
            alt="Corner decoration"
            className="rounded-2xl object-cover"
            style={{ 
              width: '70px', 
              height: '70px',
            }}
          />
        </div>
      )}

      <div className="w-full">
        {currentPage === 'home' && (
          <div className="w-full bg-white">
            {/* Top Section */}
            <div 
              className="w-full pt-3 px-4" 
              style={{ 
                height: '34vh', 
                background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)' 
              }}
            >
              {/* Top Navigation */}
              <div className="w-full flex justify-between items-center py-1 box-border mb-4">
                <button
                  type="button"
                  onClick={() => console.log('Home clicked')}
                  className="flex items-center justify-center cursor-pointer"
                  aria-label="Home"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M16 3.5 C 14.5 3.5, 3 8, 3 13.5 L 3 21.5 C 3 25.5, 6 28.5, 10.5 28.5 H 21.5 C 26 28.5, 29 25.5, 29 21.5 L 29 13.5 C 29 8, 17.5 3.5, 16 3.5 Z"
                      stroke="#2D2D2D"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect x="9" y="14.5" width="3.5" height="6" rx="1.5" fill="#2D2D2D" />
                    <rect x="14.2" y="11.5" width="3.5" height="9" rx="1.5" fill="#2D2D2D" />
                    <rect x="19.5" y="14" width="3.5" height="6.5" rx="1.5" fill="#2D2D2D" />
                  </svg>
                </button>

                <div className="flex items-center gap-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('mine')}
                    className={`font-['Inter'] tracking-[0.2px] transition-colors relative pb-1 ${
                      activeTab === 'mine'
                        ? 'font-bold text-[#1E1E1E]'
                        : 'font-medium text-[#6E6E6E]'
                    }`}
                  >
                    Mine
                    {activeTab === 'mine' && (
                      <span className="absolute left-0 right-0 -bottom-0 h-0.5 bg-[#1E1E1E] rounded-full block" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('popular')}
                    className={`font-['Inter'] tracking-[0.2px] transition-colors relative pb-1 ${
                      activeTab === 'popular'
                        ? 'font-bold text-[#1E1E1E]'
                        : 'font-medium text-[#6E6E6E]'
                    }`}
                  >
                    Popular
                    {activeTab === 'popular' && (
                      <span className="absolute left-0 right-0 -bottom-0 h-0.5 bg-[#1E1E1E] rounded-full block" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => console.log('Search clicked')}
                  className="flex items-center justify-center cursor-pointer"
                  aria-label="Search"
                >
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                    <circle cx="12.5" cy="12.5" r="7" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.2 18.2 L24 24" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Banner Carousel - Only Images, No Text */}
              <div 
                ref={bannerRef}
                className="rounded-2xl relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
                style={{ 
                  height: '90px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: isSwiping ? `translateX(${swipeOffset}px)` : 'translateX(0)',
                  transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                <div 
                  key={currentBanner}
                  className="w-full h-full"
                  style={{
                    animation: isSwiping ? 'none' : 'fadeInBanner 400ms ease-out',
                  }}
                >
                  <img 
                    src={BANNERS[currentBanner].image} 
                    alt="Banner"
                    className="w-full h-full object-cover rounded-2xl"
                    draggable="false"
                  />
                </div>
              </div>
              
              {/* Dots - Active dot black */}
              <div className="flex justify-center gap-1.5" style={{ marginTop: '8px', marginBottom: '0px' }}>
                {BANNERS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentBanner ? 'bg-black w-3' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Category Cards */}
            <div className="px-4" style={{ marginTop: '-85px', position: 'relative', zIndex: 10 }}>
              <div className="flex flex-row justify-between items-center gap-1.5 select-none" style={{ fontFamily: 'Nunito, Inter, sans-serif', marginBottom: '6px' }}>
                {CATEGORY_CARDS.map((card, i) => (
                  <div
                    key={card.label}
                    className="group flex-1"
                    style={{
                      height: '90px',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '8px 6px 6px 6px',
                      border: '1.5px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      background: `radial-gradient(120% 90% at 18% 8%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.38) 18%, rgba(255,255,255,0) 52%), linear-gradient(135deg, ${card.outerFrom} 0%, ${card.outerTo} 100%)`,
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.96)',
                      transition: 'transform 420ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 280ms ease, opacity 420ms ease',
                      animation: mounted ? 'cardIn 560ms cubic-bezier(0.22,1,0.36,1) both' : 'none',
                      animationDelay: `${i * 100}ms`,
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = 'translateY(-3px) scale(1.02)';
                      el.style.boxShadow = '0 10px 20px rgba(0,0,0,0.14), 0 3px 8px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = 'translateY(0) scale(1)';
                      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: card.textColor,
                        marginBottom: '4px',
                        textShadow: '0 1px 0 rgba(255,255,255,0.7)',
                      }}
                    >
                      {card.label}
                    </div>
                    
                    <div
                      style={{
                        flex: 1,
                        borderRadius: '10px',
                        backgroundColor: card.innerBg,
                        border: `1.5px solid ${card.innerBorder}`,
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 58%)',
                        }}
                      />
                      <span className="text-xl relative z-10">{card.icon}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mine Tab Content - Shown when activeTab is 'mine' */}
            {activeTab === 'mine' && (
              <div className="px-4" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {/* Create Room Card */}
                <div 
                  className="rounded-2xl p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">Create your Room</div>
                      <div className="text-white/80 text-sm">Embark Your Hawa journey!</div>
                    </div>
                  </div>
                </div>

                {/* Your Rooms Section */}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-800 text-lg mb-3">Your Rooms</h3>
                  
                  {MINE_ROOMS.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {MINE_ROOMS.map((room) => (
                        <div
                          key={room.id}
                          className="relative bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
                          style={{ height: '200px' }}
                        >
                          <img
                            src={room.image}
                            alt={room.roomName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-semibold text-sm">{room.roomName}</span>
                              {room.isLive && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                  LIVE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5"/>
                                <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="white" strokeWidth="1.5"/>
                              </svg>
                              <span className="text-white/90 text-xs">{room.members} members</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">🎉</div>
                      <p className="text-gray-500 font-medium">No rooms yet!</p>
                      <p className="text-gray-400 text-sm mt-1">Create your first room to get started</p>
                    </div>
                  )}
                </div>

                {/* Recent Activity Section */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 text-lg mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div 
                        key={item}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {String.fromCharCode(64 + item)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">Joined a new room</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18l6-6-6-6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Popular Tab Content - Shown when activeTab is 'popular' */}
            {activeTab === 'popular' && (
              <>
                {/* User Cards Grid */}
                <div className="px-4 grid grid-cols-2 gap-2.5" style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                  {userCards.map((user) => (
                    <div
                      key={user.id}
                      className="relative bg-gray-300 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      style={{ height: '180px' }}
                    >
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{user.country}</span>
                          <div className="flex-1">
                            <div className="text-white font-semibold text-xs">{user.name}</div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-blue-400 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                          {user.score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recharge Event */}
                <div className="px-4 pb-24 pt-3 flex justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-1"></div>
                    <div className="font-bold text-blue-800 text-sm"></div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {currentPage === 'message' && (
          <MessagePage onChatOpen={setIsChatOpen} />
        )}
        {currentPage === 'me' && <MePage />}
      </div>

      {/* Bottom Navigation Bar - Only show when chat is NOT open */}
      {!isChatOpen && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-30">
          <div className="flex justify-around items-center bg-white border-t border-zinc-100 shadow-lg px-3 py-3 w-full">
            
            <button 
              onClick={() => setCurrentPage('home')}
              className="flex flex-col items-center gap-1 transition-all active:scale-95"
            >
              <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
                <path
                  d="M18 2.8C20.2 2.8 30.2 8.2 30.2 12.6V23.2C30.2 27.8 28 31 18 31C8 31 5.8 27.8 5.8 23.2V12.6C5.8 8.2 15.8 2.8 18 2.8Z"
                  fill={currentPage === 'home' ? '#3b82f6' : 'white'}
                  stroke="#1D1D1F"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.2 14.2C13.3 12.6 14.9 12.1 16.8 13.4"
                  stroke="#1D1D1F"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M11.2 20.8C12.5 24.2 21 25.6 24.3 20.2"
                  stroke="#1D1D1F"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span className={`text-[12px] ${currentPage === 'home' ? 'font-semibold text-black' : 'text-gray-500'}`}>
                Home
              </span>
            </button>

            <button 
              onClick={() => setCurrentPage('message')}
              className="flex flex-col items-center gap-1 transition-all active:scale-95"
            >
              <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
                <path
                  d="M6 10.5C6 7 8.3 5 12.2 5H23.8C27.7 5 30 7 30 10.5V16.5C30 20 27.7 22 23.8 22H21 L17.5 27.2C17 28 15.8 28 15.2 27.2L12.2 22C8.3 22 6 20 6 16.5V10.5Z"
                  fill={currentPage === 'message' ? '#3b82f6' : 'white'}
                  stroke="#1D1D1F"
                  strokeWidth="2.4"
                />
                <path
                  d="M12 14.5C13.5 12.5 15.5 14.5 19.5 12.5C21.5 14.5 24 14.5 24 14.5"
                  stroke="#1D1D1F"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span className={`text-[12px] ${currentPage === 'message' ? 'font-semibold text-black' : 'text-gray-500'}`}>
                Message
              </span>
            </button>

            <button 
              onClick={() => setCurrentPage('me')}
              className="flex flex-col items-center gap-1 transition-all active:scale-95"
            >
              <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
                <path
                  d="M18 4.5C23.5 4.5 28 8.5 27.2 13.8L26.2 19.8C26 21.2 27.2 22.5 28.6 23.1C30.6 24 31 26.2 29 27.5C27.5 28.5 25 28.8 22 28.8H14C11 28.8 8.5 28.5 7 27.5C5 26.2 5.4 24 7.4 23.1C8.8 22.5 10 21.2 9.8 19.8L8.8 13.8C8 8.5 12.5 4.5 18 4.5Z"
                  fill={currentPage === 'me' ? '#3b82f6' : 'white'}
                  stroke="#1D1D1F"
                  strokeWidth="2.4"
                />
                <circle cx="14" cy="15" r="1.6" fill="#1D1D1F" />
                <circle cx="22" cy="15" r="1.6" fill="#1D1D1F" />
              </svg>
              <span className={`text-[12px] ${currentPage === 'me' ? 'font-semibold text-black' : 'text-gray-500'}`}>
                Me
              </span>
            </button>

          </div>
        </div>
      )}
    </div>
  )
}
