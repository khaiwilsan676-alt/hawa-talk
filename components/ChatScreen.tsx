'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Send, ImageIcon, MoreHorizontal } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'me' | 'other'
  timestamp: number
}

interface ChatScreenProps {
  currentUser: {
    uid: string
    name: string
    photo: string
  }
  targetUser: {
    uid: string
    name: string
    photo: string
  }
  onClose: () => void
}

const SIGNALING_SERVER = 'ws://localhost:3001'  // Change to your server's address

export default function ChatScreen({ currentUser, targetUser, onClose }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [connected, setConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // WebRTC refs
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([])

  // Connect to signalling server
  const connectSignaling = useCallback(() => {
    const ws = new WebSocket(SIGNALING_SERVER)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'register', uid: currentUser.uid }))
    }

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      const { type, from } = data

      if (type === 'offer') {
        await handleReceiveOffer(data.sdp)
      } else if (type === 'answer') {
        await handleReceiveAnswer(data.sdp)
      } else if (type === 'ice-candidate') {
        await handleRemoteIceCandidate(data.candidate)
      }
    }

    ws.onclose = () => {
      console.log('Signalling disconnected')
    }

    return ws
  }, [currentUser.uid])

  // Cleanup on unmount
  useEffect(() => {
    const ws = connectSignaling()
    return () => {
      ws.close()
      pcRef.current?.close()
    }
  }, [connectSignaling])

  const addMessage = (text: string, sender: 'me' | 'other') => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      text,
      sender,
      timestamp: Date.now()
    }])
  }

  // Create peer connection and data channel (as caller)
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    pcRef.current = pc

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current?.send(JSON.stringify({
          type: 'ice-candidate',
          from: currentUser.uid,
          to: targetUser.uid,
          candidate: event.candidate
        }))
      }
    }

    pc.ondatachannel = (event) => {
      const channel = event.channel
      setupDataChannel(channel)
    }

    // Create data channel (only if we are the offerer)
    const channel = pc.createDataChannel('chat')
    setupDataChannel(channel)

    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .then(() => {
        wsRef.current?.send(JSON.stringify({
          type: 'offer',
          from: currentUser.uid,
          to: targetUser.uid,
          sdp: pc.localDescription
        }))
      })
      .catch(err => console.error('Error creating offer:', err))

    return pc
  }, [currentUser.uid, targetUser.uid])

  const setupDataChannel = (channel: RTCDataChannel) => {
    dataChannelRef.current = channel

    channel.onopen = () => {
      setConnected(true)
      console.log('Data channel open')
      // Send any pending ice candidates
      while (pendingCandidatesRef.current.length) {
        const candidate = pendingCandidatesRef.current.shift()!
        wsRef.current?.send(JSON.stringify({
          type: 'ice-candidate',
          from: currentUser.uid,
          to: targetUser.uid,
          candidate
        }))
      }
    }

    channel.onmessage = (event) => {
      addMessage(event.data, 'other')
    }

    channel.onclose = () => {
      setConnected(false)
    }
  }

  // Handle receiving an offer
  const handleReceiveOffer = async (sdp: RTCSessionDescriptionInit) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    pcRef.current = pc

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current?.send(JSON.stringify({
          type: 'ice-candidate',
          from: currentUser.uid,
          to: targetUser.uid,
          candidate: event.candidate
        }))
      }
    }

    pc.ondatachannel = (event) => {
      const channel = event.channel
      setupDataChannel(channel)
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    wsRef.current?.send(JSON.stringify({
      type: 'answer',
      from: currentUser.uid,
      to: targetUser.uid,
      sdp: pc.localDescription
    }))
  }

  const handleReceiveAnswer = async (sdp: RTCSessionDescriptionInit) => {
    if (pcRef.current) {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp))
    }
  }

  const handleRemoteIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!pcRef.current?.remoteDescription) {
      // Queue candidate until remote description is set
      pendingCandidatesRef.current.push(candidate)
      return
    }
    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (err) {
      console.error('Error adding received ICE candidate', err)
    }
  }

  // Trigger connection when component mounts (caller initiates)
  useEffect(() => {
    // Small delay to ensure signalling socket is ready
    const timer = setTimeout(() => {
      createPeerConnection()
    }, 1000)
    return () => clearTimeout(timer)
  }, [createPeerConnection])

  const handleSend = () => {
    if (!newMessage.trim() || !dataChannelRef.current) return
    dataChannelRef.current.send(newMessage.trim())
    addMessage(newMessage.trim(), 'me')
    setNewMessage('')

    // Save last message to localStorage (for MessagePage list)
    const chatKey = `chat_${[currentUser.uid, targetUser.uid].sort().join('_')}`
    const existing = localStorage.getItem(chatKey)
    let chatData = existing ? JSON.parse(existing) : { messages: [] }
    chatData.lastMessage = newMessage.trim()
    chatData.lastTimestamp = Date.now()
    chatData.otherUser = {
      uid: targetUser.uid,
      name: targetUser.name,
      photo: targetUser.photo
    }
    localStorage.setItem(chatKey, JSON.stringify(chatData))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div
        className="px-4 pb-3 flex items-center gap-3 sticky top-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        }}
      >
        <button onClick={onClose} className="flex-shrink-0 hover:bg-white/30 rounded-full p-1">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={targetUser.photo || '/default-avatar.png'}
            alt={targetUser.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 truncate">{targetUser.name}</h2>
          <span className={`text-xs ${connected ? 'text-green-500' : 'text-red-400'}`}>
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        <button className="flex-shrink-0 hover:bg-white/30 rounded-full p-1">
          <MoreHorizontal size={24} className="text-gray-800" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-20">
            {connected ? 'No messages yet. Say hello!' : 'Waiting for connection...'}
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender === 'me'
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl break-words ${
                  isMine
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMine ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center gap-2">
        <button className="text-gray-500 hover:text-gray-700">
          <ImageIcon size={24} />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={!connected}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || !connected}
          className="text-blue-500 disabled:text-gray-300 hover:text-blue-600"
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  )
                    }
