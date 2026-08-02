'use client'

import React, { useEffect, useState } from 'react'
import { ChevronRight, Copy } from 'lucide-react'
import SettingPage from './settingpage'
import PublicProfile from './PublicProfile'
import HawaSupport from './HawaSupport'

interface MenuItem {
  id: string
  label: string
  src?: string
  icon?: React.ReactNode
  action?: string
  badge?: string
}

interface MePageProps {
  onLogout?: () => void
  onPublicProfileChange?: (isOpen: boolean) => void
}

const menuItems: MenuItem[] = [
  { id: '1', label: 'Invite Friends', src: '/1784562849790.png' },
  { id: '2', label: 'Family', src: '/IMG_20260720_142354.png' },
  { id: '3', label: 'Level', src: '/IMG_20260720_211413.png' },
  { id: '4', label: 'Medal', src: '/1784621763019.png' },
  { id: '5', label: 'Store', src: '/IMG_20260720_142332.png' },
  { id: '6', label: 'Bag', src: '/IMG_20260720_142227.png' }
]

const bottomMenuItems: MenuItem[] = [
  {
    id: '7',
    label: 'Language',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"></path>
      </svg>
    )
  },
  {
    id: '8',
    label: 'Settings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4.67v9.33L12 22l-8-4.67V6.67L12 2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  },
  {
    id: '9',
    label: 'Customer Service',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.5 11 V8.5 C5.5 5 8.2 3 12 3 C15.8 3 18.5 5 18.5 8.5 V15.2 C18.5 18.5 16.2 21 12 21"/>
        <path d="M3 10.2 V13.8 C3 14.6 3.5 15.2 4.2 15.2 H5.5 V9 H4.2 C3.5 9 3 9.5 3 10.2 Z"/>
        <path d="M18.5 9 V15.2 H19.8 C20.5 15.2 21 14.6 21 13.8 V10.2 C21 9.4 20.5 9 19.8 9 H18.5"/>
        <path d="M9.2 13.8 C9.2 15 10.3 16 12 16 C13.7 16 14.8 15 14.8 13.8"/>
      </svg>
    )
  },
  {
    id: '10',
    label: 'Help & Feedback',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )
  }
]

// Official/Admin IDs list
const OFFICIAL_IDS = ['500001', '500002', '500003', '500004', '500005']
const ADMIN_IDS = ['700001', '700002', '700003']

export const getOrCreateAccountNumber = (uid: string) => {
  if (!uid || uid === 'N/A') return { fullAccNum: 'N/A', displayAccNum: 'N/A' }

  // Check if it's an official or admin ID
  if (OFFICIAL_IDS.includes(uid) || ADMIN_IDS.includes(uid)) {
    return { fullAccNum: uid, displayAccNum: uid }
  }

  // Special UIDs for specific users
  if (uid === 'HUSxSvQnabgU029dWYt1TUV04hd2') return { fullAccNum: '100002', displayAccNum: '100002' }
  if (uid === 'ADqW31RGBMaosOzy0HiqexKSD7h1') return { fullAccNum: '100003', displayAccNum: '100003' }

  // For regular users, generate random account number
  const storageKey = `user_account_number_${uid}`
  let savedAccountNumber = localStorage.getItem(storageKey)

  if (!savedAccountNumber) {
    const targetLength = uid.length
    let numericStr = ''

    for (let i = 0; i < targetLength; i++) {
      numericStr += Math.floor(Math.random() * 10).toString()
    }

    savedAccountNumber = numericStr
    localStorage.setItem(storageKey, savedAccountNumber)
  }

  return { fullAccNum: savedAccountNumber, displayAccNum: savedAccountNumber.slice(0, 8) }
}

export default function MePage({ onLogout, onPublicProfileChange }: MePageProps) {
  const [currentView, setCurrentView] = useState<'me' | 'settings' | 'public_profile' | 'customer_service'>('me')
  const [user, setUser] = useState({
    name: "Guest",
    uid: "",
    accountNumber: "",
    displayAccountNumber: "",
    phone: "",
    photo: "",
  })

  const switchView = (view: 'me' | 'settings' | 'public_profile' | 'customer_service') => {
    setCurrentView(view)
    if (onPublicProfileChange) {
      onPublicProfileChange(view === 'public_profile' || view === 'customer_service')
    }
  }

  useEffect(() => {
    const fetchUserData = () => {
      const name = localStorage.getItem("userName") || "Guest"
      const uid = localStorage.getItem("userUID") || localStorage.getItem("userPhone") || "N/A"
      const phone = localStorage.getItem("userPhone") || ""
      const photo = localStorage.getItem("userPhoto") || ""

      const { fullAccNum, displayAccNum } = getOrCreateAccountNumber(uid)

      setUser({ 
        name, 
        uid, 
        accountNumber: fullAccNum, 
        displayAccountNumber: displayAccNum, 
        phone, 
        photo
      })
    }

    fetchUserData()

    window.addEventListener("storage", fetchUserData)
    return () => window.removeEventListener("storage", fetchUserData)
  }, [])

  const handleCopyAccountNumber = () => {
    if (user.displayAccountNumber && user.displayAccountNumber !== 'N/A') {
      navigator.clipboard.writeText(user.displayAccountNumber)
    }
  }

  const isSpecialUID = user.uid === 'HUSxSvQnabgU029dWYt1TUV04hd2' || user.uid === 'ADqW31RGBMaosOzy0HiqexKSD7h1'

  // Agar currentView 'customer_service' hai, toh HawaSupport dikhao
  if (currentView === 'customer_service') {
    return <HawaSupport />
  }

  if (currentView === 'settings') {
    return <SettingPage onBack={() => switchView('me')} onLogout={onLogout} />
  }

  if (currentView === 'public_profile') {
    return <PublicProfile onBack={() => switchView('me')} />
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Profile Header — HomePage jaisa gradient */}
      <div
        className="px-4 pb-6 relative"
        style={{
          background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)'
        }}
      >
        {/* User Card */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {user.photo ? (
              <img
                src={user.photo}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/60 shadow-sm"
                alt="Profile"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-4xl text-white font-bold border-2 border-white/60 shadow-sm">
                {user.name.charAt(0).toUpperCase() || "G"}
              </div>
            )}

            <div className="flex flex-col">
              {/* Name - Row 1 */}
              <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{user.name}</h2>

              {/* Account Number Display - Row 2 */}
              <div className="flex items-center gap-1 mt-1">
                {isSpecialUID ? (
                  <div className="relative inline-block w-22">
                    <img
                      src="/1785138451098~2.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain rounded-md"
                    />
                    <p className="relative text-white font-bold px-3 py-1.5 z-10 text-xs" style={{ paddingLeft: '30px' }}>
                      {user.accountNumber}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-700 text-xs font-middum">
                    ID: {user.displayAccountNumber}
                  </p>
                )}

                {user.accountNumber !== 'N/A' && (
                  <button
                    onClick={handleCopyAccountNumber}
                    className="text-gray-600 hover:text-blue-900 transition-colors p-1"
                    title="Copy ID"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>

              {user.phone && (
                <p className="text-gray-600 text-xs mt-0.5 font-semibold">
                  {user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Top Right Arrow - Click to Open Public Profile */}
          <button
            onClick={() => switchView('public_profile')}
            className="p-2 hover:bg-white/20 rounded-full transition-colors mt-2"
            title="View Public Profile"
          >
            <ChevronRight className="text-gray-700" size={24} />
          </button>
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

        {/* Banner Images */}
        <div className="flex gap-1 mt-6">
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

      {/* Main Menu Items — white background */}
      <div className="px-4 mt-1">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {menuItems.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <img
                    src={item.src}
                    alt={item.label}
                    className="w-full h-full object-cover"
                  />
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
              {index < menuItems.length - 1 && (
                <div className="h-[0.5px] bg-gray-200 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Menu Items — white background */}
      <div className="px-4 mt-4 mb-6">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {bottomMenuItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.id === '8') {
                  switchView('settings')
                }
                if (item.id === '9') {
                  switchView('customer_service')
                }
              }}
            >
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 text-gray-700">
                  {item.icon}
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
              {index < bottomMenuItems.length - 1 && (
                <div className="h-[0.5px] bg-gray-200 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recharge Event Floating Card */}
      <div className="fixed bottom-24 right-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-md cursor-pointer">
        <div className="text-center text-sm">
          <div className="text-2xl mb-1"></div>
          <div className="text-xs font-bold text-blue-800">Recharge</div>
          <div className="text-xs font-bold text-blue-800">Event</div>
        </div>
      </div>
    </div>
  )
  }
