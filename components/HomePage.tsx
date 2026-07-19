'use client'

import { useState } from 'react'

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

export default function HomePage({ onLogout }) {
  const [selectedFilter, setSelectedFilter] = useState('Popular')
  const [activeTab, setActiveTab] = useState<Tab>('popular')
  const [currentPage, setCurrentPage] = useState<Page>('home')

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-100 to-white pb-28">
      {/* Page Content */}
      <div className="w-full">
        {currentPage === 'home' && (
          <div className="w-full bg-white">
            {/* Top 30vh Section */}
            <div 
              className="w-full pt-4 px-4 pb-6" 
              style={{ 
                height: '30vh', 
                background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)' 
              }}
            >
              {/* Top Navigation */}
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

                {/* Center Tabs */}
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
              <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white font-bold text-center shadow-md">
                <div className="text-2xl mb-1">🎁 Magic Box King</div>
                <div className="text-sm">18/07 - 19/07 23:59</div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="px-4 mt-6">
              {/* Category Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-200 rounded-2xl p-4 text-center">
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
                    <div className="absolute top-3 right-3 bg-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
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
                <div className="font-bold text-blue-800">Recharge Event</div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'message' && <MessagePage />}
        {currentPage === 'me' && <MePage />}
      </div>

      {/* Modified Bottom Navigation Bar - Fixed at absolute bottom & Left/Right */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-30">
        <div className="flex justify-around items-center bg-white border-t border-zinc-100 shadow-lg px-3 py-4 w-full">
          
          {/* HOME BUTTON */}
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex flex-col items-center gap-1.5 transition-all active:scale-95"
          >
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <path
                d="M18 2.8C20.2 2.8 30.2 8.2 30.2 12.6V23.2C30.2 27.8 28 31 18 31C8 31 5.8 27.8 5.8 23.2V12.6C5.8 8.2 15.8 2.8 18 2.8Z"
                fill={currentPage === 'home' ? '#3b82f6' : 'white'}
                stroke="#1D1D1F"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="M12.2 14.2C13.3 12.6 14.9 12.1 16.8 13.4"
                stroke="#1D1D1F"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M11.2 20.8C12.5 24.2 21 25.6 24.3 20.2"
                stroke="#1D1D1F"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span className={`text-[14px] ${currentPage === 'home' ? 'font-semibold text-black' : 'text-gray-500'}`}>
              Home
            </span>
          </button>

          {/* MESSAGE BUTTON */}
          <button 
            onClick={() => setCurrentPage('message')}
            className="flex flex-col items-center gap-1.5 transition-all active:scale-95"
          >
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <path
                d="M6 10.5C6 7 8.3 5 12.2 5H23.8C27.7 5 30 7 30 10.5V16.5C30 20 27.7 22 23.8 22H21L17.5 27.2C17 28 15.8 28 15.2 27.2L12.2 22C8.3 22 6 20 6 16.5V10.5Z"
                fill={currentPage === 'message' ? '#3b82f6' : 'white'}
                stroke="#1D1D1F"
                strokeWidth="2.4"
              />
              <path
                d="M12 14.5C13.5 12.5 15.5 14.5 19.5 12.5C21.5 14.5 24 14.5 24 14.5"
                stroke="#1D1D1F"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span className={`text-[14px] ${currentPage === 'message' ? 'font-semibold text-black' : 'text-gray-500'}`}>
              Message
            </span>
          </button>

          {/* ME BUTTON */}
          <button 
            onClick={() => setCurrentPage('me')}
            className="flex flex-col items-center gap-1.5 transition-all active:scale-95"
          >
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <path
                d="M18 4.5C23.5 4.5 28 8.5 27.2 13.8L26.2 19.8C26 21.2 27.2 22.5 28.6 23.1C30.6 24 31 26.2 29 27.5C27.5 28.5 25 28.8 22 28.8H14C11 28.8 8.5 28.5 7 27.5C5 26.2 5.4 24 7.4 23.1C8.8 22.5 10 21.2 9.8 19.8L8.8 13.8C8 8.5 12.5 4.5 18 4.5Z"
                fill={currentPage === 'me' ? '#3b82f6' : 'white'}
                stroke="#1D1D1F"
                strokeWidth="2.4"
              />
              <circle cx="14" cy="15" r="1.6" fill="#1D1D1F" />
              <circle cx="22" cy="15" r="1.6" fill="#1D1D1F" />
            </svg>
            <span className={`text-[14px] ${currentPage === 'me' ? 'font-semibold text-black' : 'text-gray-500'}`}>
              Me
            </span>
          </button>

        </div>
      </div>
    </div>
  )
}

