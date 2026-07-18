'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

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

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState('Popular')

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-yellow-100 pt-4 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
              📊
            </div>
          </div>
          <div className="flex gap-3 text-sm font-medium text-gray-700">
            <span>Mine</span>
            <span className="font-bold">Popular</span>
          </div>
          <Search size={20} className="text-gray-700" />
        </div>

        {/* Banner Carousel */}
        <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 text-white font-bold text-center">
          <div className="text-2xl mb-1">🎁 Magic Box King</div>
          <div className="text-sm">18/07 - 19/07 23:59</div>
        </div>

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
      <div className="px-4 py-6 grid grid-cols-2 gap-4">
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
      <div className="px-4 pb-24 flex justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🎁</div>
          <div className="font-bold text-yellow-800">Recharge Event</div>
        </div>
      </div>
    </div>
  )
}
