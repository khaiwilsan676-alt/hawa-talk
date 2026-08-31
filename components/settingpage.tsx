'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SettingPageProps {
  onBack?: () => void
  onLogout?: () => void
  onBlocklistPress?: () => void
  onAboutPress?: () => void
}

const OFFICIAL_IDS = ['500001', '500002', '500003', '500004', '500005']
const ADMIN_IDS = ['700001', '700002', '700003']

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

  const handleLogout = async () => {
    const uid = localStorage.getItem("userUID")
    
    // ✅ Check if Official or Admin ID
    const isOfficialOrAdmin = OFFICIAL_IDS.includes(uid || '') || ADMIN_IDS.includes(uid || '')
    
    if (isOfficialOrAdmin && uid) {
      // Update firestore session to false
      try {
        const docRef = doc(db, "adminSettings", `sessions_${uid}`);
        await setDoc(docRef, {
          isLoggedIn: false,
          forceLogoutTimestamp: Date.now() // Record force logout to disconnect everywhere
        }, { merge: true });
      } catch (error) {
        console.error("Error updating logout status:", error);
      }

      // ✅ Official/Admin ID - Owner Panel se connected logout
      const loggedInSessions = JSON.parse(localStorage.getItem('loggedInSessions') || '{}')
      delete loggedInSessions[uid]
      localStorage.setItem('loggedInSessions', JSON.stringify(loggedInSessions))
      
      localStorage.removeItem(`session_${uid}`)
      localStorage.removeItem(`user_data_${uid}`)
      
      // ✅ Set forceLogout key - Owner Panel track karega
      localStorage.setItem(`forceLogout_${uid}`, Date.now().toString())
    }
    
    // Clear user session data (sabke liye)
    localStorage.removeItem("userName")
    localStorage.removeItem("userUID")
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userPhoto")
    
    // Call the onLogout callback
    if (onLogout) {
      onLogout()
    }
    
    window.location.reload()
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <div
        className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)'
        }}
      >
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-slate-900" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
        <div className="w-6" />
      </div>

      <div className="bg-white mt-4 border-t border-b border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="text-base text-slate-800">Message Notifications</span>
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

        <div
          onClick={onBlocklistPress}
          className="flex items-center justify-between px-5 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <span className="text-base text-slate-800">Blocklist</span>
          <ChevronRight size={20} className="text-slate-400" />
        </div>

        <div
          onClick={onAboutPress}
          className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <span className="text-base text-slate-800">About</span>
          <ChevronRight size={20} className="text-slate-400" />
        </div>
      </div>

      <div className="px-6 mt-10">
        <button
          onClick={handleLogout}
          className="w-full border border-slate-300 rounded-full py-3.5 text-center bg-white hover:bg-slate-50 transition-colors shadow-sm"
        >
          <span className="text-base font-medium text-slate-700">Logout</span>
        </button>
      </div>
    </div>
  )
}
