'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Send, ImageIcon, MoreHorizontal } from 'lucide-react'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'

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

// Firebase configuration – replace with your own
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const FIXED_CHAT_UIDS = ['hurry_team_official', 'hurry_system_official']

export default function ChatScreen({ currentUser, targetUser, onClose }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [connected, setConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isFixedChat = FIXED_CHAT_UIDS.includes(targetUser.uid)

  // Compute a unique chat ID (same for both users, regardless of order)
  const chatId = [currentUser.uid, targetUser.uid].sort().join('_')

  // Set up Firestore listener for messages
  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedMessages: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            text: data.text,
            sender: data.senderUid === currentUser.uid ? 'me' : 'other',
            timestamp: data.timestamp?.toMillis?.() ?? Date.now(),
          }
        })
        setMessages(loadedMessages)
        setConnected(true) // listener is active, we are "connected"
      },
      (error) => {
        console.error('Firestore listener error:', error)
        setConnected(false)
      }
    )

    return () => unsubscribe()
  }, [chatId, currentUser.uid])

  const handleSend = async () => {
    if (!newMessage.trim()) return

    const messageText = newMessage.trim()
    setNewMessage('')

    // Add message to Firestore
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      await addDoc(messagesRef, {
        text: messageText,
        senderUid: currentUser.uid,
        timestamp: serverTimestamp(),
      })

      // Update localStorage (optional, for chat list preview)
      const chatKey = `chat_${chatId}`
      const existing = localStorage.getItem(chatKey)
      let chatData = existing ? JSON.parse(existing) : { messages: [] }
      chatData.lastMessage = messageText
      chatData.lastTimestamp = Date.now()
      chatData.otherUser = {
        uid: targetUser.uid,
        name: targetUser.name,
        photo: targetUser.photo,
      }
      localStorage.setItem(chatKey, JSON.stringify(chatData))
    } catch (error) {
      console.error('Error sending message:', error)
      // Optionally restore the input if send fails
      setNewMessage(messageText)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto‑scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

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
          {isFixedChat ? (
            <span className="text-xs text-blue-500 font-medium">Official Account</span>
          ) : (
            <span className={`text-xs ${connected ? 'text-green-500' : 'text-red-400'}`}>
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          )}
        </div>

        <button className="flex-shrink-0 hover:bg-white/30 rounded-full p-1">
          <MoreHorizontal size={24} className="text-gray-800" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-20">
            {isFixedChat
              ? 'No messages from ' + targetUser.name + ' yet'
              : connected
                ? 'No messages yet. Say hello!'
                : 'Waiting for connection...'}
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender === 'me'

          // Fixed chat messages with sender avatar
          if (!isMine && isFixedChat) {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mb-1">
                    <img
                      src={targetUser.photo || '/default-avatar.png'}
                      alt={targetUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 ml-1 mb-0.5">{targetUser.name}</span>
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl break-words bg-white text-gray-800 rounded-bl-md shadow-sm">
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-[10px] mt-1 text-gray-400">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // Normal messages
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
                <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar – only for normal chats */}
      {!isFixedChat && (
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
      )}

      {/* Fixed chat bottom notice */}
      {isFixedChat && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">This is an official account. You cannot reply here.</p>
        </div>
      )}
    </div>
  )
}
