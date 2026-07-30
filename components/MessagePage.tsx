'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

// 1. Types define kar diye hain taaki Vercel par error na aaye
interface ChatItem {
  id: string
  name: string
  image: string
}

interface MessagePageProps {
  onChatOpen?: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void)
}

export default function MessagePage({ onChatOpen }: MessagePageProps) {
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null)

  // toggle a body class so other UI (bottom bars) can be hidden
  useEffect(() => {
    if (typeof document === 'undefined') return

    // When activeChat changes, inform parent if needed
    if (onChatOpen) {
      onChatOpen(!!activeChat)
    }

    if (!activeChat) {
      document.body.classList.add('hide-bottom-bars')
    } else {
      document.body.classList.remove('hide-bottom-bars')
    }

    return () => {
      document.body.classList.remove('hide-bottom-bars')
    }
  }, [activeChat, onChatOpen])

  // Chat data
  const chats: ChatItem[] = [
    {
      id: 'hawa-team',
      name: 'Hawa Team',
      image: '/logo.png'
    },
    {
      id: 'hawa-system',
      name: 'Hawa System',
      image: '/1784465161302~2.jpg'
    }
  ]

  // If no chat is selected, show chat list
  if (!activeChat) {
    return (
      <div className="w-full min-h-screen bg-white">
        {/* Top 30vh: Blue gradient header area */}
        <div className="w-full h-[30vh] bg-gradient-to-b from-blue-500 via-blue-400 to-blue-100">
          {/* Header */}
          <div
            className="px-4 pb-4 flex items-center justify-between"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}
          >
            <h1 className="text-3xl font-bold text-gray-800">Message</h1>
            <CheckCircle size={28} className="text-green-500" />
          </div>
        </div>

        {/* Bottom 70vh: White sheet with chat list */}
        <div className="w-full min-h-[70vh] bg-white -mt-6 rounded-t-3xl px-4 pt-6 pb-24">
          <div className="flex flex-col gap-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
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
          </div>
        </div>
      </div>
    )
  }

  // Chat detail page
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Top 30vh: Blue gradient header area */}
      <div className="w-full h-[30vh] bg-gradient-to-b from-blue-500 via-blue-400 to-blue-100">
        {/* Chat Header */}
        <div
          className="px-4 pb-4"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}
        >
          <div className="flex items-center gap-3">
            {/* Back Arrow */}
            <button 
              onClick={() => setActiveChat(null)}
              className="flex-shrink-0 hover:bg-white/30 rounded-full p-1 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-800" />
            </button>

            {/* Chat Image */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image 
                src={activeChat.image} 
                alt={activeChat.name} 
                width={40} 
                height={40} 
                className="object-cover"
              />
            </div>

            {/* Chat Name */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-800">{activeChat.name}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 70vh: White sheet */}
      <div className="w-full min-h-[70vh] bg-white -mt-6 rounded-t-3xl px-4 pt-6">
        <p className="text-center text-gray-400 mt-20">No messages yet</p>
      </div>
    </div>
  )
      }
