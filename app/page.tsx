'use client'

import { useState } from 'react'
import { Home, MessageCircle, User } from 'lucide-react'
import HomePage from '@/components/HomePage'
import MessagePage from '@/components/MessagePage'
import MePage from '@/components/MePage'

export default function Page() {
  const [activeTab, setActiveTab] = useState<'home' | 'message' | 'me'>('home')

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-50 pb-20">
      {/* Content */}
      <div className="w-full">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'message' && <MessagePage />}
        {activeTab === 'me' && <MePage />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-20">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            activeTab === 'home'
              ? 'text-yellow-500'
              : 'text-gray-500 hover:text-yellow-400'
          }`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          onClick={() => setActiveTab('message')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            activeTab === 'message'
              ? 'text-yellow-500'
              : 'text-gray-500 hover:text-yellow-400'
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs font-medium">Message</span>
        </button>
        <button
          onClick={() => setActiveTab('me')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            activeTab === 'me'
              ? 'text-yellow-500'
              : 'text-gray-500 hover:text-yellow-400'
          }`}
        >
          <User size={24} />
          <span className="text-xs font-medium">Me</span>
        </button>
      </nav>
    </div>
  )
}
