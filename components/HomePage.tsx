'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { db } from "../src/lib/firebase"
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  getDoc
} from "firebase/firestore"

import MessagePage from './MessagePage'
import MePage from './MePage';
import { getOrCreateAccountNumber } from './MePage'
import RoomPage from './RoomPage'
import PublicProfile from './PublicProfile'
import { generateStableId } from '../lib/hash'
import { translations, getTranslation, LanguageCode } from '../lib/translations'

interface HomePageProps {
  onLogout?: () => void;
}

interface UserCard {
  id: string
  accountId?: string
  name: string
  country: string
  image: string
}

interface KeptRoomData {
  name: string
  country?: string
  image: string
  accountId: string
}

interface RecentRoom extends KeptRoomData {
  timestamp: number
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
type Page = 'home' | 'message' | 'me' | 'room' | 'public_profile'
type SearchTab = 'user' | 'room'

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

// Sign-in rewards data
const SIGN_IN_REWARDS = [
  { day: 1, reward: '50 💎', icon: '💎', color: '#FF6B6B' },
  { day: 2, reward: '100 🪙', icon: '🪙', color: '#FFA726' },
  { day: 3, reward: '150 💎', icon: '💎', color: '#66BB6A' },
  { day: 4, reward: '200 🪙', icon: '🪙', color: '#42A5F5' },
  { day: 5, reward: 'Frame', icon: '🖼️', color: '#AB47BC' },
  { day: 6, reward: '300 💎', icon: '💎', color: '#EF5350' },
  { day: 7, reward: '500 🪙', icon: '🪙', color: '#FFD700' },
];

export default function HomePage({ onLogout }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('popular')
  const [appLang, setAppLang] = useState<LanguageCode>('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage') as LanguageCode
    if (savedLang) {
      setAppLang(savedLang)
    }

    const handleLangChange = (e: CustomEvent) => {
      if (e.detail && e.detail.lang) {
        setAppLang(e.detail.lang)
      }
    }

    window.addEventListener('languageChange', handleLangChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLangChange as EventListener)
  }, [])

  const t = getTranslation(appLang)
  const [activeMineTab, setActiveMineTab] = useState<MineTab>('following')
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [mounted, setMounted] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserCard | null>(null)

  // Search Sheet State & Results
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTab>('user')
  const [searchResults, setSearchResults] = useState<GlobalRoom[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const [isPublicProfileActive, setIsPublicProfileActive] = useState(false)

  const [isRoomCreated, setIsRoomCreated] = useState(false)
  const [myRoom, setMyRoom] = useState<UserCard | null>(null)
  const [userName, setUserName] = useState('Guest')
  const [userPhoto, setUserPhoto] = useState('')
  const [userUID, setUserUID] = useState('')
  const [totalUnreadCount, setTotalUnreadCount] = useState(0)

  const [globalRooms, setGlobalRooms] = useState<GlobalRoom[]>([])

  const [keptRoom, setKeptRoom] = useState<KeptRoomData | null>(null)
  const [enteredFromKept, setEnteredFromKept] = useState(false)

  // --- NEW: Recent & Following Rooms ---
  const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([])
  const [followingRooms, setFollowingRooms] = useState<KeptRoomData[]>([])

  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [currentSignInDay, setCurrentSignInDay] = useState(1)

  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [showDeleteZone, setShowDeleteZone] = useState(false)
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const circleStartPos = useRef({ x: 16, y: typeof window !== 'undefined' ? window.innerHeight * 0.4 : 300 })
  const deleteZoneRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)

  const [viewportHeight, setViewportHeight] = useState(0)

  const bannerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)

  // Jitsi refs for global audio
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const jitsiApiRef = useRef<any>(null)
  const [jitsiLoaded, setJitsiLoaded] = useState(false)
  const jitsiJoinedRef = useRef(false)
  const [isJitsiJoined, setIsJitsiJoined] = useState(false)

  useEffect(() => {
    if (!userUID || userUID === 'N/A') return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userUID)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();

        // Filter out if the conversation was cleared after the last message
        const clearedAt = data.clearedAtRef?.[userUID] || 0;
        const lastTimestamp = data.lastTimestamp?.toMillis?.() || 0;

        if (lastTimestamp >= clearedAt) {
          const unread = data.unreadCounts?.[userUID] || 0;
          count += unread;
        }
      });
      setTotalUnreadCount(count);
    });

    return () => unsubscribe();
  }, [userUID]);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(id)
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

  // Load Jitsi script
  useEffect(() => {
    if (!document.getElementById('jitsi-script')) {
      const script = document.createElement('script')
      script.id = 'jitsi-script'
      script.src = 'https://meet.jit.si/external_api.js'
      script.async = true
      script.onload = () => { setJitsiLoaded(true) }
      document.body.appendChild(script)
    } else {
      setJitsiLoaded(true)
    }
  }, [])

  // Initialize Jitsi for global listening
  const initializeJitsiForListening = useCallback(() => {
    if (!jitsiLoaded || !jitsiContainerRef.current || jitsiApiRef.current) return

    const domain = 'meet.jit.si'
    const options = {
      roomName: 'hurry-global-lobby',
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: { 
        displayName: userName || 'Guest', 
        email: (userUID || 'guest') + '@hurry.app' 
      },
      configOverrides: {
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        startAudioOnly: true,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        toolbarButtons: [],
        disableInviteFunctions: true,
        disablePolls: true,
        hideConferenceSubject: true,
        hideConferenceTimer: true,
        doNotStoreRoom: true,
        resolution: 180,
        constraints: { video: { height: { ideal: 180, max: 180, min: 180 } } },
      },
      interfaceConfigOverrides: {
        filmStripOnly: false,
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        TOOLBAR_ALWAYS_VISIBLE: false,
        DISABLE_VIDEO_BACKGROUND: true,
        HIDE_INVITE_MORE_HEADER: true,
        MOBILE_APP_PROMO: false,
        APP_NAME: 'Hurry',
        NATIVE_APP_NAME: 'Hurry',
        PROVIDER_NAME: 'Hurry'
      }
    }

    try {
      const api = new window.JitsiMeetExternalAPI(domain, options)
      jitsiApiRef.current = api
      jitsiJoinedRef.current = false

      api.addListener('videoConferenceJoined', () => {
        jitsiJoinedRef.current = true
        setIsJitsiJoined(true)
      })

      api.addListener('participantLeft', () => {
        // Handle participant leaving if needed
      })

    } catch (error) {
      console.error('Error initializing Jitsi:', error)
    }
  }, [jitsiLoaded, userName, userUID])

  // Initialize Jitsi when script loads and user data is available
  useEffect(() => {
    if (jitsiLoaded && !jitsiApiRef.current && userName !== 'Guest') {
      initializeJitsiForListening()
    }
  }, [jitsiLoaded, userName, initializeJitsiForListening])

  // Cleanup Jitsi on unmount
  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose()
        jitsiApiRef.current = null
      }
      jitsiJoinedRef.current = false
      setIsJitsiJoined(false)
    }
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

  // Calculate initial position for kept room circle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      circleStartPos.current = {
        x: window.innerWidth - 16 - 48,
        y: window.innerHeight * 0.6
      }
      setDragPosition(circleStartPos.current)
    }
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

  // --- Load profile, room state, kept room, recent rooms, following rooms ---
  useEffect(() => {
    const loadProfile = () => {
      const name = localStorage.getItem('userName') || 'JIYA'
      const photo = localStorage.getItem('userPhoto') || '/1784466691241~2.jpg'
      const uid = localStorage.getItem('userUID') || localStorage.getItem('userPhone') || '742918'
      const storedAccNum = localStorage.getItem('accountNumber') || ''

      setUserName(name)
      setUserPhoto(photo)
      setUserUID(uid)

      const roomCreated = localStorage.getItem('isRoomCreated')
      const roomData = localStorage.getItem('myRoom')

      if (roomCreated === 'true' && roomData) {
        setIsRoomCreated(true)
        try {
          const parsed = JSON.parse(roomData)
          let finalAccNum = storedAccNum || parsed.accountId;
          if (!finalAccNum) {
            const accObj = getOrCreateAccountNumber(uid);
            finalAccNum = accObj.fullAccNum;
          }
          setMyRoom({
            ...parsed,
            id: uid,
            accountId: finalAccNum
          })
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

      // Load recent rooms
      const storedRecent = localStorage.getItem('recentRooms')
      if (storedRecent) {
        try { setRecentRooms(JSON.parse(storedRecent)) } catch {}
      }
      // Load following rooms
      const storedFollowing = localStorage.getItem('followingRooms')
      if (storedFollowing) {
        try { setFollowingRooms(JSON.parse(storedFollowing)) } catch {}
      }
    }

    loadProfile()
    window.addEventListener('storage', loadProfile)
    return () => window.removeEventListener('storage', loadProfile)
  }, [])

  // Save recent and following rooms when they change
  useEffect(() => {
    localStorage.setItem('recentRooms', JSON.stringify(recentRooms))
  }, [recentRooms])

  useEffect(() => {
    localStorage.setItem('followingRooms', JSON.stringify(followingRooms))
  }, [followingRooms])

  // Listen for storage changes (e.g., keptRoom removed)
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

  // Load sign-in day from localStorage
  useEffect(() => {
    const savedDay = localStorage.getItem('signInDay')
    if (savedDay) {
      setCurrentSignInDay(parseInt(savedDay))
    }
  }, [])

  // --- Helper functions for recent and following rooms ---
  const addToRecent = (room: KeptRoomData) => {
    setRecentRooms(prev => {
      const filtered = prev.filter(r => r.accountId !== room.accountId)
      return [{ ...room, timestamp: Date.now() }, ...filtered].slice(0, 20)
    })
  }

  const handleFollowRoom = (room: KeptRoomData) => {
    setFollowingRooms(prev => {
      if (prev.some(r => r.accountId === room.accountId)) return prev
      return [...prev, room]
    })
    // Optionally update Firestore followers array here
  }

  const handleUnfollowRoom = (roomId: string) => {
    setFollowingRooms(prev => prev.filter(r => r.accountId !== roomId))
    // Optionally update Firestore followers array here
  }

  // Mouse & Touch drag handlers for kept room circle
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
    if (typeof window !== 'undefined') {
      circleStartPos.current = {
        x: window.innerWidth - 16 - 48,
        y: window.innerHeight * 0.6
      }
      setDragPosition(circleStartPos.current)
    }
  }

  const handleKeptRoomClick = () => {
    if (isDragging) return
    if (keptRoom) {
      addToRecent(keptRoom)   // Add to recent when entering via kept room
      setEnteredFromKept(true)
      const roomUser: UserCard = {
        id: keptRoom.accountId,
        accountId: keptRoom.accountId,
        name: keptRoom.name,
        country: keptRoom.country || '🇮🇳',
        image: keptRoom.image
      }
      setSelectedUser(roomUser)
      setCurrentPage('room')
    }
  }

  // ✅ STRICT BINDING: Mine Tab Card click strictly opens logged-in user's room
  const handleCardClick = async () => {
    setEnteredFromKept(false)

    const rawAccNum = localStorage.getItem('accountNumber') || getOrCreateAccountNumber(userUID)
    const storedAccNum = typeof rawAccNum === 'string' ? rawAccNum : (rawAccNum as any).fullAccNum

    const createdRoomCard: UserCard = {
      id: userUID,
      accountId: storedAccNum,
      name: userName,
      country: localStorage.getItem('userCountry') || '🇮🇳',
      image: userPhoto
    }

    if (!isRoomCreated) {
      localStorage.setItem('isRoomCreated', 'true')
      localStorage.setItem('myRoom', JSON.stringify(createdRoomCard))
      setIsRoomCreated(true)
      setMyRoom(createdRoomCard)

      // Save room data to Firestore
      await setDoc(doc(db, "globalRooms", userUID), {
        id: userUID,
        name: userName,
        country: localStorage.getItem("userCountry") || "🇮🇳",
        countryCode: localStorage.getItem("userCountryCode") || "IN",
        image: userPhoto,
        accountId: storedAccNum,
        createdAt: Date.now()
      }, { merge: true });

      // Save user data to Firestore
      await setDoc(doc(db, "users", userUID), {
        id: userUID,
        name: userName,
        country: localStorage.getItem("userCountry") || "🇮🇳",
        countryCode: localStorage.getItem("userCountryCode") || "IN",
        image: userPhoto,
        accountId: storedAccNum,
        createdAt: Date.now()
      }, { merge: true });
    }

    addToRecent({ name: userName, image: userPhoto, accountId: storedAccNum }) // Add own room to recent
    setSelectedUser(createdRoomCard)
    setCurrentPage('room')
  }

  const handleHouseClick = () => {
    handleCardClick()
  }

  // Handle Room Card Click from Search Overlay or Home Grid
  const handleUserCardClick = (user: UserCard) => {
    setEnteredFromKept(false)
    addToRecent({ name: user.name, image: user.image, accountId: user.accountId || user.id })
    setSelectedUser(user)
    setCurrentPage('room')
    if (isSearchOpen) {
      setIsSearchOpen(false)
    }
  }

  // Handle User Search Item Click -> Opens Target User's Public Profile
  const handleUserProfileClick = (user: UserCard) => {
    setSelectedUser(user)
    setIsPublicProfileActive(true)
    setCurrentPage('public_profile')
    if (isSearchOpen) {
      setIsSearchOpen(false)
    }
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

  const handleBackFromPublicProfile = () => {
    setIsPublicProfileActive(false)
    setCurrentPage('home')
    setSelectedUser(null)
  }

  const handleJoinRoomFromChat = async (roomId: string) => {
    try {
      const roomDoc = await getDoc(doc(db, 'globalRooms', roomId));
      if (roomDoc.exists()) {
        const roomData = roomDoc.data();
        handleUserCardClick({
          id: roomData.id || roomId,
          accountId: roomData.accountId || roomId,
          name: roomData.name,
          country: roomData.country || '🇮🇳',
          image: roomData.image || '/default-avatar.png'
        });
      } else {
        console.error('Room not found');
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  };

  // ROBUST SEARCH FUNCTION FOR FIRESTORE
  const handlePerformSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    const queryRaw = searchQuery.trim()
    const queryLower = queryRaw.toLowerCase()

    try {
      const foundList: GlobalRoom[] = []
      const addedIds = new Set<string>()

      const addResult = (docId: string, uData: any) => {
        const accId = String(uData.accountId || uData.id || docId)
        if (!addedIds.has(docId) && !addedIds.has(accId)) {
          addedIds.add(docId)
          addedIds.add(accId)
          foundList.push({
            id: docId,
            name: uData.name || 'User',
            country: uData.country || '🇮🇳',
            image: uData.image || uData.photo || '/default-avatar.png',
            accountId: accId,
            createdAt: uData.createdAt || Date.now()
          })
        }
      }

      // 1. Local globalRooms search (case-insensitive)
      globalRooms.forEach((r) => {
        const accId = String(r.accountId || r.id || '')
        const rName = String(r.name || '')
        if (
          accId.toLowerCase().includes(queryLower) ||
          rName.toLowerCase().includes(queryLower)
        ) {
          if (!addedIds.has(accId)) {
            addedIds.add(accId)
            foundList.push(r)
          }
        }
      })

      // 2. Direct Document ID Search in 'users'
      try {
        const userDocRef = doc(db, "users", queryRaw)
        const userDocSnap = await getDoc(userDocRef)
        if (userDocSnap.exists()) {
          addResult(userDocSnap.id, userDocSnap.data())
        }
      } catch (e) {
        console.warn("Direct doc search skipped:", e)
      }

      // 3. 'users' collection accountId query
      try {
        const usersRef = collection(db, "users")
        const qRange = query(
          usersRef,
          where("accountId", ">=", queryRaw),
          where("accountId", "<=", queryRaw + '\uf8ff')
        )
        const snapRange = await getDocs(qRange)
        snapRange.docs.forEach((d) => addResult(d.id, d.data()))
      } catch (err) {
        console.warn("Users query error:", err)
      }

      // 4. 'globalRooms' collection query
      try {
        const roomsRef = collection(db, "globalRooms")
        const qRooms = query(
          roomsRef,
          where("accountId", ">=", queryRaw),
          where("accountId", "<=", queryRaw + '\uf8ff')
        )
        const snapRooms = await getDocs(qRooms)
        snapRooms.docs.forEach((d) => addResult(d.id, d.data()))
      } catch (err) {
        console.warn("globalRooms query error:", err)
      }

      // Sort exact match first
      foundList.sort((a, b) => {
        const aExact = String(a.accountId).toLowerCase() === queryLower || a.id.toLowerCase() === queryLower
        const bExact = String(b.accountId).toLowerCase() === queryLower || b.id.toLowerCase() === queryLower
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        return (b.createdAt || 0) - (a.createdAt || 0)
      })

      setSearchResults(foundList.slice(0, 20))
      setHasSearched(true)

    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  // Sign-in modal handlers
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

  useEffect(() => {
    if (currentPage !== 'message') {
      setIsChatOpen(false)
    }
  }, [currentPage])

  useEffect(() => {
    if (currentPage !== 'me' && currentPage !== 'public_profile') {
      setIsPublicProfileActive(false)
    }
  }, [currentPage])

  // Filter out fake rooms like "Jiys" from the Popular tab
  const allRooms = globalRooms.filter(room =>
    !/jiys/i.test(room.name) && room.name !== 'User'
  )

  const renderMineTab = () => (
    <div className="px-4 mt-6">
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
                Embark Your Hurry journey!
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

      {/* Following rooms */}
      {activeMineTab === 'following' && (
        followingRooms.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {followingRooms.map(room => {
              const user: UserCard = {
                id: room.accountId,
                accountId: room.accountId,
                name: room.name,
                country: room.country || '🇮🇳',
                image: room.image
              }
              return (
                <div
                  key={room.accountId}
                  onClick={() => handleUserCardClick(user)}
                  className="relative bg-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                  style={{ height: '180px' }}
                >
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🇮🇳</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-xs truncate">
                          {room.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
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
            <p className="text-sm">No followed rooms yet</p>
          </div>
        )
      )}

      {/* Recent rooms */}
      {activeMineTab === 'recent' && (
        recentRooms.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {recentRooms.map(room => {
              const user: UserCard = {
                id: room.accountId,
                accountId: room.accountId,
                name: room.name,
                country: room.country || '🇮🇳',
                image: room.image
              }
              return (
                <div
                  key={room.accountId}
                  onClick={() => handleUserCardClick(user)}
                  className="relative bg-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                  style={{ height: '180px' }}
                >
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🇮🇳</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-xs truncate">
                          {room.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
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
        )
      )}
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
      {allRooms.length > 0 && (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-2.5">
            {allRooms.map((room) => (
              <div
                key={room.accountId}
                onClick={() => handleUserCardClick({
                  id: room.id || room.accountId,
                  accountId: room.accountId,
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
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{room.country}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-xs truncate">
                        {room.name}
                      </div>
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
        minHeight: viewportHeight ? `calc(var(--vh, 1vh) * 100)` : '100vh',
        paddingBottom: (isChatOpen || isPublicProfileActive || isSearchOpen) ? '0px' : '96px',
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {/* Hidden Jitsi container for global listening */}
      <div 
        ref={jitsiContainerRef} 
        className="absolute inset-0 z-0 opacity-0 pointer-events-none" 
        style={{ width: '1px', height: '1px' }} 
      />

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
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes modalOverlayIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes slideUpSheet {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      {/* SEARCH OVERLAY SHEET */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[120] bg-white flex flex-col"
          style={{
            animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            height: viewportHeight ? 'calc(var(--vh, 1vh) * 100)' : '100vh'
          }}
        >
          {/* Top Row Header */}
          <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-gray-100 safe-top">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            <div className="flex-1 flex items-center bg-gradient-to-r from-gray-100/90 to-blue-50/70 border border-white/60 shadow-inner rounded-full px-4 py-2 backdrop-blur-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID or name..."
                className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePerformSearch()
                }}
              />
            </div>

            <button
              onClick={handlePerformSearch}
              className="p-2.5 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white rounded-full shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          {/* User / Room Tabs */}
          <div className="flex px-4 border-b border-gray-100 mt-1">
            <button
              type="button"
              onClick={() => setActiveSearchTab('user')}
              className={`py-3 px-6 text-sm font-bold relative transition-colors ${
                activeSearchTab === 'user' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              User
              {activeSearchTab === 'user' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveSearchTab('room')}
              className={`py-3 px-6 text-sm font-bold relative transition-colors ${
                activeSearchTab === 'room' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              Room
              {activeSearchTab === 'room' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 hide-scrollbar">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs font-semibold">Searching...</p>
              </div>
            ) : hasSearched ? (
              searchResults.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {searchResults.map((user) => (
                    activeSearchTab === 'user' ? (
                      <div
                        key={user.accountId}
                        onClick={() => handleUserProfileClick({
                          id: user.id || user.accountId,
                          accountId: user.accountId,
                          name: user.name,
                          country: user.country,
                          image: user.image
                        })}
                        className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:shadow-md"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 text-sm truncate">{user.name}</span>
                            <span className="text-xs">{user.country}</span>
                          </div>
                          <span className="text-xs text-gray-400 mt-0.5 font-medium">ID: {user.accountId}</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={user.accountId}
                        onClick={() => handleUserCardClick({
                          id: user.id || user.accountId,
                          accountId: user.accountId,
                          name: user.name,
                          country: user.country,
                          image: user.image
                        })}
                        className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:shadow-md"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 text-sm truncate">{user.name}</span>
                            <span className="text-xs">{user.country}</span>
                          </div>
                          <span className="text-xs text-gray-400 mt-0.5 font-medium">ID: {user.accountId}</span>
                        </div>
                        <div className="px-3.5 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-sm">
                          Enter
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-40">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p className="text-sm font-semibold">No result found</p>
                  <p className="text-xs text-gray-400 mt-1">Try different ID or name</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-40">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-sm font-semibold mb-1">Search {activeSearchTab === 'user' ? 'Users' : 'Rooms'}</p>
                <p className="text-xs font-medium text-gray-400">Enter ID or name to find people</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sign-in Modal */}
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

      {/* Delete Zone */}
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

      {/* Kept Room Floating Circle */}
      {keptRoom && currentPage === 'home' && !isSearchOpen && (
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

      {!isChatOpen && currentPage !== 'room' && !isPublicProfileActive && !isSearchOpen && (
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
      )}

      <div className="w-full">
        {currentPage === 'home' && (
          <div
            className="w-full bg-white"
            style={{
              minHeight: viewportHeight ? 'calc(var(--vh, 1vh) * 100)' : '100vh'
            }}
          >
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
              <div className="w-full flex justify-between items-center py-1 box-border mb-4 safe-top">
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
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
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
          <MessagePage onChatOpen={setIsChatOpen} onJoinRoom={handleJoinRoomFromChat} />
        )}

        {currentPage === 'me' && (
          <MePage
            onLogout={onLogout}
            onPublicProfileChange={(active: boolean) => setIsPublicProfileActive(active)}
          />
        )}

        {currentPage === 'room' && selectedUser && (
          <RoomPage
            roomOwner={selectedUser}
            currentUser={{
              id: userUID,
              uid: userUID,
              accountId: (() => {
                const rawAccNum = localStorage.getItem('accountNumber') || getOrCreateAccountNumber(userUID)
                return typeof rawAccNum === 'string' ? rawAccNum : (rawAccNum as any).fullAccNum
              })(),
              name: userName,
              image: userPhoto
            }}
            onBack={handleBackFromRoom}
            onKeepRoom={handleKeepRoom}
            onFollowToggle={(roomId: string, follow: boolean) => {
              if (follow) {
                const room = selectedUser
                if (room) handleFollowRoom({ name: room.name, image: room.image, accountId: room.accountId || room.id })
              } else {
                handleUnfollowRoom(roomId)
              }
            }}
          />
        )}

        {currentPage === 'public_profile' && (
          <PublicProfile
            onBack={handleBackFromPublicProfile}
            onJoinRoom={handleJoinRoomFromChat}
            isOtherUser={true}
            targetUser={selectedUser ? {
              id: selectedUser.id,
              uid: selectedUser.id,
              accountId: selectedUser.accountId,
              displayAccountNumber: selectedUser.accountId,
              name: selectedUser.name,
              country: selectedUser.country,
              photo: selectedUser.image,
              image: selectedUser.image
            } : null}
          />
        )}
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      {!isChatOpen && currentPage !== 'room' && !isPublicProfileActive && !isSearchOpen && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-30 safe-bottom">
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
                {t.home}
              </span>
            </button>

            <button
              onClick={() => setCurrentPage('message')}
              className="flex flex-col items-center gap-1 transition-all active:scale-95"
            >
              <div className="relative">
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
                {totalUnreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white">
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </div>
                )}
              </div>
              <span className={`text-[12px] ${currentPage === 'message' ? 'font-semibold text-black' : 'text-gray-500'}`}>
                {t.message}
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
                {t.me}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
      }
