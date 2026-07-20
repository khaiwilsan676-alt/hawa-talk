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
  { id: '1', label: 'Invite Friends', icon: '/IMG_20260720_142310.png' },
  { id: '2', label: 'Medal', icon: '/IMG_20260720_142417.png' },
  { id: '3', label: 'Level', icon: '/IMG_20260720_142443.png' },
  { id: '4', label: 'Family', icon: '/IMG_20260720_142354.png' },
  { id: '5', label: 'Store', icon: '/IMG_20260720_142332.png' },
  { id: '6', label: 'Bag', icon: '/IMG_20260720_142227.png' }
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

        {/* Images with rounded corners - thore niche */}
        <div className="flex gap-1 mt-8">
          <div className="flex-1 rounded-lg overflow-hidden">
            <img 
              src="/1784480382765~2.jpg" 
              alt="Feature 1"
              className="w-full h-14 object-cover"
            />
          </div>
          <div className="flex-1 rounded-lg overflow-hidden">
            <img 
              src="/1784480368941~2.jpg" 
              alt="Feature 2"
              className="w-full h-14 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Menu Items - bina gap ke joined pattiya */}
      <div className="px-4 pb-24 mt-4">
        <div className="bg-white rounded-xl overflow-hidden">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <img src={item.icon} alt={item.label} className="w-6 h-6 object-contain" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.label}</p>
              </div>
              {item.action && (
                <span className="text-sm font-medium text-gray-500">{item.action}</span>
              )}
              {item.badge && (
                <span className="bg-blue-300 text-xs font-bold px-2 py-1 rounded-full text-gray-900">
                  {item.badge}
                </span>
              )}
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          ))}
        </div>
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
