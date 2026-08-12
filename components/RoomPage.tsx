'use client'

import React, { useState, useEffect, useRef } from 'react'
import EmojiPicker from './Emojipicker'
import GiftPicker from './GiftPicker'
import RoomSettingPage from './RoomSettingPage'
import MessagePage from './MessagePage'
import { db } from "../src/lib/supabase"
import { doc, setDoc, getDoc } from "../src/lib/supabase"
import Image from 'next/image'

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface RoomPageProps {
  roomOwner: {
    id?: string
    uid?: string
    accountId?: string
    name: string
    image: string
  }
  currentUser: {
    id?: string
    uid?: string
    accountId: string
    name: string
    image: string
  }
  onClose?: () => void
  onBack?: () => void
  onKeepRoom?: (roomData: { name: string; image: string; accountId: string }) => void
  onFollowToggle?: (roomId: string, follow: boolean) => void
}

const SPECIAL_ACCOUNTS: { [key: string]: string } = {
  'HUSxSvQnabgU029dWYt1TUV04hd2': '100002',
  'ADqW31RGBMaosOzy0HiqexKSD7h1': '100003',
  '100002': '100002',
  '100003': '100003'
}

const OFFICIAL_IDS = ['500001', '500002', '500003', '500004', '500005']
const ADMIN_IDS = ['700001', '700002', '700003']

interface Seat {
  number: number
  isOccupied: boolean
  isLocked?: boolean
  user?: { name: string; image: string; accountId: string }
  isMuted?: boolean
  isSpeaking?: boolean
}

interface Message {
  id: string
  text: string
  sender: string
  senderImage: string
  timestamp: number
  type?: 'message' | 'join' | 'leave'
  imageUrl?: string
}

interface RoomUser {
  accountId: string
  name: string
  image: string
}

export default function RoomPage({ roomOwner, currentUser, onClose, onBack, onKeepRoom, onFollowToggle }: RoomPageProps) {
  const [showExitMenu, setShowExitMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGiftPicker, setShowGiftPicker] = useState(false)
  const [showMessageSheet, setShowMessageSheet] = useState(false)
  const [showSettingPage, setShowSettingPage] = useState(false)
  const [showRoomInfo, setShowRoomInfo] = useState(false)
  const [showActiveUsers, setShowActiveUsers] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)
  const [copied, setCopied] = useState(false)

  const userAccountId = currentUser.accountId || currentUser.uid || currentUser.id || "guest"
  const roomOwnerId = roomOwner.accountId || roomOwner.uid || roomOwner.id || ""
  const isRoomOwner = userAccountId === roomOwnerId

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [fullImageModal, setFullImageModal] = useState<string | null>(null)

  const [roomName, setRoomName] = useState<string>("")
  const [roomAnnouncement, setRoomAnnouncement] = useState<string>("")
  const [roomImage, setRoomImage] = useState<string>(roomOwner.image || "/1784533036732~2.jpg")
  const [micMode, setMicMode] = useState<number>(9)
  const [roomInfoTab, setRoomInfoTab] = useState<'profile' | 'members'>('profile')

  const backgroundImage = "/1784533036732~2.jpg"

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)

  const [showChatInput, setShowChatInput] = useState(false)
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([])

  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const jitsiApiRef = useRef<any>(null)
  const [jitsiLoaded, setJitsiLoaded] = useState(false)

  const speakingUsersRef = useRef<Set<string>>(new Set())
  const speakingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const [roomFollowers, setRoomFollowers] = useState<RoomUser[]>([])

  const getInitialSeats = (mode: number): Seat[] => {
    const seats: Seat[] = []
    for (let i = 1; i <= mode; i++) {
      seats.push({ number: i, isOccupied: false, isLocked: false, isMuted: false, isSpeaking: false })
    }
    return seats
  }

  const [seats, setSeats] = useState<Seat[]>(getInitialSeats(9))
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [showSeatSheet, setShowSeatSheet] = useState(false)

  const hasSeat = seats.some(s => s.isOccupied && s.user?.accountId === userAccountId)
  const currentUserSeat = seats.find(s => s.isOccupied && s.user?.accountId === userAccountId)

  const jitsiRoomName = `hurry-room-${Math.abs(hashCode(roomOwner.id || roomOwner.accountId || 'default')) % 100000}`

  function hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash |= 0
    }
    return Math.abs(hash)
  }

  const displayRoomName = roomName
    ? (roomName.length > 6 ? roomName.substring(0, 6) + '...' : roomName)
    : (roomOwner.name?.length > 6 ? roomOwner.name?.substring(0, 6) + '...' : roomOwner.name || 'User')

  // Fetch room data from Firestore
  useEffect(() => {
    const fetchRoomData = async () => {
      if (roomOwner.id && db) {
        try {
          const snap = await getDoc(doc(db, "globalRooms", roomOwner.id))
          if (snap.exists()) {
            const data = snap.data()
            setRoomName(data.name || "")
            setRoomAnnouncement(data.announcement || "")
            setRoomImage(data.image || roomOwner.image)
            if (data.micMode && data.micMode !== micMode) {
              setMicMode(data.micMode)
            }
            const followerIds: string[] = data.followers || []
            const followersList: RoomUser[] = followerIds.map((id: string) => ({
              accountId: id,
              name: `User ${id.slice(0, 5)}`,
              image: ''
            }))
            setRoomFollowers(followersList)
          }
        } catch (err) {
          console.error("Error loading room data:", err)
        }
      }
    }
    fetchRoomData()
  }, [roomOwner.id, roomOwner.image])

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

  const setUserSpeaking = (targetId: string, speaking: boolean) => {
    setSeats(prev => prev.map(seat => {
      if (seat.isOccupied && seat.user) {
        if (seat.user.accountId === targetId || (targetId === 'local' && seat.user.accountId === userAccountId)) {
          return { ...seat, isSpeaking: speaking }
        }
      }
      return seat
    }))
  }

  // Initialize Jitsi
  useEffect(() => {
    if (!jitsiLoaded || !jitsiContainerRef.current) return

    const domain = 'meet.jit.si'
    const options = {
      roomName: jitsiRoomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: { displayName: currentUser.name, email: userAccountId + '@hurry.app' },
      configOverrides: {
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        enableNoisyMicDetection: true,
        disableAudioLevels: false,
        toolbarButtons: [],
        disableInviteFunctions: true,
        disablePolls: true,
        disableSelfView: true,
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

      api.addListener('videoConferenceJoined', () => {
        api.executeCommand('toggleAudio', false)
      })

      api.addListener('dominantSpeakerChanged', (data: any) => {
        const speakerId = data?.id || 'local'
        speakingUsersRef.current.add(speakerId)
        setUserSpeaking(speakerId, true)
        const existingTimer = speakingTimersRef.current.get(speakerId)
        if (existingTimer) clearTimeout(existingTimer)
        const timer = setTimeout(() => {
          speakingUsersRef.current.delete(speakerId)
          setUserSpeaking(speakerId, false)
          speakingTimersRef.current.delete(speakerId)
        }, 1500)
        speakingTimersRef.current.set(speakerId, timer)
      })

      api.addListener('audioLevelsChanged', (data: any) => {
        if (data && data.length > 0) {
          data.forEach((participant: any) => {
            if (participant.id && participant.level > 0.03) {
              const targetKey = participant.id
              speakingUsersRef.current.add(targetKey)
              setUserSpeaking(targetKey, true)
              const existingTimer = speakingTimersRef.current.get(targetKey)
              if (existingTimer) clearTimeout(existingTimer)
              const timer = setTimeout(() => {
                speakingUsersRef.current.delete(targetKey)
                setUserSpeaking(targetKey, false)
                speakingTimersRef.current.delete(targetKey)
              }, 800)
              speakingTimersRef.current.set(targetKey, timer)
            }
          })
        }
      })

      api.addListener('participantLeft', (data: any) => {
        if (data && data.id) {
          speakingUsersRef.current.delete(data.id)
          setUserSpeaking(data.id, false)
          const timer = speakingTimersRef.current.get(data.id)
          if (timer) { clearTimeout(timer); speakingTimersRef.current.delete(data.id) }
        }
      })
    } catch (error) {
      console.error('Error initializing Jitsi:', error)
    }

    return () => {
      speakingTimersRef.current.forEach(timer => clearTimeout(timer))
      speakingTimersRef.current.clear()
      speakingUsersRef.current.clear()
      if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null }
    }
  }, [jitsiLoaded, jitsiRoomName, userAccountId, currentUser.name])

  // Toggle audio when seat status changes
  useEffect(() => {
    if (!jitsiApiRef.current) return
    try {
      if (hasSeat) {
        jitsiApiRef.current.executeCommand('toggleAudio', !currentUserSeat?.isMuted)
      } else {
        jitsiApiRef.current.executeCommand('toggleAudio', false)
      }
    } catch (e) {
      console.warn("Jitsi audio execute error:", e)
    }
  }, [hasSeat, currentUserSeat?.isMuted])

  // Update seats when mic mode changes
  useEffect(() => {
    setSeats(getInitialSeats(micMode))
  }, [micMode])

  // Add current user to room users (live count)
  useEffect(() => {
    if (userAccountId !== "guest" && currentUser.name && currentUser.image) {
      const userExists = roomUsers.find(u => u.accountId === userAccountId)
      if (!userExists) {
        setRoomUsers(prev => [...prev, { accountId: userAccountId, name: currentUser.name, image: currentUser.image }])
        setMessages(prev => [...prev, {
          id: `join-${Date.now()}`,
          text: 'Enter the Room',
          sender: currentUser.name,
          senderImage: currentUser.image,
          timestamp: Date.now(),
          type: 'join'
        }])
      }
    }
    return () => {
      setRoomUsers(prev => prev.filter(u => u.accountId !== userAccountId))
    }
  }, [userAccountId, currentUser.name, currentUser.image])

  // Scroll messages to bottom
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (showChatInput && inputRef.current) {
      const timer = setTimeout(() => { if (inputRef.current) inputRef.current.focus() }, 100)
      return () => clearTimeout(timer)
    }
  }, [showChatInput])

  // Handle click outside chat input
  useEffect(() => {
    if (!showChatInput) return
    const handleClickOutside = (e: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setShowChatInput(false)
        setMessage("")
      }
    }
    const handleTouchOutside = (e: TouchEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setShowChatInput(false)
        setMessage("")
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleTouchOutside)
    }, 300)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleTouchOutside)
    }
  }, [showChatInput])

  // ---------- All handler functions ----------

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(roomOwner.accountId || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyUserId = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(accountId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Image size should be less than 5MB'); return }
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: '',
        sender: currentUser.name,
        senderImage: currentUser.image,
        timestamp: Date.now(),
        type: 'message',
        imageUrl
      }])
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSeatClick = (seatNumber: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSeat(seatNumber)
    setShowSeatSheet(true)
  }

  const handleTakeSeat = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (selectedSeat === null) return
    const targetSeat = seats.find(s => s.number === selectedSeat)
    if (targetSeat?.isLocked && !targetSeat.isOccupied) { alert("This seat is locked!"); return }
    if (targetSeat?.isOccupied && targetSeat.user?.accountId !== userAccountId) { alert("This seat is already taken!"); return }

    let updatedSeats = seats.map(s => {
      if (s.isOccupied && s.user?.accountId === userAccountId)
        return { ...s, isOccupied: false, isLocked: s.isLocked, isMuted: s.isMuted, isSpeaking: false }
      return s
    })

    updatedSeats = updatedSeats.map(s => {
      if (s.number === selectedSeat) {
        if (jitsiApiRef.current) {
          try { jitsiApiRef.current.executeCommand('toggleAudio', true) } catch (err) {}
        }
        return {
          ...s,
          isOccupied: true,
          user: { name: currentUser.name, image: currentUser.image, accountId: userAccountId },
          isMuted: false,
          isSpeaking: false
        }
      }
      return s
    })

    setSeats(updatedSeats)
    setShowSeatSheet(false)
    setSelectedSeat(null)
  }

  const handleLeaveSeat = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (selectedSeat === null) return
    if (jitsiApiRef.current && userAccountId === seats.find(s => s.number === selectedSeat)?.user?.accountId) {
      try { jitsiApiRef.current.executeCommand('toggleAudio', false) } catch (err) {}
    }
    const updatedSeats = seats.map(s => {
      if (s.number === selectedSeat)
        return { ...s, isOccupied: false, isLocked: s.isLocked, isMuted: s.isMuted, isSpeaking: false }
      return s
    })
    setSeats(updatedSeats)
    setShowSeatSheet(false)
    setSelectedSeat(null)
  }

  const handleToggleMute = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (selectedSeat === null) return
    const updatedSeats = seats.map(s => {
      if (s.number === selectedSeat) {
        const newMuteState = !s.isMuted
        if (s.user?.accountId === userAccountId && jitsiApiRef.current) {
          try { jitsiApiRef.current.executeCommand('toggleAudio', !newMuteState) } catch (err) {}
        }
        return { ...s, isMuted: newMuteState }
      }
      return s
    })
    setSeats(updatedSeats)
  }

  const handleBottomMicToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentUserSeat || !jitsiApiRef.current) return
    const newMuteState = !currentUserSeat.isMuted
    try { jitsiApiRef.current.executeCommand('toggleAudio', !newMuteState) } catch (err) {}
    const updatedSeats = seats.map(s => {
      if (s.number === currentUserSeat.number) return { ...s, isMuted: newMuteState }
      return s
    })
    setSeats(updatedSeats)
  }

  const handleToggleLock = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (selectedSeat === null) return
    const updatedSeats = seats.map(s => {
      if (s.number === selectedSeat) return { ...s, isLocked: !s.isLocked }
      return s
    })
    setSeats(updatedSeats)
    setShowSeatSheet(false)
    setSelectedSeat(null)
  }

  const handleInvite = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (selectedSeat === null) return
    alert(`Invite sent to join seat ${selectedSeat}!`)
    setShowSeatSheet(false)
    setSelectedSeat(null)
  }

  const isCurrentUsersSeat = (seat?: Seat) => Boolean(seat && seat.isOccupied && seat.user?.accountId === userAccountId)

  const handleSendMessage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!message.trim()) return
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: message.trim(),
      sender: currentUser.name,
      senderImage: currentUser.image,
      timestamp: Date.now(),
      type: 'message'
    }])
    setMessage("")
    if (inputRef.current) inputRef.current.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSendMessage() }
  }

  const handleInputFocus = () => setShowChatInput(true)

  const openChatInput = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setShowChatInput(true)
    setTimeout(() => { if (inputRef.current) inputRef.current.focus() }, 100)
  }

  const closeBottomSheet = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setShowSeatSheet(false)
    setSelectedSeat(null)
  }

  const closeExitMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setShowExitMenu(false)
  }

  const openExitMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setShowExitMenu(true)
  }

  const openSettings = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setShowSettingPage(true)
  }

  const closeSettings = () => setShowSettingPage(false)

  const handleSaveSettings = async (data: any) => {
    if (data.roomName) setRoomName(data.roomName)
    if (data.announcement !== undefined) setRoomAnnouncement(data.announcement)
    if (data.roomImage) setRoomImage(data.roomImage)
    if (data.micMode) setMicMode(data.micMode)

    if (roomOwner.id && db) {
      await setDoc(doc(db, "globalRooms", roomOwner.id), {
        name: data.roomName,
        image: data.roomImage,
        announcement: data.announcement,
        micMode: data.micMode
      }, { merge: true })
    }
  }

  const handleExit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setShowExitMenu(false)
    localStorage.removeItem('keptRoom')
    setRoomUsers(prev => prev.filter(u => u.accountId !== userAccountId))
    if (jitsiApiRef.current) jitsiApiRef.current.dispose()
    if (onBack) onBack()
    if (onClose) onClose()
  }

  const handleKeep = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const roomData = { name: roomOwner.name, image: roomOwner.image, accountId: roomOwner.accountId || '' }
    localStorage.setItem('keptRoom', JSON.stringify(roomData))
    setShowExitMenu(false)
    if (onKeepRoom) onKeepRoom(roomData)
    if (onBack) onBack()
  }

  const handleEmojiSelect = (emoji: string) => console.log("Selected Emoji:", emoji)

  // Derived values
  const liveUserCount = roomUsers.length
  const selectedSeatData = selectedSeat !== null ? seats.find(s => s.number === selectedSeat) : null
  const isSelectedSeatMySeat = selectedSeatData ? isCurrentUsersSeat(selectedSeatData) : false
  const isSelectedSeatTakenByOther = selectedSeatData ? (selectedSeatData.isOccupied && !isSelectedSeatMySeat) : false

  // ---------- Render seats based on mic mode ----------
  const renderSeats = () => {
    if (micMode === 5) {
      return (
        <>
          <div className="flex justify-center">
            <SeatItem seatNumber={1} seatData={seats[0]} onClick={handleSeatClick(1)} accountId={userAccountId} />
          </div>
          <div className="flex justify-around items-center px-1">
            <SeatItem seatNumber={2} seatData={seats[1]} onClick={handleSeatClick(2)} accountId={userAccountId} />
            <SeatItem seatNumber={3} seatData={seats[2]} onClick={handleSeatClick(3)} accountId={userAccountId} />
            <SeatItem seatNumber={4} seatData={seats[3]} onClick={handleSeatClick(4)} accountId={userAccountId} />
            <SeatItem seatNumber={5} seatData={seats[4]} onClick={handleSeatClick(5)} accountId={userAccountId} />
          </div>
        </>
      )
    }
    if (micMode === 10) {
      return (
        <>
          <div className="flex justify-center gap-4">
            <SeatItem seatNumber={1} seatData={seats[0]} onClick={handleSeatClick(1)} accountId={userAccountId} />
            <SeatItem seatNumber={2} seatData={seats[1]} onClick={handleSeatClick(2)} accountId={userAccountId} />
          </div>
          <div className="flex justify-around items-center px-1">
            <SeatItem seatNumber={3} seatData={seats[2]} onClick={handleSeatClick(3)} accountId={userAccountId} />
            <SeatItem seatNumber={4} seatData={seats[3]} onClick={handleSeatClick(4)} accountId={userAccountId} />
            <SeatItem seatNumber={5} seatData={seats[4]} onClick={handleSeatClick(5)} accountId={userAccountId} />
            <SeatItem seatNumber={6} seatData={seats[5]} onClick={handleSeatClick(6)} accountId={userAccountId} />
          </div>
          <div className="flex justify-around items-center px-1">
            <SeatItem seatNumber={7} seatData={seats[6]} onClick={handleSeatClick(7)} accountId={userAccountId} />
            <SeatItem seatNumber={8} seatData={seats[7]} onClick={handleSeatClick(8)} accountId={userAccountId} />
            <SeatItem seatNumber={9} seatData={seats[8]} onClick={handleSeatClick(9)} accountId={userAccountId} />
            <SeatItem seatNumber={10} seatData={seats[9]} onClick={handleSeatClick(10)} accountId={userAccountId} />
          </div>
        </>
      )
    }
    if (micMode === 13) {
      return (
        <>
          <div className="flex justify-center">
            <SeatItem seatNumber={1} seatData={seats[0]} onClick={handleSeatClick(1)} accountId={userAccountId} />
          </div>
          <div className="flex justify-around items-center px-1">
            <SeatItem seatNumber={2} seatData={seats[1]} onClick={handleSeatClick(2)} accountId={userAccountId} />
            <SeatItem seatNumber={3} seatData={seats[2]} onClick={handleSeatClick(3)} accountId={userAccountId} />
            <SeatItem seatNumber={4} seatData={seats[3]} onClick={handleSeatClick(4)} accountId={userAccountId} />
            <SeatItem seatNumber={5} seatData={seats[4]} onClick={handleSeatClick(5)} accountId={userAccountId} />
          </div>
          <div className="flex justify-around items-center px-1">
            <SeatItem seatNumber={6} seatData={seats[5]} onClick={handleSeatClick(6)} accountId={userAccountId} />
            <SeatItem seatNumber={7} seatData={seats[6]} onClick={handleSeatClick(7)} accountId={userAccountId} />
            <SeatItem seatNumber={8} seatData={seats[7]} onClick={handleSeatClick(8)} accountId={userAccountId} />
            <SeatItem seatNumber={9} seatData={seats[8]} onClick={handleSeatClick(9)} accountId={userAccountId} />
          </div>
          <div className="flex justify-around items-center px-1">
            <SeatItem seatNumber={10} seatData={seats[9]} onClick={handleSeatClick(10)} accountId={userAccountId} />
            <SeatItem seatNumber={11} seatData={seats[10]} onClick={handleSeatClick(11)} accountId={userAccountId} />
            <SeatItem seatNumber={12} seatData={seats[11]} onClick={handleSeatClick(12)} accountId={userAccountId} />
            <SeatItem seatNumber={13} seatData={seats[12]} onClick={handleSeatClick(13)} accountId={userAccountId} />
          </div>
        </>
      )
    }
    // Default 9 seats
    return (
      <>
        <div className="flex justify-center">
          <SeatItem seatNumber={1} seatData={seats[0]} onClick={handleSeatClick(1)} accountId={userAccountId} />
        </div>
        <div className="flex justify-around items-center px-1">
          <SeatItem seatNumber={2} seatData={seats[1]} onClick={handleSeatClick(2)} accountId={userAccountId} />
          <SeatItem seatNumber={3} seatData={seats[2]} onClick={handleSeatClick(3)} accountId={userAccountId} />
          <SeatItem seatNumber={4} seatData={seats[3]} onClick={handleSeatClick(4)} accountId={userAccountId} />
          <SeatItem seatNumber={5} seatData={seats[4]} onClick={handleSeatClick(5)} accountId={userAccountId} />
        </div>
        <div className="flex justify-around items-center px-1">
          <SeatItem seatNumber={6} seatData={seats[5]} onClick={handleSeatClick(6)} accountId={userAccountId} />
          <SeatItem seatNumber={7} seatData={seats[6]} onClick={handleSeatClick(7)} accountId={userAccountId} />
          <SeatItem seatNumber={8} seatData={seats[7]} onClick={handleSeatClick(8)} accountId={userAccountId} />
          <SeatItem seatNumber={9} seatData={seats[8]} onClick={handleSeatClick(9)} accountId={userAccountId} />
        </div>
      </>
    )
  }

  // Settings page
  if (showSettingPage) {
    return (
      <RoomSettingPage
        onBack={closeSettings}
        roomOwnerId={roomOwner.id}
        roomData={{ roomName, roomImage, announcement: roomAnnouncement, micMode }}
        onSave={handleSaveSettings}
      />
    )
  }

  // ---------- Main Return JSX ----------
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Fixed background image */}
      <img
        src={backgroundImage}
        alt="Room Background"
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        draggable={false}
      />

      {/* Hidden Jitsi container */}
      <div ref={jitsiContainerRef} className="absolute inset-0 z-0 opacity-0 pointer-events-none" style={{ width: '1px', height: '1px' }} />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" aria-label="Upload image" />

      <div className="relative z-10 flex flex-col h-full px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>

        {/* ---------- Top Header Section ---------- */}
        <div className="flex justify-between items-center text-white flex-shrink-0">
          {/* Room Cover + Name + Follow */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setRoomInfoTab('profile'); setShowRoomInfo(true); }}
              className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/30 flex-shrink-0 cursor-pointer hover:border-white/50 transition-colors"
            >
              <img src={roomImage} alt="Room Cover" className="w-full h-full object-cover" draggable={false} />
            </button>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg">{displayRoomName}</h2>
                {/* Follow button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const newFollow = !isFollowed
                    setIsFollowed(newFollow)
                    if (onFollowToggle) {
                      onFollowToggle(roomOwner.id || roomOwner.accountId || '', newFollow)
                    }
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isFollowed ? 'bg-gray-500' : 'bg-blue-500'
                  }`}
                  title={isFollowed ? 'Unfollow Room' : 'Follow Room'}
                >
                  {isFollowed ? (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white absolute">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 relative">
                        <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-300">ID: {roomOwner.accountId || roomOwner.id || ''}</p>
            </div>
          </div>

          {/* Top Right Icons */}
          <div className="flex items-center gap-1.5">
            {/* User count button - opens Active Users sheet */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowActiveUsers(true); }}
              className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 h-7 cursor-pointer hover:bg-black/60 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <circle cx="9" cy="7" r="4" />
                <path d="M 2 20 C 2 15 5 13 9 13 C 13 13 16 15 16 20" />
                <line x1="18" y1="8" x2="21" y2="8" /><line x1="18" y1="12" x2="21" y2="12" /><line x1="18" y1="16" x2="20" y2="16" />
              </svg>
              <span className="text-white text-xs font-semibold leading-none">{liveUserCount}</span>
            </button>

            {/* Settings icon – ONLY visible to room owner */}
            {isRoomOwner && (
              <button onClick={openSettings} aria-label="Settings" className="p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors cursor-pointer">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                  <polygon points="12 2.5 20.2 7.25 20.2 16.75 12 21.5 3.8 16.75 3.8 7.25" />
                  <circle cx="12" cy="12" r="2.8" />
                </svg>
              </button>
            )}

            <button onClick={(e) => e.stopPropagation()} aria-label="Share" className="p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors cursor-pointer">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                <path d="M4 14.5C4.5 10 8 7 14 7V3L21 10.5L14 18V14C9.5 14 6 15.5 4 19.5C4 18 4 16 4 14.5Z" />
              </svg>
            </button>

            <button onClick={openExitMenu} aria-label="Power" className="p-1.5 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors flex items-center justify-center w-9 h-9 cursor-pointer">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                <path d="M12 4v8" /><path d="M18.36 6.64a9 9 0 1 1-12.72 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* ---------- Middle Section: Seats (fixed) + Scrollable Content ---------- */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Seats - FIXED (no scroll) */}
          <div className="flex-shrink-0 flex flex-col gap-2 pt-4">
            {renderSeats()}
          </div>

          {/* Messages + Welcome - SCROLLABLE */}
          <div ref={messagesContainerRef} className="mx-1 mt-1 flex-1 overflow-y-auto scrollbar-none">
            {/* Fixed Welcome + Announcement Card */}
            <div className="mx-2 mb-2 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 px-4 py-3">
              <p className="text-white/80 text-[11px] leading-relaxed">
                Welcome to Hurry any content Related to porn, Froud, Violence fake official will be ban
              </p>
              {roomAnnouncement && (
                <div className="flex items-start gap-2 mt-2">
                  <span className="text-white/60 text-[10px] font-medium whitespace-nowrap">ANNOUNCEMENT:</span>
                  <p className="text-white/80 text-[11px] leading-relaxed">{roomAnnouncement}</p>
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="space-y-0.5">
              {messages.map((msg) => (
                <div key={msg.id} className="leading-[1.9rem]">
                  {msg.type === 'join' ? (
                    <div className="flex items-start gap-1.5 px-1">
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                        <img src={msg.senderImage || "/default-avatar.png"} alt={msg.sender} className="w-full h-full object-cover" draggable={false} onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                      </div>
                      <div className="flex flex-col bg-white/8 backdrop-blur-sm rounded-md px-2 py-0.5 border border-white/5">
                        <span className="text-[9px] font-semibold text-white/80 leading-tight">{msg.sender}</span>
                        <span className="text-[8px] text-white/50 leading-tight mt-0.5">Enter the Room</span>
                      </div>
                    </div>
                  ) : msg.imageUrl ? (
                    <div className="flex items-start gap-2" style={{ height: 'calc(4 * 1.9rem)' }}>
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                        <img src={msg.senderImage || "/default-avatar.png"} alt={msg.sender} className="w-full h-full object-cover" draggable={false} onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-semibold text-white/70 leading-tight">{msg.sender}</span>
                        <div onClick={() => setFullImageModal(msg.imageUrl || null)} className="rounded-lg overflow-hidden border border-white/20 cursor-pointer hover:opacity-90 transition-opacity bg-black/40 flex items-center justify-center mt-0.5" style={{ height: 'calc(3.5 * 1.9rem)', width: 'calc(3.5 * 1.9rem)' }}>
                          <img src={msg.imageUrl} alt="Shared image" className="w-full h-full object-cover" draggable={false} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                        <img src={msg.senderImage || "/default-avatar.png"} alt={msg.sender} className="w-full h-full object-cover" draggable={false} onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-semibold text-white/70 leading-tight">{msg.sender}</span>
                        <div className="px-2.5 py-1 rounded-lg bg-white/15 text-white rounded-bl-none mt-0.5">
                          <p className="text-[11px] break-words leading-tight">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* ---------- Footer Controls ---------- */}
        <div className="flex-shrink-0 pt-2">
          {showChatInput && (
            <div ref={inputContainerRef} className="flex items-center gap-0 mb-2 -mx-4 w-screen">
              <div className="flex-1 bg-white flex items-center px-4 py-3 shadow-lg w-full">
                <button onMouseDown={(e) => e.preventDefault()} onClick={handleImageClick} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 cursor-pointer">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-gray-500 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </button>
                <input ref={inputRef} type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} onFocus={handleInputFocus} placeholder="Type a message..." className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 px-3 py-2 text-base outline-none border-none" />
                <button onMouseDown={(e) => e.preventDefault()} onClick={handleSendMessage} disabled={!message.trim()} className="p-1.5 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-blue-500 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button onClick={openChatInput} className="bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-black/60 transition-colors shadow-md shrink-0 cursor-pointer">Say Hi</button>
            <div className="flex items-center gap-2">
              {hasSeat && (
                <button onClick={handleBottomMicToggle} className="bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/20 hover:bg-black/50 transition-colors shrink-0 w-10 h-10 flex items-center justify-center cursor-pointer">
                  {currentUserSeat?.isMuted ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-red-400 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                      <line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(true); }} className="bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/20 hover:bg-black/50 transition-colors shrink-0 w-10 h-10 flex items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowGiftPicker(true); }} aria-label="Gift" className="bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors flex items-center justify-center shrink-0 w-10 h-10 overflow-hidden cursor-pointer">
                <img src="/file_000000008e508208b1353ae33e2abef9.png" alt="Gift" className="w-full h-full object-cover" draggable={false} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMessageSheet(true); }}
                aria-label="Message Box Menu"
                className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors flex items-center justify-center shrink-0 w-10 h-10 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M7 9.5L12 14.5L17 9.5" /></svg>
              </button>
              <button onClick={(e) => e.stopPropagation()} aria-label="Apps Menu" className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors flex items-center justify-center shrink-0 w-10 h-10 cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><rect x="3" y="3" width="7.5" height="7.5" rx="2.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Active Users Sheet ---------- */}
      {showActiveUsers && (
        <div className="absolute inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowActiveUsers(false)} />
          <div
            className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden"
            style={{ height: '30vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-3 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 text-center">Active Users</h2>
            </div>
            {/* Users list */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {roomUsers.length > 0 ? (
                <div className="space-y-2">
                  {roomUsers.map((user) => (
                    <div key={user.accountId} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={user.image || "/default-avatar.png"}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">{user.name}</h4>
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-gray-400">ID: {user.accountId}</p>
                          <button
                            onClick={(e) => handleCopyUserId(user.accountId, e)}
                            className="p-0.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                            title="Copy ID"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-gray-400 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">No active users</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Room Info Sheet ---------- */}
      {showRoomInfo && (
        <div className="absolute inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowRoomInfo(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden" style={{ height: '50vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-2 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-black stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h2 className="text-lg font-bold text-gray-800">Room Information</h2>
            </div>
            <div className="flex border-b border-gray-200 px-6">
              <button onClick={() => setRoomInfoTab('profile')} className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer ${roomInfoTab === 'profile' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}>Profile</button>
              <button onClick={() => setRoomInfoTab('members')} className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer ${roomInfoTab === 'members' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}>Members</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {roomInfoTab === 'profile' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={roomImage} alt="Room" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{roomName || roomOwner.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>ID: {roomOwner.accountId}</span>
                        <button onClick={handleCopyId} className="p-0.5 hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Copy ID">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-gray-500 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                        {copied && <span className="text-green-500 text-xs">Copied!</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Host</span>
                    <p className="text-sm font-medium text-gray-800 mt-1">{roomOwner.name || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Announcement:</span>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{roomAnnouncement || '—'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                      <img src={roomOwner.image || "/default-avatar.png"} alt={roomOwner.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{roomOwner.name}</h4>
                      <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                      </span>
                    </div>
                  </div>
                  {roomFollowers.map(follower => (
                    <div key={follower.accountId} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                        <img src={follower.image || "/default-avatar.png"} alt={follower.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">{follower.name}</h4>
                      </div>
                    </div>
                  ))}
                  {roomFollowers.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No followers yet</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Exit Menu ---------- */}
      {showExitMenu && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40" onClick={closeExitMenu}>
          <div className="flex flex-col items-center gap-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleKeep} className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <span className="text-white font-semibold text-base">Keep</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleExit} className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
              <span className="text-white/70 font-medium text-sm">Exit</span>
            </div>
          </div>
          <button onClick={closeExitMenu} className="absolute bottom-8 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* ---------- Seat Actions Sheet ---------- */}
      {showSeatSheet && selectedSeat !== null && (
        <div className="absolute inset-0 z-30 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={closeBottomSheet} />
          <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-md rounded-t-3xl shadow-2xl px-6 py-4 animate-slide-up max-h-[20vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
              {!isSelectedSeatTakenByOther && !isSelectedSeatMySeat && (
                <button onClick={handleTakeSeat} disabled={selectedSeatData?.isLocked && !selectedSeatData?.isOccupied} className="w-full py-2.5 text-black font-medium text-base hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Take Mic</button>
              )}
              {isSelectedSeatMySeat && <button onClick={handleLeaveSeat} className="w-full py-2.5 text-black font-medium text-base hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">Leave Seat</button>}
              <button onClick={handleToggleLock} className="w-full py-2.5 text-black font-medium text-base hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">{selectedSeatData?.isLocked ? 'Unlock Mic' : 'Lock Mic'}</button>
              <button onClick={handleInvite} className="w-full py-2.5 text-black font-medium text-base hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">Invite</button>
              {isSelectedSeatMySeat && <button onClick={handleToggleMute} className="w-full py-2.5 text-black font-medium text-base hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">{selectedSeatData?.isMuted ? 'Unmute' : 'Mute'}</button>}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Full Image Modal ---------- */}
      {fullImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer" onClick={() => setFullImageModal(null)}>
          <div className="relative max-w-full max-h-full">
            <img src={fullImageModal} alt="Full preview" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <button onClick={() => setFullImageModal(null)} className="absolute -top-10 right-0 text-white bg-white/20 rounded-full p-2 hover:bg-white/40">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white stroke-[2.5]"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ---------- Message Sheet ---------- */}
      {showMessageSheet && (
        <div className="absolute inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowMessageSheet(false)} />
          <div
            className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden"
            style={{ height: '60vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMessageSheet(false)}
              className="absolute top-3 left-3 z-20 p-1.5 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-gray-700 stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="h-full overflow-y-auto">
              <MessagePage />
            </div>
          </div>
        </div>
      )}

      {/* Emoji & Gift Pickers */}
      {showEmojiPicker && <EmojiPicker onClose={() => setShowEmojiPicker(false)} onSelectEmoji={handleEmojiSelect} />}
      {showGiftPicker && <GiftPicker onClose={() => setShowGiftPicker(false)} />}

      <style jsx>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes waveBehind { 0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.9; } 50% { transform: translate(-50%, -50%) scale(1.35); opacity: 0.4; } 100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; } }
        @keyframes voicePulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.08); } }
        .wave-ripple { animation: waveBehind 1.2s ease-out infinite; }
        .wave-ripple-delayed { animation: waveBehind 1.2s ease-out 0.4s infinite; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

// ---------- SeatItem Component ----------
function SeatItem({ seatNumber, seatData, onClick, accountId }: { seatNumber: number; seatData?: Seat; onClick: (e: React.MouseEvent) => void; accountId: string }) {
  const isLocked = seatData?.isLocked ?? false
  const isOccupied = seatData?.isOccupied ?? false
  const isSpeaking = seatData?.isSpeaking ?? false
  const isMuted = seatData?.isMuted ?? false
  const user = seatData?.user

  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
      <div className="relative overflow-visible">
        {isSpeaking && (
          <>
            <div className="absolute rounded-full bg-blue-400 wave-ripple pointer-events-none" style={{ width: '60px', height: '60px', left: '50%', top: '50%', zIndex: 0 }} />
            <div className="absolute rounded-full bg-blue-500 wave-ripple-delayed pointer-events-none" style={{ width: '60px', height: '60px', left: '50%', top: '50%', zIndex: 0 }} />
            <div className="absolute rounded-full pointer-events-none" style={{ width: '64px', height: '64px', left: '50%', top: '50%', zIndex: 0, backgroundColor: 'rgba(59, 130, 246, 0.35)', filter: 'blur(6px)', animation: 'voicePulse 1.2s ease-in-out infinite' }} />
          </>
        )}
        <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0 relative z-10 bg-[rgba(125,143,168,0.32)] backdrop-blur-[12px] border transition-all duration-300 hover:scale-105 pointer-events-auto ${isSpeaking ? 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'border-[rgba(210,220,235,0.55)] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),inset_0_-1px_1.5px_rgba(0,0,0,0.18),inset_0_0_22px_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.28)]'}`}>
          {isLocked ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-full h-full fill-none stroke-[#94a7be] stroke-[2] stroke-linecap-round stroke-linejoin-round"><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /><circle cx="12" cy="16" r="1.2" fill="#94a7be" /></svg>
            </div>
          ) : isOccupied && user ? (
            <>
              <img src={user.image || "/default-avatar.png"} alt={user.name} className="w-full h-full rounded-full object-cover pointer-events-none" draggable={false} onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png" }} />
              {isMuted && (
                <div className={`absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md pointer-events-none ${user.accountId === accountId ? 'bg-gray-400' : 'bg-red-500'}`}>
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-white stroke-[3] stroke-linecap-round stroke-linejoin-round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /></svg>
                </div>
              )}
            </>
          ) : (
            <div className="w-[58%] h-[58%] flex items-center justify-center pointer-events-none relative">
              <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible", display: "block" }}>
                <g fill="none" stroke="#94a7be" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><path d="M 28 44 Q 28 74 50 74 Q 72 74 72 44" /><path d="M 50 74 L 50 86" /><path d="M 38 90 L 62 90" /></g>
                <g fill="#94a7be" stroke="#5a6d89" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" transform="translate(0, 6)"><path d="M 36 18 Q 36 10 50 10 Q 64 10 64 18 L 64 42 Q 64 52 50 52 Q 36 52 36 42 Z" /></g>
              </svg>
              {isMuted && (
                <div className="absolute -right-2 -bottom-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-white stroke-[3] stroke-linecap-round stroke-linejoin-round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /></svg>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] font-medium text-white/80 pointer-events-none">
        {isLocked ? `No ${seatNumber}` : (isOccupied && user ? user.name : `No ${seatNumber}`)}
      </span>
    </div>
  )
}
