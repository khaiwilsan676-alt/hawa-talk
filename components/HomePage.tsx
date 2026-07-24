'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { db } from "../src/lib/firebase"
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore"

import MessagePage from './MessagePage'
import MePage from './MePage'
import RoomPage from './RoomPage'

interface HomePageProps {
  onLogout?: () => void;
}

interface UserCard {
  id: string
  name: string
  country: string
  image: string
}

interface KeptRoomData {
  name: string
  image: string
  accountId: string
}

interface GlobalRoom {
  id: string
  name: string
  country: string
  image: string
  accountId: string
  createdAt: number
}

const BANNERS = [
  {
    image: '/1784458869444~2.jpg'
  },
  {
    image: '/1784458869444~2.jpg'
  }
]

type Tab = 'mine' | 'popular'
type MineTab = 'following' | 'recent'
type Page = 'home' | 'message' | 'me' | 'room'

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

export default function HomePage({ onLogout }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('popular')
  const [activeMineTab, setActiveMineTab] = useState<MineTab>('following')
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [mounted, setMounted] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserCard | null>(null)

  // Room state and user profile info
  const [isRoomCreated, setIsRoomCreated] = useState(false)
  const [myRoom, setMyRoom] = useState<UserCard | null>(null)
  const [userName, setUserName] = useState('Guest')
  const [userPhoto, setUserPhoto] = useState('')
  const [userUID, setUserUID] = useState('')
  
  // Global rooms state - stores all rooms from Firestore
  const [globalRooms, setGlobalRooms] = useState<GlobalRoom[]>([])
  
  // Kept room state
  const [keptRoom, setKeptRoom] = useState<KeptRoomData | null>(null)
  const [enteredFromKept, setEnteredFromKept] = useState(false)

  // Drag state for kept room circle
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [showDeleteZone, setShowDeleteZone] = useState(false)
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const circleStartPos = useRef({ x: 16, y: window.innerHeight * 0.4 })
  const deleteZoneRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)

  const bannerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(id)
  }, [])

  // Firebase Realtime Listener for globalRooms collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "globalRooms"), (snapshot) => {
      const rooms = snapshot.docs.map((d) => ({
        ...(d.data() as GlobalRoom)
      }));
      setGlobalRooms(rooms);
    });

    return () => unsub();
  }, []);

  // Calculate initial position
  useEffect(() => {
    circleStartPos.current = { 
      x: window.innerWidth - 16 - 48,
      y: window.innerHeight * 0.6
    }
    setDragPosition(circleStartPos.current)
  }, [])

  // Check if dragged circle is over delete zone
  const checkOverlap = useCallback((circleX: number, circleY: number) => {
    if (!deleteZoneRef.current) return false
    
    const deleteRect = deleteZoneRef.current.getBoundingClientRect()
    const circleSize = 48
    
    const circleCenter = {
      x: circleX + circleSize / 2,
      y: circleY + circleSize / 2
    }
    
    const deleteCenter = {
      x: deleteRect.left + deleteRect.width / 2,
      y: deleteRect.top + deleteRect.height / 2
    }
    
    const distance = Math.sqrt(
      Math.pow(circleCenter.x - deleteCenter.x, 2) + 
      Math.pow(circleCenter.y - deleteCenter.y, 2)
    )
    
    return distance < 60
  }, [])

  // Load profile, room state, and kept room from localStorage
  useEffect(() => {
    const loadProfile = () => {
      const name = localStorage.getItem('userName') || 'JIYA'
      const photo = localStorage.getItem('userPhoto') || '/1784466691241~2.jpg'
      const uid = localStorage.getItem('userUID') || '742918'
      setUserName(name)
      setUserPhoto(photo)
      setUserUID(uid)
      
      const roomCreated = localStorage.getItem('isRoomCreated')
      const roomData = localStorage.getItem('myRoom')
      
      if (roomCreated === 'true' && roomData) {
        setIsRoomCreated(true)
        try {
          setMyRoom(JSON.parse(roomData))
        } catch (e) {
          setIsRoomCreated(false)
          setMyRoom(null)
        }
      } else {
        setIsRoomCreated(false)
        setMyRoom(null)
      }
      
      const keptRoomData = localStorage.getItem('keptRoom')
      if (keptRoomData) {
        try {
          setKeptRoom(JSON.parse(keptRoomData))
        } catch (e) {
          setKeptRoom(null)
        }
      }
    }
    
    loadProfile()
    window.addEventListener('storage', loadProfile)
    return () => window.removeEventListener('storage', loadProfile)
  }, [])

  // Listen for storage changes (cross-tab communication fallback for keptRoom)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'keptRoom') {
        if (!e.newValue) {
          setKeptRoom(null)
          setEnteredFromKept(false)
        } else {
          try {
            setKeptRoom(JSON.parse(e.newValue))
          } catch {
            setKeptRoom(null)
          }
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Mouse drag handlers for kept room circle
  const handleCircleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setShowDeleteZone(true)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    circleStartPos.current = { x: dragPosition.x, y: dragPosition.y }
  }

  const handleCircleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    const touch = e.touches[0]
    setIsDragging(true)
    setShowDeleteZone(true)
    dragStartPos.current = { x: touch.clientX, y: touch.clientY }
    circleStartPos.current = { x: dragPosition.x, y: dragPosition.y }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const deltaX = e.clientX - dragStartPos.current.x
      const deltaY = e.clientY - dragStartPos.current.y
      
      const newX = circleStartPos.current.x + deltaX
      const newY = circleStartPos.current.y + deltaY
      
      setDragPosition({ x: newX, y: newY })
      
      const isOverlap = checkOverlap(newX, newY)
      setIsOverDeleteZone(isOverlap)
    }

    const handleMouseUp = () => {
      if (!isDragging) return
      
      const isOverlap = checkOverlap(dragPosition.x, dragPosition.y)
      
      if (isOverlap) {
        localStorage.removeItem('keptRoom')
        setKeptRoom(null)
        setEnteredFromKept(false)
      } else {
        setDragPosition(circleStartPos.current)
      }
      
      setIsDragging(false)
      setShowDeleteZone(false)
      setIsOverDeleteZone(false)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      
      const touch = e.touches[0]
      const deltaX = touch.clientX - dragStartPos.current.x
      const deltaY = touch.clientY - dragStartPos.current.y
      
      const newX = circleStartPos.current.x + deltaX
      const newY = circleStartPos.current.y + deltaY
      
      setDragPosition({ x: newX, y: newY })
      
      const isOverlap = checkOverlap(newX, newY)
      setIsOverDeleteZone(isOverlap)
    }

    const handleTouchEnd = () => {
      if (!isDragging) return
      
      const isOverlap = checkOverlap(dragPosition.x, dragPosition.y)
      
      if (isOverlap) {
        localStorage.removeItem('keptRoom')
        setKeptRoom(null)
        setEnteredFromKept(false)
      } else {
        setDragPosition(circleStartPos.current)
      }
      
      setIsDragging(false)
      setShowDeleteZone(false)
      setIsOverDeleteZone(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: true })
      window.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, dragPosition, checkOverlap])

  // Touch swipe handlers for banner
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
      if (e.cancelable) e.preventDefault()
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

  const handleKeepRoom = (roomData: KeptRoomData) => {
    setKeptRoom(roomData)
    setEnteredFromKept(false)
    localStorage.setItem('keptRoom', JSON.stringify(roomData))
    circleStartPos.current = { 
      x: window.innerWidth - 16 - 48, 
      y: window.innerHeight * 0.6 
    }
    setDragPosition(circleStartPos.current)
  }

  const handleKeptRoomClick = () => {
    if (isDragging) return
    if (keptRoom) {
      setEnteredFromKept(true)
      const roomUser: UserCard = {
        id: keptRoom.accountId,
        name: keptRoom.name,
        country: '🇮🇳',
        image: keptRoom.image
      }
      setSelectedUser(roomUser)
      setCurrentPage('room')
    }
  }

  const handleCardClick = async () => {
    setEnteredFromKept(false)
    if (!isRoomCreated) {
      const createdRoomCard: UserCard = {
        id: userUID,
        name: userName,
        country: '🇮🇳',
        image: userPhoto
      }
      localStorage.setItem('isRoomCreated', 'true')
      localStorage.setItem('myRoom', JSON.stringify(createdRoomCard))
      setIsRoomCreated(true)
      setMyRoom(createdRoomCard)
      
      // Save room to Firestore (globalRooms collection)
      await setDoc(doc(db, "globalRooms", userUID), {
        id: userUID,
        name: userName,
        country: "🇮🇳",
        image: userPhoto,
        accountId: userUID,
        createdAt: Date.now()
      });
      
      setSelectedUser(createdRoomCard)
      setCurrentPage('room')
    } else if (myRoom) {
      setSelectedUser(myRoom)
      setCurrentPage('room')
    }
  }

  const handleHouseClick = () => {
    setEnteredFromKept(false)
    if (isRoomCreated && myRoom) {
      setSelectedUser(myRoom)
      setCurrentPage('room')
    }
  }

  const handleUserCardClick = (user: UserCard) => {
    setEnteredFromKept(false)
    setSelectedUser(user)
    setCurrentPage('room')
  }

  const handleBackFromRoom = async () => {
    if (enteredFromKept) {
      localStorage.removeItem('keptRoom')
      setKeptRoom(null)
      setEnteredFromKept(false)
    }
    setCurrentPage('home')
    setSelectedUser(null)
  }

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

  useEffect(() => {
    if (currentPage !== 'message') {
      setIsChatOpen(false)
    }
  }, [currentPage])

  // All rooms including own room from Firestore
  const allRooms = globalRooms

  const renderMineTab = () => (
    <div className="px-4 mt-6">
      {/* Create/Your Room Card - Simple purple gradient, no "My Room" text */}
      <div
        onClick={handleCardClick}
        className="rounded-2xl p-6 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all mb-6"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.6)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
        }}
      >
        {!isRoomCreated ? (
          <>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 8V24M8 16H24"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-bold text-xl leading-tight">
                Create your Room
              </h3>
              <p className="text-white/80 text-sm mt-1 font-medium">
                Embark Your Hawa journey!
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-bold text-xl">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-bold text-xl leading-tight">
                {userName}
              </h3>
              <p className="text-white/80 text-sm mt-1 font-medium">
                Tap to enter your room
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setActiveMineTab('following')}
          className={`relative pb-1.5 text-xs font-medium transition-colors ${
            activeMineTab === 'following'
              ? 'text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Following
          {activeMineTab === 'following' && (
            <span className="absolute left-0 right-0 -bottom-0 h-0.5 bg-gray-900 rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveMineTab('recent')}
          className={`relative pb-1.5 text-sm font-medium transition-colors ${
            activeMineTab === 'recent'
              ? 'text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Recent
          {activeMineTab === 'recent' && (
            <span className="absolute left-0 right-0 -bottom-0 h-0.5 bg-gray-900 rounded-full" />
          )}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        {activeMineTab === 'following' ? (
          <div className="text-center">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4 opacity-30">
              <path
                d="M32 8C45.2 8 56 18.8 56 32C56 45.2 45.2 56 32 56C18.8 56 8 45.2 8 32C8 18.8 18.8 8 32 8Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M24 32H40M32 24V40"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm">No following yet</p>
          </div>
        ) : (
          <div className="text-center">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4 opacity-30">
              <path
                d="M16 20H48M16 32H48M16 44H32"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPopularTab = () => (
    <>
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

      {/* All Rooms Grid - Simple, no borders, no "You" tag, no green dot */}
      {allRooms.length > 0 && (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-2.5">
            {allRooms.map((room) => (
              <div
                key={room.accountId}
                onClick={() => handleUserCardClick({
                  id: room.accountId,
                  name: room.name,
                  country: room.country,
                  image: room.image
                })}
                className="relative bg-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                style={{ height: '180px' }}
              >
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{room.country}</span>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-xs">{room.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

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
        @keyframes pulseGlow {  
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }  
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }  
        }
        @keyframes deletePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Delete Zone - Shows at bottom right when dragging */}
      {showDeleteZone && keptRoom && (
        <div 
          ref={deleteZoneRef}
          className="fixed bottom-4 right-4 z-[60] transition-all duration-300"
          style={{
            animation: isOverDeleteZone ? 'deletePulse 0.5s ease-in-out infinite' : 'none'
          }}
        >
          <div 
            className={`flex items-center justify-center rounded-full transition-all duration-300 ${
              isOverDeleteZone 
                ? 'w-16 h-16 bg-red-600 shadow-lg shadow-red-500/50 scale-110' 
                : 'w-14 h-14 bg-red-500/60'
            }`}
          >
            <svg 
              viewBox="0 0 24 24" 
              className={`transition-all duration-300 ${isOverDeleteZone ? 'w-8 h-8' : 'w-6 h-6'}`}
              fill="none" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
        </div>
      )}

      {/* Kept Room Floating DP Circle - Draggable */}
      {keptRoom && currentPage === 'home' && (
        <div 
          ref={circleRef}
          className={`fixed z-50 cursor-grab active:cursor-grabbing group ${
            isDragging ? 'transition-none' : 'transition-all duration-300'
          } ${isOverDeleteZone ? 'opacity-50 scale-75' : 'opacity-100'}`}
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
            touchAction: 'none'
          }}
          onClick={handleKeptRoomClick}
          onMouseDown={handleCircleMouseDown}
          onTouchStart={handleCircleTouchStart}
        >
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg bg-white"
              style={{ animation: isDragging ? 'none' : 'pulseGlow 2s infinite' }}
            >
              <img 
                src={keptRoom.image} 
                alt={keptRoom.name}
                className="w-full h-full object-cover pointer-events-none"
                draggable="false"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white pointer-events-none"></div>
          </div>
          {!isDragging && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {keptRoom.name}
            </div>
          )}
        </div>
      )}

      {!isChatOpen && currentPage !== 'room' && (
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
          <div className="w-full bg-white min-h-screen">
            <div
              className="w-full pt-3 px-4"
              style={{
                height: activeTab === 'mine' ? 'auto' : '34vh',
                minHeight: activeTab === 'mine' ? 'auto' : '34vh',
                background: activeTab === 'mine'
                  ? 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 100%)'
                  : 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)',
                paddingBottom: activeTab === 'mine' ? '12px' : '0px'
              }}
            >
              <div className="w-full flex justify-between items-center py-1 box-border mb-4">
                <button
                  type="button"
                  onClick={handleHouseClick}
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

              {activeTab === 'popular' && (
                <>
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
                </>
              )}
            </div>

            {activeTab === 'mine' ? renderMineTab() : renderPopularTab()}
          </div>
        )}

        {currentPage === 'message' && (
          <MessagePage onChatOpen={setIsChatOpen} />
        )}
        
        {currentPage === 'me' && <MePage onLogout={onLogout} />}

        {currentPage === 'room' && selectedUser && (
          <RoomPage
            user={selectedUser}
            onBack={handleBackFromRoom}
            onKeepRoom={handleKeepRoom}
          />
        )}
      </div>

      {!isChatOpen && currentPage !== 'room' && (
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

