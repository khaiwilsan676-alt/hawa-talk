'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'
import ChatScreen from './ChatScreen' // Import ChatScreen

// ======================
// IndexedDB Helper Class
// ======================
class ChatDB {
  private db: IDBDatabase | null = null
  private dbReady: Promise<IDBDatabase>

  constructor() {
    this.dbReady = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') { resolve(null as any); return; }; const request = indexedDB.open('HurryChatDB', 1)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' })
          messagesStore.createIndex('chatId', 'chatId', { unique: false })
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
        if (!db.objectStoreNames.contains('conversations')) {
          const convStore = db.createObjectStore('conversations', { keyPath: 'chatId' })
          convStore.createIndex('lastTimestamp', 'lastTimestamp', { unique: false })
        }
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve(this.db)
      }
      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error)
      }
    })
  }

  async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db
    return this.dbReady
  }

  async getConversations(): Promise<any[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['conversations'], 'readonly')
      const store = transaction.objectStore('conversations')
      const request = store.getAll()
      request.onsuccess = () => {
        const convs = request.result
        convs.sort((a: any, b: any) => b.lastTimestamp - a.lastTimestamp)
        resolve(convs)
      }
      request.onerror = () => reject(request.error)
    })
  }
}

const chatDB = new ChatDB()

// ======================
// Types
// ======================
interface ChatPreview {
  chatId: string
  otherUser: {
    uid: string
    name: string
    photo: string
  }
  lastMessage: string
  lastTimestamp: number
}

interface FixedChat {
  id: string
  name: string
  image: string
  uid: string
  isFixed: boolean
}

interface MessagePageProps {
  onChatOpen?: (open: boolean) => void
}

export default function MessagePage({ onChatOpen }: MessagePageProps) {
  // Fixed chats with UIDs for WebRTC connection
  const [fixedChats] = useState<FixedChat[]>([
    {
      id: 'hawa-team',
      name: 'Hurry Team',
      image: '/logo.png',
      uid: 'hurry_team_official',
      isFixed: true
    },
    {
      id: 'hawa-system',
      name: 'Hurry System',
      image: '/1784465161302~2.jpg',
      uid: 'hurry_system_official',
      isFixed: true
    }
  ])

  // Dynamic conversations from IndexedDB
  const [dynamicChats, setDynamicChats] = useState<ChatPreview[]>([])

  // ======================
  // Chat screen state
  // ======================
  const [activeChat, setActiveChat] = useState<{
    uid: string
    name: string
    photo: string
  } | null>(null)

  // ======================
  // Get current user data
  // ======================
  const getCurrentUserData = () => {
    const uid = typeof window !== 'undefined'
      ? localStorage.getItem('userUID') || localStorage.getItem('userPhone') || 'N/A'
      : 'N/A'
    const name = typeof window !== 'undefined'
      ? localStorage.getItem('userName') || 'Me'
      : 'Me'
    const photo = typeof window !== 'undefined'
      ? localStorage.getItem('userPhoto') || ''
      : ''
    return { uid, name, photo }
  }

  // ======================
  // Load dynamic conversations from IndexedDB
  // ======================
  const loadChats = async () => {
    try {
      const conversations = await chatDB.getConversations()
      const chatPreviews: ChatPreview[] = conversations
        .filter((conv: any) => conv.otherUser)
        .map((conv: any) => ({
          chatId: conv.chatId,
          otherUser: conv.otherUser,
          lastMessage: conv.lastMessage || '',
          lastTimestamp: conv.lastTimestamp || Date.now()
        }))
      setDynamicChats(chatPreviews)
    } catch (err) {
      console.error('Error loading conversations:', err)
    }
  }

  // Load on mount and refresh every 2 seconds
  useEffect(() => {
    loadChats()
    const interval = setInterval(loadChats, 2000)
    return () => clearInterval(interval)
  }, [])

  // ======================
  // Format relative time
  // ======================
  const formatTime = (timestamp: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    return date.toLocaleDateString()
  }

  // ======================
  // Handle opening fixed chat (Hurry Team / Hurry System)
  // ======================
  const handleOpenFixedChat = (chat: FixedChat) => {
    setActiveChat({
      uid: chat.uid,
      name: chat.name,
      photo: chat.image
    })
  }

  // ======================
  // Handle opening dynamic chat
  // ======================
  const handleOpenDynamicChat = (chat: ChatPreview) => {
    setActiveChat({
      uid: chat.otherUser.uid,
      name: chat.otherUser.name,
      photo: chat.otherUser.photo
    })
  }

  // ======================
  // Close chat screen
  // ======================
  const handleCloseChat = () => {
    setActiveChat(null)
    loadChats() // Refresh conversation list
  }

  // Notify parent about active chat
  useEffect(() => {
    if (onChatOpen) {
      onChatOpen(!!activeChat)
    }
  }, [activeChat, onChatOpen])

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header — HomePage jaisa gradient */}
      <div
        className="px-4 pb-4 flex items-center justify-between sticky top-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)'
        }}
      >
        <h1 className="text-3xl font-bold text-gray-800">Message</h1>
        <CheckCircle size={28} className="text-green-500" />
      </div>

      {/* Chat List — white background */}
      <div className="px-4 pt-4 pb-24 flex flex-col gap-2">
        
        {/* ====================== */}
        {/* FIXED CHATS — Hamesha top pe */}
        {/* ====================== */}
        {fixedChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleOpenFixedChat(chat)}
            className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl cursor-pointer active:bg-gray-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src={chat.image}
                alt={chat.name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm">{chat.name}</h3>
            </div>
          </div>
        ))}

        {/* ====================== */}
        {/* DYNAMIC CHATS — Directly below fixed chats */}
        {/* ====================== */}
        {dynamicChats.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => handleOpenDynamicChat(chat)}
            className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl cursor-pointer active:bg-gray-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src={chat.otherUser.photo || '/default-avatar.png'}
                alt={chat.otherUser.name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm">{chat.otherUser.name}</h3>
              <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
            <span className="text-[10px] text-gray-400">{formatTime(chat.lastTimestamp)}</span>
          </div>
        ))}

      </div>

      {/* ====================== */}
      {/* CHAT SCREEN OVERLAY */}
      {/* ====================== */}
      {activeChat && (
        <ChatScreen
          currentUser={getCurrentUserData()}
          targetUser={activeChat}
          onClose={handleCloseChat}
        />
      )}
    </div>
  )
}
