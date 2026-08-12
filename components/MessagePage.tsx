'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'

// ======================
// IndexedDB Helper Class
// ======================
class ChatDB {
  private db: IDBDatabase | null = null
  private dbReady: Promise<IDBDatabase>

  constructor() {
    this.dbReady = new Promise((resolve, reject) => {
      const request = indexedDB.open('HurryChatDB', 1)

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
// Permanent Default Chats
// ======================
const DEFAULT_CHATS = [
  {
    id: 'hawa-team',
    name: 'Hurry Team',
    image: '/logo.png',
    uid: 'hurry_team_official',
    isDefault: true,
    lastMessage: 'Welcome to Hurry! How can we help you?',
    lastTimestamp: Date.now(),
    subtitle: 'Official Support'
  },
  {
    id: 'hawa-system',
    name: 'Hurry System',
    image: '/1784465161302~2.jpg',
    uid: 'hurry_system_bot',
    isDefault: true,
    lastMessage: 'System notification: All systems running smoothly',
    lastTimestamp: Date.now() - 3600000, // 1 hour ago
    subtitle: 'System Notifications'
  }
]

// ======================
// Interfaces
// ======================
interface ChatItem {
  id: string
  uid: string
  name: string
  image: string
  lastMessage: string
  lastTimestamp: number
  subtitle?: string
  isDefault?: boolean
  isOnline?: boolean
}

interface MessagePageProps {
  onChatOpen?: (open: boolean) => void
  setActiveChat?: (chat: ChatItem | null) => void
}

export default function MessagePage({ onChatOpen, setActiveChat }: MessagePageProps) {
  const [chats, setChats] = useState<ChatItem[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  // ======================
  // Load all chats: Default + IndexedDB
  // ======================
  const loadAllChats = async () => {
    try {
      // Get user conversations from IndexedDB
      const conversations = await chatDB.getConversations()
      
      const dynamicChats: ChatItem[] = conversations
        .filter((conv: any) => conv.otherUser && conv.lastMessage)
        .map((conv: any) => ({
          id: conv.chatId,
          uid: conv.otherUser.uid || '',
          name: conv.otherUser.name || 'Unknown User',
          image: conv.otherUser.photo || '/default-avatar.png',
          lastMessage: conv.lastMessage || '',
          lastTimestamp: conv.lastTimestamp || Date.now(),
          isDefault: false,
          subtitle: ''
        }))

      // Combine: Default chats first, then dynamic chats
      const allChats = [...DEFAULT_CHATS, ...dynamicChats]
      
      // Remove duplicates (if user chatted with Hurry Team/System)
      const uniqueChats = allChats.filter((chat, index, self) =>
        index === self.findIndex((c) => c.id === chat.id)
      )

      setChats(uniqueChats)
    } catch (err) {
      console.error('Error loading chats:', err)
      // If IndexedDB fails, at least show default chats
      setChats(DEFAULT_CHATS)
    }
  }

  // ======================
  // Load on mount + periodic refresh
  // ======================
  useEffect(() => {
    loadAllChats()
    
    // Refresh every 2 seconds for real-time updates
    const interval = setInterval(loadAllChats, 2000)
    
    // Listen for IndexedDB changes from other tabs/components
    const handleStorageChange = () => {
      loadAllChats()
    }
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // ======================
  // Format relative time
  // ======================
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        if (minutes === 0) return 'Just now'
        return `${minutes}m ago`
      }
      return `${hours}h ago`
    }
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  // ======================
  // Get last message preview
  // ======================
  const getLastMessagePreview = (message: string, maxLength: number = 35) => {
    if (!message) return ''
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  // ======================
  // Handle chat open
  // ======================
  const handleOpenChat = (chat: ChatItem) => {
    setActiveChatId(chat.id)
    
    if (setActiveChat) {
      setActiveChat(chat)
    }
    
    // Notify parent
    if (onChatOpen) {
      onChatOpen(true)
    }
    
    // For default chats, show info message
    if (chat.isDefault) {
      console.log(`Opening default chat: ${chat.name}`)
      // Yahan aage chalke tum proper chat screen bhi open kar sakte ho
    }
  }

  // ======================
  // Get online status indicator
  // ======================
  const getOnlineStatus = (chat: ChatItem) => {
    if (chat.id === 'hawa-team') return true  // Always online
    if (chat.id === 'hawa-system') return true // Always online
    return chat.isOnline || false
  }

  // ======================
  // Notify parent about active chat
  // ======================
  useEffect(() => {
    if (onChatOpen) {
      onChatOpen(!!activeChatId)
    }
  }, [activeChatId, onChatOpen])

  return (
    <div className="w-full min-h-screen bg-white">
      {/* ====================== */}
      {/* Header with Gradient */}
      {/* ====================== */}
      <div
        className="px-4 pb-4 flex items-center justify-between sticky top-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        }}
      >
        <h1 className="text-3xl font-bold text-gray-800">Message</h1>
        <CheckCircle size={28} className="text-green-500" />
      </div>

      {/* ====================== */}
      {/* Chat List */}
      {/* ====================== */}
      <div className="px-4 pt-4 pb-24 flex flex-col gap-2">
        {chats.length === 0 && (
          <div className="text-center mt-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-300 mt-1">Start a conversation from a profile</p>
          </div>
        )}

        {chats.map((chat) => {
          const isOnline = getOnlineStatus(chat)
          
          return (
            <div
              key={chat.id}
              onClick={() => handleOpenChat(chat)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                activeChatId === chat.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-200'
              }`}
            >
              {/* Avatar with Online Indicator */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm">
                  <Image
                    src={chat.image}
                    alt={chat.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                {/* Online Dot */}
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                )}
                
                {/* Default Badge */}
                {chat.isDefault && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">
                    {chat.name}
                  </h3>
                  
                  {/* Official Badge */}
                  {chat.isDefault && (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                      Official
                    </span>
                  )}
                  
                  {/* Online Badge */}
                  {isOnline && !chat.isDefault && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                  )}
                </div>
                
                {/* Last Message */}
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {getLastMessagePreview(chat.lastMessage)}
                </p>
                
                {/* Subtitle for Default Chats */}
                {chat.subtitle && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {chat.subtitle}
                  </p>
                )}
              </div>

              {/* Time & Unread */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {formatTime(chat.lastTimestamp)}
                </span>
                
                {/* Unread Badge (for future use) */}
                {!chat.isDefault && activeChatId !== chat.id && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 hidden"></span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ====================== */}
      {/* Empty State Overlay (if needed) */}
      {/* ====================== */}
      {chats.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-[10px] text-gray-300 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
            Pull down to refresh
          </p>
        </div>
      )}
    </div>
  )
      }
