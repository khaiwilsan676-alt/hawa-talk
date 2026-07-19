'use client'

import { ChevronRight } from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  icon: string
  action?: string
  badge?: string
}

const menuItems: MenuItem[] = [
  { id: '1', label: 'Wallet', icon: '👛' },
  { id: '2', label: 'Invite Friends', icon: '💸' },
  { id: '3', label: 'Earn Coins', icon: '🎁', badge: 'bg-blue-300' },
  { id: '4', label: 'Medal', icon: '⭐' },
  { id: '5', label: 'SVIP', icon: '🏆', action: 'Join now' },
  { id: '6', label: 'Level', icon: '👑', badge: 'Lv.0' },
  { id: '7', label: 'CP / Friend', icon: '💖' },
  { id: '8', label: 'Family', icon: '🐻', action: 'Join Now' },
  { id: '9', label: 'Store', icon: '🛒' },
  { id: '10', label: 'My Items', icon: '👕' }
]

export default function MePage({ onLogout }) {
  return (
    <div className="w-full bg-gradient-to-b from-blue-100 to-white min-h-screen">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-blue-400 to-blue-100 px-4 pt-6 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-4xl">
              K
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Khai Wilsan</h2>
              <p className="text-gray-600 text-sm">id:13526731 📋</p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 mt-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-600 mt-1">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-600 mt-1">Following</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-600 mt-1">Visitors</div>
          </div>
        </div>

        {/* Images below stats */}
        <div className="flex gap-4">
          <div className="flex-1">
            <img 
              src="/1784480382765~2.jpg" 
              alt="Feature 1"
              className="w-full h-16 object-cover rounded-xl"
            />
          </div>
          <div className="flex-1">
            <img 
              src="/1784480368941~2.jpg" 
              alt="Feature 2"
              className="w-full h-16 object-cover rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-2 pb-24 mt-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="text-2xl">{item.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{item.label}</p>
            </div>
            {item.action && (
              <span className="text-sm font-medium text-gray-500">{item.action}</span>
            )}
            {item.badge && (
              <span className={`${item.badge} text-xs font-bold px-2 py-1 rounded-full text-gray-900`}>
                {typeof item.badge === 'string' && item.badge.startsWith('Lv') ? item.badge : ''}
              </span>
            )}
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        ))}
      </div>

      {/* Recharge Event */}
      <div className="fixed bottom-24 right-4">
        <div className="text-center text-sm">
          <div className="text-2xl mb-1">🎁</div>
          <div className="text-xs font-bold text-blue-800">Recharge</div>
          <div className="text-xs font-bold text-blue-800">Event</div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4 py-6">
        <button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
