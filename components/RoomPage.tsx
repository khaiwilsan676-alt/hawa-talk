'use client'

import React, { useState, useEffect, useRef } from 'react'
import EmojiPicker from './Emojipicker'
import GiftPicker from './GiftPicker'
import { db } from "../src/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface RoomPageProps {
  user: {
    id?: string
    uid?: string
    accountId?: string
    name: string
    image: string
  }
  onClose?: () => void
  onBack?: () => void
  onKeepRoom?: (roomData: { name: string; image: string; accountId: string }) => void
}

// Special Accounts Mapping
const SPECIAL_ACCOUNTS: { [key: string]: string } = {
  'HUSxSvQnabgU029dWYt1TUV04hd2': '100002',
  'ADqW31RGBMaosOzy0HiqexKSD7h1': '100003',
  '100002': '100002',
  '100003': '100003'
}

const OFFICIAL_IDS = ['500001', '500002', '500003', '500004', '500005']
const ADMIN_IDS = ['700001', '700002', '700003']

// Seat Interface
interface Seat {
  number: number
  isOccupied: boolean
  user?: {
    name: string
    image: string
    accountId: string
  }
  isMuted?: boolean
}

// Message Interface
interface Message {
  id: string
  text: string
  sender: string
  timestamp: number
}

export default function RoomPage({ user, onClose, onBack, onKeepRoom }: RoomPageProps) {
  const [showExitMenu, setShowExitMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGiftPicker, setShowGiftPicker] = useState(false)
  const [accountId, setAccountId] = useState<string>("Loading...")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Seat Management State
  const [seats, setSeats] = useState<Seat[]>([
    { number: 1, isOccupied: false },
    { number: 2, isOccupied: false },
    { number: 3, isOccupied: false },
    { number: 4, isOccupied: false },
    { number: 5, isOccupied: false },
    { number: 6, isOccupied: false },
    { number: 7, isOccupied: false },
    { number: 8, isOccupied: false },
    { number: 9, isOccupied: false },
  ])

  // Bottom Sheet State
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [showSeatSheet, setShowSeatSheet] = useState(false)

  // Check if user has a seat
  const hasSeat = seats.some(s => s.isOccupied && s.user?.accountId === accountId)

  // Get current user's seat
  const currentUserSeat = seats.find(s => s.isOccupied && s.user?.accountId === accountId)

  useEffect(() => {
    const fetchRoomOwnerID = async () => {
      if (user?.accountId) {
        setAccountId(String(user.accountId))
        return
      }

      const targetUID = user?.id || user?.uid

      if (targetUID) {
        if (OFFICIAL_IDS.includes(targetUID) || ADMIN_IDS.includes(targetUID) || SPECIAL_ACCOUNTS[targetUID]) {
          setAccountId(SPECIAL_ACCOUNTS[targetUID] || targetUID)
          return
        }

        try {
          const userDocRef = doc(db, "users", targetUID)
          const docSnap = await getDoc(userDocRef)

          if (docSnap.exists() && docSnap.data().accountId) {
            setAccountId(String(docSnap.data().accountId))
            return
          }
        } catch (err) {
          console.warn("Firestore fetch error in RoomPage:", err)
        }
      }

      setAccountId(user?.accountId || "100379620")
    }

    fetchRoomOwnerID()
  }, [user])

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle Seat Click
  const handleSeatClick = (seatNumber: number) => {
    setSelectedSeat(seatNumber)
    setShowSeatSheet(true)
  }

  // Take Seat
  const handleTakeSeat = () => {
    if (selectedSeat === null) return
    
    // Check if user already has a seat
    const userAlreadySeated = seats.some(s => s.isOccupied && s.user?.accountId === accountId)
    if (userAlreadySeated) {
      alert("You already have a seat!")
      return
    }

    const updatedSeats = seats.map(seat => {
      if (seat.number === selectedSeat) {
        return {
          ...seat,
          isOccupied: true,
          user: {
            name: user.name,
            image: user.image,
            accountId: accountId
          },
          isMuted: false
        }
      }
      return seat
    })

    setSeats(updatedSeats)
    setShowSeatSheet(false)
    setSelectedSeat(null)
  }

  // Leave Seat
  const handleLeaveSeat = () => {
    if (selectedSeat === null) return

    const updatedSeats = seats.map(seat => {
      if (seat.number === selectedSeat) {
        return {
          number: seat.number,
          isOccupied: false
        }
      }
      return seat
    })

    setSeats(updatedSeats)
    setShowSeatSheet(false)
    setSelectedSeat(null)
  }

  // Mute/Unmute Seat
  const handleToggleMute = () => {
    if (selectedSeat === null) return

    const updatedSeats = seats.map(seat => {
      if (seat.number === selectedSeat) {
        return {
          ...seat,
          isMuted: !seat.isMuted
        }
      }
      return seat
    })

    setSeats(updatedSeats)
  }

  // Mute/Unmute from bottom mic icon
  const handleBottomMicToggle = () => {
    if (!currentUserSeat) return

    const updatedSeats = seats.map(seat => {
      if (seat.number === currentUserSeat.number) {
        return {
          ...seat,
          isMuted: !seat.isMuted
        }
      }
      return seat
    })

    setSeats(updatedSeats)
  }

  // Lock Seat
  const handleToggleLock = () => {
    alert("Seat locked! Only you can unlock it.")
  }

  // Invite User
  const handleInvite = () => {
    alert(`Invite sent to join seat ${selectedSeat}!`)
    setShowSeatSheet(false)
    setSelectedSeat(null)
  }

  // Check if current user owns this seat
  const isCurrentUsersSeat = (seat: Seat) => {
    return seat.isOccupied && seat.user?.accountId === accountId
  }

  // Handle Send Message
  const handleSendMessage = () => {
    if (!message.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: user.name,
      timestamp: Date.now()
    }
    
    setMessages([...messages, newMessage])
    setMessage("")
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleExit = () => {
    setShowExitMenu(false)
    localStorage.removeItem('keptRoom')
    if (onBack) onBack()
    if (onClose) onClose()
  }

  const handleKeep = () => {
    const roomData = {
      name: user.name,
      image: user.image,
      accountId: accountId
    }
    localStorage.setItem('keptRoom', JSON.stringify(roomData))
    setShowExitMenu(false)
    if (onKeepRoom) {
      onKeepRoom(roomData)
    }
    if (onBack) onBack()
  }

  const handleEmojiSelect = (emoji: string) => {
    console.log("Selected Emoji:", emoji)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Background Image */}
      <img 
        src="/1784533036732~2.jpg" 
        alt="Room Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" 
      />
      
      {/* Content Overlay */}
      <div
        className="relative z-10 flex flex-col h-full px-4 pb-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        
        {/* Top Header Section */}
        <div className="flex justify-between items-center text-white flex-shrink-0">
          
          {/* User Details with DP */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/30 flex-shrink-0">
              <img 
                src={user.image} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <h2 className="font-bold text-base">{user.name}</h2>
              <p className="text-xs text-gray-300">ID: {accountId}</p>
            </div>
          </div>

          {/* Top Right Icons */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 h-7">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <circle cx="9" cy="7" r="4" />
                <path d="M 2 20 C 2 15 5 13 9 13 C 13 13 16 15 16 20" />
                <line x1="18" y1="8" x2="21" y2="8" />
                <line x1="18" y1="12" x2="21" y2="12" />
                <line x1="18" y1="16" x2="20" y2="16" />
              </svg>
              <span className="text-white text-xs font-semibold leading-none">1</span>
            </div>

            <button 
              aria-label="Settings"
              className="p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                <polygon points="12 2.5 20.2 7.25 20.2 16.75 12 21.5 3.8 16.75 3.8 7.25" />
                <circle cx="12" cy="12" r="2.8" />
              </svg>
            </button>

            <button 
              aria-label="Share"
              className="p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                <path d="M4 14.5C4.5 10 8 7 14 7V3L21 10.5L14 18V14C9.5 14 6 15.5 4 19.5C4 18 4 16 4 14.5Z" />
              </svg>
            </button>

            <button 
              onClick={() => setShowExitMenu(true)}
              aria-label="Power"
              className="p-1.5 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors flex items-center justify-center w-9 h-9 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                <path d="M12 4v8" />
                <path d="M18.36 6.64a9 9 0 1 1-12.72 0" />
              </svg>
            </button>
          </div>

        </div>

        {/* Room Seats Layout */}
        <div className="flex-1 flex flex-col justify-start gap-3 pt-6">
          <div className="flex justify-center">
            <SeatItem 
              seatNumber={1} 
              seatData={seats[0]} 
              onClick={() => handleSeatClick(1)}
            />
          </div>

          <div className="flex justify-around items-center px-2">
            <SeatItem 
              seatNumber={2} 
              seatData={seats[1]} 
              onClick={() => handleSeatClick(2)}
            />
            <SeatItem 
              seatNumber={3} 
              seatData={seats[2]} 
              onClick={() => handleSeatClick(3)}
            />
            <SeatItem 
              seatNumber={4} 
              seatData={seats[3]} 
              onClick={() => handleSeatClick(4)}
            />
            <SeatItem 
              seatNumber={5} 
              seatData={seats[4]} 
              onClick={() => handleSeatClick(5)}
            />
          </div>

          <div className="flex justify-around items-center px-2">
            <SeatItem 
              seatNumber={6} 
              seatData={seats[5]} 
              onClick={() => handleSeatClick(6)}
            />
            <SeatItem 
              seatNumber={7} 
              seatData={seats[6]} 
              onClick={() => handleSeatClick(7)}
            />
            <SeatItem 
              seatNumber={8} 
              seatData={seats[7]} 
              onClick={() => handleSeatClick(8)}
            />
            <SeatItem 
              seatNumber={9} 
              seatData={seats[8]} 
              onClick={() => handleSeatClick(9)}
            />
          </div>

          {/* Messages Area - Below Seats */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 max-h-[120px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === user.name ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${
                  msg.sender === user.name 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white/20 text-white rounded-bl-none'
                }`}>
                  <p className="text-[10px] font-semibold opacity-70">{msg.sender}</p>
                  <p className="text-xs break-words">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Rules Card Patti */}
          <div className="mx-4 mt-2 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-3">
            <p className="text-white/80 text-xs text-center leading-relaxed">
              Welcome to Hurry. Any Content related to Fraud, Abusing, violence Breaking a Hurry Rules Will be Ban.
            </p>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex-shrink-0 pb-4">
          {/* Message Input - Always Visible */}
          <div className="flex items-center gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-full px-4 py-2.5 text-sm outline-none border border-white/10 focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-blue-500 text-white p-2.5 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Say Hi Button - Left Side */}
            <button 
              className="bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-black/60 transition-colors shadow-md shrink-0 cursor-pointer"
            >
              Say Hi
            </button>

            {/* Icons - Right Side */}
            <div className="flex items-center gap-2">
              {/* ✅ Show Mic and Speaker ONLY if user has a seat */}
              {hasSeat && (
                <>
                  {/* Mic Icon - Click to Mute/Unmute */}
                  <button 
                    onClick={handleBottomMicToggle}
                    className="bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/20 hover:bg-black/50 transition-colors shrink-0 w-10 h-10 flex items-center justify-center cursor-pointer relative"
                  >
                    {currentUserSeat?.isMuted ? (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-red-500 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="4" y1="4" x2="20" y2="20" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    )}
                    {currentUserSeat?.isMuted && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center border-2 border-black">
                        M
                      </span>
                    )}
                  </button>

                  {/* Speaker Icon */}
                  <button 
                    className="bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/20 hover:bg-black/50 transition-colors shrink-0 w-10 h-10 flex items-center justify-center cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </button>
                </>
              )}

              {/* Emoji Picker Button */}
              <button 
                onClick={() => setShowEmojiPicker(true)}
                className="bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/20 hover:bg-black/50 transition-colors shrink-0 w-10 h-10 flex items-center justify-center cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Gift Picker Button */}
              <button 
                onClick={() => setShowGiftPicker(true)}
                aria-label="File"
                className="bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors flex items-center justify-center shrink-0 w-10 h-10 overflow-hidden cursor-pointer"
              >
                <img 
                  src="/file_000000008e508208b1353ae33e2abef9.png" 
                  alt="File"
                  className="w-full h-full object-cover"
                />
              </button>

              <button 
                aria-label="Message Box Menu"
                className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors flex items-center justify-center shrink-0 w-10 h-10 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                  <rect x="4" y="4" width="16" height="16" rx="4" />
                  <path d="M7 9.5L12 14.5L17 9.5" />
                </svg>
              </button>

              <button 
                aria-label="Apps Menu"
                className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors flex items-center justify-center shrink-0 w-10 h-10 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <rect x="3" y="3" width="7.5" height="7.5" rx="2.5" />
                  <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" />
                  <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" />
                  <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Exit Menu Overlay */}
      {showExitMenu && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-8">
            {/* Keep Button - Top */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={handleKeep}
                className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <span className="text-white font-semibold text-base">Keep</span>
            </div>

            {/* Exit Button - Below Keep */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={handleExit}
                className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
              <span className="text-white/70 font-medium text-sm">Exit</span>
            </div>
          </div>

          {/* Cross Close Button */}
          <button 
            onClick={() => setShowExitMenu(false)}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Bottom Sheet for Seat Actions - Only Black Text */}
      {showSeatSheet && selectedSeat !== null && (
        <div className="absolute inset-0 z-30 flex items-end justify-center">
          {/* Backdrop - Click anywhere to close */}
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setShowSeatSheet(false)
              setSelectedSeat(null)
            }}
          />
          
          {/* Sheet Content - Only Black Text Buttons */}
          <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-md rounded-t-3xl shadow-2xl p-6 animate-slide-up">
            {/* Handle Bar */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            
            {/* Action Buttons - Only Black Text */}
            <div className="space-y-3">
              {/* Take Mic */}
              <button
                onClick={handleTakeSeat}
                disabled={seats.find(s => s.number === selectedSeat)?.isOccupied || seats.some(s => s.isOccupied && s.user?.accountId === accountId)}
                className="w-full py-3.5 rounded-xl bg-transparent text-black font-medium text-base hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-gray-200"
              >
                Take Mic
              </button>

              {/* Lock Mic */}
              <button
                onClick={handleToggleLock}
                disabled={!seats.find(s => s.number === selectedSeat)?.isOccupied}
                className="w-full py-3.5 rounded-xl bg-transparent text-black font-medium text-base hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-gray-200"
              >
                Lock Mic
              </button>

              {/* Invite */}
              <button
                onClick={handleInvite}
                className="w-full py-3.5 rounded-xl bg-transparent text-black font-medium text-base hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
              >
                Invite
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={handleToggleMute}
                disabled={!seats.find(s => s.number === selectedSeat)?.isOccupied}
                className="w-full py-3.5 rounded-xl bg-transparent text-black font-medium text-base hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-gray-200"
              >
                {seats.find(s => s.number === selectedSeat)?.isMuted ? 'Unmute' : 'Mute'}
              </button>

              {/* Leave Seat Button (Only show if current user owns the seat) */}
              {seats.find(s => s.number === selectedSeat)?.isOccupied && 
               isCurrentUsersSeat(seats.find(s => s.number === selectedSeat)!) && (
                <button
                  onClick={handleLeaveSeat}
                  className="w-full py-3.5 rounded-xl bg-transparent text-black font-medium text-base hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                >
                  Leave Seat
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <EmojiPicker 
          onClose={() => setShowEmojiPicker(false)}
          onSelectEmoji={handleEmojiSelect}
        />
      )}

      {/* Gift Picker Modal */}
      {showGiftPicker && (
        <GiftPicker 
          onClose={() => setShowGiftPicker(false)}
        />
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

function SeatItem({ 
  seatNumber, 
  seatData, 
  onClick 
}: { 
  seatNumber: number
  seatData: Seat
  onClick: () => void 
}) {
  return (
    <div className="flex flex-col items-center gap-1" onClick={onClick}>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 relative
        bg-[rgba(125,143,168,0.32)]
        border border-[rgba(210,220,235,0.55)]
        backdrop-blur-[12px]
        shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),inset_0_-1px_1.5px_rgba(0,0,0,0.18),inset_0_0_22px_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.28)]
        transition-transform duration-300 hover:scale-105 cursor-pointer"
      >
        {seatData.isOccupied && seatData.user ? (
          <>
            <img 
              src={seatData.user.image} 
              alt={seatData.user.name}
              className="w-full h-full rounded-full object-cover"
            />
            {/* Small Red Mute Icon - Right Side of Seat */}
            {seatData.isMuted && (
              <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="4" y1="4" x2="20" y2="20" />
                </svg>
              </div>
            )}
          </>
        ) : (
          <div className="w-[58%] h-[58%] flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              width="100%"
              height="100%"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: "visible", display: "block" }}
            >
              <g
                fill="none"
                stroke="#94a7be"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M 28 44 Q 28 74 50 74 Q 72 74 72 44" />
                <path d="M 50 74 L 50 86" />
                <path d="M 38 90 L 62 90" />
              </g>

              <g
                fill="#94a7be"
                stroke="#5a6d89"
                strokeWidth="2.8"
                strokeLinejoin="round"
                strokeLinecap="round"
                transform="translate(0, 6)"
              >
                <path d="M 36 18 Q 36 10 50 10 Q 64 10 64 18 L 64 42 Q 64 52 50 52 Q 36 52 36 42 Z" />
              </g>
            </svg>
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-white/80">
        {seatData.isOccupied && seatData.user ? seatData.user.name : `No ${seatNumber}`}
      </span>
    </div>
  )
            }
