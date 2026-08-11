'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'

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

interface MessagePageProps {
  onChatOpen?: (open: boolean) => void
}

export default function MessagePage({ onChatOpen }: MessagePageProps) {
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  // ======================
  // loadChats – reads all conversation previews from localStorage
  // ======================
  const loadChats = () => {
    const chats: ChatPreview[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('chat_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          if (data.otherUser && data.lastMessage) {
            chats.push({
              chatId: key.replace('chat_', ''),
              otherUser: data.otherUser,
              lastMessage: data.lastMessage,
              lastTimestamp: data.lastTimestamp || Date.now(),
            })
          }
        } catch (e) {}
      }
    }
    // Sort by most recent first
    chats.sort((a, b) => b.lastTimestamp - a.lastTimestamp)
    setChats(chats)
  }

  // ======================
  // formatTime – relative time formatting
  // ======================
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    return date.toLocaleDateString()
  }

  // ======================
  // handleOpenChat – called when a chat row is tapped
  // ======================
  const handleOpenChat = (chatId: string) => {
    setActiveChatId(chatId)
    // You can later expand this to open a full ChatScreen using the otherUser data
    // For example, navigate or show a modal.
    console.log('Open chat with id:', chatId)
  }

  // ======================
  // Effect: load chats on mount and listen to storage changes
  // ======================
  useEffect(() => {
    loadChats()
    window.addEventListener('storage', loadChats)
    return () => window.removeEventListener('storage', loadChats)
  }, [])

  // ======================
  // Notify parent about active chat (optional)
  // ======================
  useEffect(() => {
    if (onChatOpen) {
      onChatOpen(!!activeChatId)
    }
  }, [activeChatId, onChatOpen])

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header – same gradient as before */}
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

      {/* Dynamic Chat List */}
      <div className="px-4 pt-4 pb-24 flex flex-col gap-2">
        {chats.length === 0 && (
          <p className="text-center text-gray-400 mt-10">No conversations yet</p>
        )}
        {chats.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => handleOpenChat(chat.chatId)}
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
    </div>
  )
}
