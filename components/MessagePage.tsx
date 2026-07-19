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
      image: '/logo.png',
      lastMessage: 'Welcome to Hawa Team! 👋',
      time: '10:30 AM',
      unread: 2,
      online: true
    },
    {
      id: 'hawa-system',
      name: 'Hawa System',
      image: '/1784465161302~2.jpg',
      lastMessage: 'System update completed',
      time: 'Yesterday',
      unread: 0,
      online: false
    }
  ]

  // If no chat is selected, show chat list
  if (!activeChat) {
    return (
      <div className="w-full bg-gradient-to-b from-blue-100 to-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-b from-blue-400 to-blue-100 px-4 pt-6 pb-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Message</h1>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/30 rounded-full transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M11 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H17C18.1046 20 19 19.1046 19 18V13" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <CheckCircle size={28} className="text-green-500" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-sm border border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="2"/>
              <path d="M20 20L16.5 16.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="px-4 pt-2 pb-24 flex flex-col gap-1">
          {chats.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-3 py-3 cursor-pointer active:bg-gray-100 transition-all hover:shadow-md rounded-xl border border-gray-100"
            >
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <Image 
                    src={chat.image} 
                    alt={chat.name} 
                    width={48} 
                    height={48} 
                    className="object-cover w-full h-full"
                  />
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Chat info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty state if no chats */}
          {chats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-gray-300 mb-4">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-gray-400 text-lg">No messages yet</p>
              <p className="text-gray-300 text-sm mt-1">Start a conversation!</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Chat detail page
  return (
    <div className="w-full bg-gradient-to-b from-blue-100 to-white min-h-screen flex flex-col">
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
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image 
              src={activeChat.image} 
              alt={activeChat.name} 
              width={40} 
              height={40} 
              className="object-cover w-full h-full"
            />
          </div>

          {/* Chat Name & Status */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800">{activeChat.name}</h2>
            {activeChat.online && (
              <p className="text-xs text-green-600 font-medium">Online</p>
            )}
          </div>

          {/* More options */}
          <button className="p-2 hover:bg-white/30 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="2" fill="#1D1D1F"/>
              <circle cx="12" cy="12" r="2" fill="#1D1D1F"/>
              <circle cx="12" cy="19" r="2" fill="#1D1D1F"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 max-w-sm w-full">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mx-auto mb-4">
              <Image 
                src={activeChat.image} 
                alt={activeChat.name} 
                width={80} 
                height={80} 
                className="object-cover w-full h-full"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{activeChat.name}</h3>
            <p className="text-gray-400 text-center text-sm mb-6">
              Start a conversation with {activeChat.name}
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Send your first message!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200 sticky bottom-0">
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3">
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
          <button className="text-blue-500 hover:text-blue-600 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
      }
