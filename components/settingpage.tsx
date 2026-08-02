'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, LogOut, Shield, Lock } from 'lucide-react'

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
  const [showIDLogout, setShowIDLogout] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState("")

  const officialIDs = ["500001", "500002", "500003", "500004", "500005"]
  const adminIDs = ["700001", "700002", "700003"]

  const toggleSwitch = () => {
    setIsNotificationsEnabled((prev) => !prev)
  }

  const handleIDLogout = (id: string) => {
    // Clear the specific ID from localStorage
    const savedSessions = JSON.parse(localStorage.getItem('loggedInSessions') || '{}')
    delete savedSessions[id]
    localStorage.setItem('loggedInSessions', JSON.stringify(savedSessions))
    
    // Also remove specific device session
    localStorage.removeItem(`session_${id}`)
    
    setLogoutMessage(`ID ${id} logged out successfully!`)
    setTimeout(() => setLogoutMessage(""), 3000)
  }

  const handleLogoutAllOfficial = () => {
    officialIDs.forEach(id => {
      localStorage.removeItem(`session_${id}`)
    })
    setLogoutMessage("All Official IDs logged out!")
    setTimeout(() => setLogoutMessage(""), 3000)
  }

  const handleLogoutAllAdmin = () => {
    adminIDs.forEach(id => {
      localStorage.removeItem(`session_${id}`)
    })
    setLogoutMessage("All Admin IDs logged out!")
    setTimeout(() => setLogoutMessage(""), 3000)
  }

  const handleLogoutAllIDs = () => {
    const allIDs = [...officialIDs, ...adminIDs]
    allIDs.forEach(id => {
      localStorage.removeItem(`session_${id}`)
    })
    localStorage.removeItem('loggedInSessions')
    setLogoutMessage("All IDs logged out from devices!")
    setTimeout(() => setLogoutMessage(""), 3000)
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header — White */}
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

      {/* Success Message */}
      {logoutMessage && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          {logoutMessage}
        </div>
      )}

      {/* Settings Options List */}
      <div className="bg-white mt-4 border-t border-b border-slate-200">
        {/* Message Notifications */}
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

        {/* ID Session Management */}
        <div 
          onClick={() => setShowIDLogout(!showIDLogout)}
          className="flex items-center justify-between px-5 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-slate-600" />
            <span className="text-base text-slate-800">ID Session Management</span>
          </div>
          <ChevronRight 
            size={20} 
            className={`text-slate-400 transition-transform ${showIDLogout ? 'rotate-90' : ''}`}
          />
        </div>

        {/* Expandable ID Logout Section */}
        {showIDLogout && (
          <div className="bg-slate-50 border-b border-slate-200">
            {/* Logout All Button */}
            <div className="px-5 py-3 border-b border-slate-200">
              <button
                onClick={handleLogoutAllIDs}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut size={16} />
                Logout All IDs
              </button>
            </div>

            {/* Official IDs Section */}
            <div className="px-5 py-3 border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">Official IDs</span>
                </div>
                <button
                  onClick={handleLogoutAllOfficial}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Logout All
                </button>
              </div>
              <div className="space-y-2">
                {officialIDs.map((id) => (
                  <div key={id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">ID: {id}</span>
                    <button
                      onClick={() => handleIDLogout(id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium transition-colors border border-red-200"
                    >
                      <LogOut size={12} />
                      Logout
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin IDs Section */}
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">Admin IDs</span>
                </div>
                <button
                  onClick={handleLogoutAllAdmin}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Logout All
                </button>
              </div>
              <div className="space-y-2">
                {adminIDs.map((id) => (
                  <div key={id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">ID: {id}</span>
                    <button
                      onClick={() => handleIDLogout(id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium transition-colors border border-red-200"
                    >
                      <LogOut size={12} />
                      Logout
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
