'use client'

import { ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface MenuItem {
  id: string
  label: string
  icon: string
  action?: string
  badge?: string
}

const menuItems: MenuItem[] = [
  { 
    id: '1', 
    label: 'Invite Friends', 
    icon: '/1784537179259.png' 
  },
  { 
    id: '2', 
    label: 'Medal', 
    icon: '/IMG_20260720_142417.png' 
  },
  { 
    id: '3', 
    label: 'Level', 
    icon: '/IMG_20260720_142443.png',
    badge: 'Lv.0' 
  },
  { 
    id: '4', 
    label: 'Family', 
    icon: '/IMG_20260720_142354.png',
    action: 'Join Now' 
  },
  { 
    id: '5', 
    label: 'Store', 
    icon: '/IMG_20260720_142332.png' 
  },
  { 
    id: '6', 
    label: 'Bag', 
    icon: '/IMG_20260720_142227.png' 
  }
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
            <Image 
              src="/1784480382765~2.jpg" 
              alt="Feature 1"
              width={200}
              height={56}
              className="w-full h-14 object-cover"
              priority={false}
            />
          </div>
          <div className="flex-1 rounded-lg overflow-hidden">
            <Image 
              src="/1784480368941~2.jpg" 
              alt="Feature 2"
              width={200}
              height={56}
              className="w-full h-14 object-cover"
              priority={false}
            />
          </div>
        </div>
      </div>

      {/* Menu Items - white patti ke upar icon, phir name */}
      <div className="px-4 pb-24 mt-4">
        <div className="bg-white rounded-xl overflow-hidden">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {/* White patti background mein icon */}
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200 relative">
                {/* White patti strip */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-white rounded-t-lg z-10"></div>
                {/* Icon white patti ke upar */}
                <div className="relative z-20">
                  <Image 
                    src={item.icon} 
                    alt={item.label}
                    width={15}
                    height={15}
                    className="w-4 h-4 object-contain"
                    priority={false}
                  />
                </div>
              </div>
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
