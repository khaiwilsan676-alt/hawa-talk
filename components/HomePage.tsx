'use client'

import { useState } from 'react'
import { Home, MessageCircle, User } from 'lucide-react'
import MessagePage from './MessagePage'
import MePage from './MePage'

interface UserCard {
  id: string
  name: string
  country: string
  score: number
  image: string
}

const userCards: UserCard[] = [
  {
    id: '1',
    name: 'JIYA',
    country: '🇮🇳',
    score: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop'
  },
  {
    id: '2',
    name: 'Ginni',
    country: '🇮🇳',
    score: 4,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'
  },
  {
    id: '3',
    name: 'new_user',
    country: '🇮🇳',
    score: 7,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop'
  },
  {
    id: '4',
    name: 'User123',
    country: '🇮🇳',
    score: 3,
    image: 'https://images.unsplash.com/photo-1516726817505-f5cc8ad323ad?w=400&h=500&fit=crop'
  }
]

type Tab = 'mine' | 'popular'
type Page = 'home' | 'message' | 'me'

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState('Popular')
  const [activeTab, setActiveTab] = useState<Tab>('popular')
  const [currentPage, setCurrentPage] = useState<Page>('home')

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-50 pb-24">
      {/* Page Content */}
      <div className="w-full">
        {currentPage === 'home' && (
          <div className="w-full bg-white">
            {/* Top 30vh Section - Blue mixing into White with Merged Custom Header */}
            <div 
              className="w-full pt-4 px-4 pb-6" 
              style={{ 
                height: '30vh', 
                background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)' 
              }}
            >
              {/* Merged Second Program Top Navigation (Custom SVGs) */}
              <div className="w-full flex justify-between items-center py-2 box-border mb-6">
                {/* Left Icon - House Chart */}
                <button
                  type="button"
                  onClick={() => console.log('Home clicked')}
                  className="flex items-center justify-center cursor-pointer"
                  aria-label="Home"
                >
                  <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M16 3.5 C 14.5 3.5, 3 8, 3 13.5 L 3 21.5 C 3 25.5, 6 28.5, 10.5 28.5 H 21.5 C 26 28.5, 29 25.5, 29 21.5 L 29 13.5 C 29 8, 17.5 3.5, 16 3.5 Z"
                      stroke="#2D2D2D"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect x="9" y="14.5" width="3.5" height="6" rx="1.5" fill="#2D2D2D" />
                    <rect x="14.2" y="11.5" width="3.5" height="9" rx="1.5" fill="#2D2D2D" />
                    <rect x="19.5" y="14" width="3.5" height="6.5" rx="1.5" fill="#2D2D2D" />
                  </svg>
                </button>

                {/* Center Tabs - Mine / Popular */}
                <div className="flex items-center gap-9">
                  <button
                    type="button"
                    onClick={() => setActiveTab('mine')}
                    className={`font-['Inter'] tracking-[0.2px] transition-colors relative ${
                      activeTab === 'mine'
                        ? 'font-bold text-[#1E1E1E]'
                        : 'font-medium text-[#6E6E6E]'
                    }`}
                  >
                    Mine
                    {activeTab === 'mine' && (
                      <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-1.5 h-1.5 bg-[#1E1E1E] rounded-full block" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('popular')}
                    className={`font-['Inter'] tracking-[0.2px] transition-colors relative ${
                      activeTab === 'popular'
                        ? 'font-bold text-[#1E1E1E]'
                        : 'font-medium text-[#6E6E6E]'
                    }`}
                  >
                    Popular
                    {activeTab === 'popular' && (
                      <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-1.5 h-1.5 bg-[#1E1E1E] rounded-full block" />
                    )}
                  </button>
                </div>

                {/* Right Icon - Search */}
                <button
                  type="button"
                  onClick={() => console.log('Search clicked')}
                  className="flex items-center justify-center cursor-pointer"
                  aria-label="Search"
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="12.5" cy="12.5" r="7" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.2 18.2 L24 24" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Banner Carousel */}
              <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 text-white font-bold text-center shadow-md">
                <div className="text-2xl mb-1">🎁 Magic Box King</div>
                <div className="text-sm">18/07 - 19/07 23:59</div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="px-4 mt-6">
              {/* Category Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-yellow-300 rounded-2xl p-4 text-center">
                  <div className="text-xl mb-2">👥</div>
                  <div className="text-sm font-semibold">Ranking</div>
                </div>
                <div className="bg-pink-300 rounded-2xl p-4 text-center">
                  <div className="text-xl mb-2">👑</div>
                  <div className="text-sm font-semibold">CP</div>
                </div>
                <div className="bg-cyan-300 rounded-2xl p-4 text-center">
                  <div className="text-xl mb-2">👨‍👩‍👧</div>
                  <div className="text-sm font-semibold">Family</div>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['Popular', 'Game', 'Video/Music'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      selectedFilter === filter
                        ? 'bg-cyan-400 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {filter === 'Popular' ? '🔥 Popular' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* User Cards Grid */}
            <div className="px-4 py-2 grid grid-cols-2 gap-4">
              {userCards.map((user) => (
                <div
                  key={user.id}
                  className="relative bg-gray-300 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{user.country}</span>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">{user.name}</div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                      {user.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recharge Event Banner */}
            <div className="px-4 pb-28 pt-6 flex justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎁</div>
                <div className="font-bold text-yellow-800">Recharge Event</div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'message' && <MessagePage />}
        {currentPage === 'me' && <MePage />}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-20 z-30">
        <button
          onClick={() => setCurrentPage('home')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            currentPage === 'home'
              ? 'text-yellow-500'
              : 'text-gray-500 hover:text-yellow-400'
          }`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          onClick={() => setCurrentPage('message')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            currentPage === 'message'
              ? 'text-yellow-500'
              : 'text-gray-500 hover:text-yellow-400'
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs font-medium">Message</span>
        </button>
        <button
          onClick={() => setCurrentPage('me')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            currentPage === 'me'
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
