'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SettingPageProps {
  onBack?: () => void
  onLogout?: () => void
  onBlocklistPress?: () => void
  onAboutPress?: () => void
}

export default function SettingPage({
  onBack,
  onLogout,
  onBlocklistPress,
  onAboutPress,
}: SettingPageProps) {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)

  const toggleSwitch = () => {
    setIsNotificationsEnabled((prev) => !prev)
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-slate-900" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
        <div className="w-6" /> {/* Spacer for center alignment */}
      </div>

      {/* Settings Options List */}
      <div className="bg-white mt-4 border-t border-b border-slate-200">
        {/* Message Notifications */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="text-base text-slate-800">Message Notifications</span>
          
          {/* Custom Toggle Switch */}
          <button
            type="button"
            onClick={toggleSwitch}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
              isNotificationsEnabled ? 'bg-cyan-400' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                isNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Blocklist */}
        <div
          onClick={onBlocklistPress}
          className="flex items-center justify-between px-5 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <span className="text-base text-slate-800">Blocklist</span>
          <ChevronRight size={20} className="text-slate-400" />
        </div>

        {/* About */}
        <div
          onClick={onAboutPress}
          className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <span className="text-base text-slate-800">About</span>
          <ChevronRight size={20} className="text-slate-400" />
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-6 mt-10">
        <button
          onClick={onLogout}
          className="w-full border border-slate-300 rounded-full py-3.5 text-center bg-white hover:bg-slate-50 transition-colors shadow-sm"
        >
          <span className="text-base font-medium text-slate-700">Logout</span>
        </button>
      </div>
    </div>
  )
}

