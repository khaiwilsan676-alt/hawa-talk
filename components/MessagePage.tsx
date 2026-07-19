'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function MessagePage() {
  const [activeChat, setActiveChat] = useState(null)

  // toggle a body class so other UI (bottom bars) can be hidden
  useEffect(() => {
    if (typeof document === 'undefined') return

    // When no chat is selected (chat list view) we want to hide the bottom bars.
    // Previously this logic was inverted which prevented the class from being added.
    if (!activeChat) {
      document.body.classList.add('hide-bottom-bars')
    } else {
      document.body.classList.remove('hide-bottom-bars')
    }

    return () => {
      // cleanup in case component unmounts
      document.body.classList.remove('hide-bottom-bars')
    }
  }, [activeChat])

  // Chat data
  const chats = [
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
      <div className="w-full bg-gradient-to-b from-blue-100 to-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-b from-blue-400 to-blue-100 px-4 pt-6 pb-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-3xl font-bold text-gray-800">Message</h1>
          <CheckCircle size={28} className="text-green-500" />
        </div>

        {/* Chat List */}
        <div className="px-4 pt-4 pb-24 flex flex-col gap-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl cursor-pointer active:bg-gray-100 transition-colors"
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
    )
  }

  // Chat detail page
  return (
    <div className="w-full bg-gradient-to-b from-blue-100 to-white min-h-screen">
      {/* Chat Header */}
      <div className="bg-gradient-to-b from-blue-400 to-blue-100 px-4 pt-6 pb-4 sticky top-0 z-10">
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

      {/* Chat Messages Area (Empty for now) */}
      <div className="flex-1 px-4 py-4">
        <p className="text-center text-gray-400 mt-20">No messages yet</p>
      </div>
    </div>
  )
}
