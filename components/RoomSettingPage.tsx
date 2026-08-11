'use client'

import React, { useState } from 'react'

interface RoomSettingPageProps {
  onBack: () => void
  roomData?: {
    roomName?: string
    roomImage?: string
    announcement?: string
    theme?: string
    admin?: string[]
    isLocked?: boolean
    micMode?: number
  }
  onSave?: (data: any) => void
}

export default function RoomSettingPage({ onBack, roomData, onSave }: RoomSettingPageProps) {
  const [roomImage, setRoomImage] = useState<string>(roomData?.roomImage || '/1784533036732~2.jpg')
  const [roomName, setRoomName] = useState<string>(roomData?.roomName || '')
  const [announcement, setAnnouncement] = useState<string>(roomData?.announcement || '')
  const [isLocked, setIsLocked] = useState<boolean>(roomData?.isLocked || false)
  const [selectedMicMode, setSelectedMicMode] = useState<number>(roomData?.micMode || 9)
  const [showMicModeSheet, setShowMicModeSheet] = useState<boolean>(false)

  const micModes = [
    { value: 5, label: '5 Mic Mode' },
    { value: 9, label: '9 Mic Mode' },
    { value: 10, label: '10 Mic Mode' },
    { value: 13, label: '13 Mic Mode' },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setRoomImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const settingsData = {
      roomImage,
      roomName,
      announcement,
      isLocked,
      micMode: selectedMicMode,
    }
    if (onSave) onSave(settingsData)
    onBack()
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-gray-800 stroke-[2.5]">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800">Room Setting</h1>
        <button 
          onClick={handleSave}
          className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full"
        >
          Save
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        
        {/* 1. Room Cover (DP only) */}
        <div className="mb-6">
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-gray-600 mb-3">Room Cover</p>
            <label className="cursor-pointer relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
                <img src={roomImage} alt="Room Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white opacity-0 group-hover:opacity-100">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* 2. Room Name - Label Left, Value Right */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-medium text-gray-600">Room Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="text-right text-gray-800 bg-transparent border-none focus:outline-none placeholder-gray-400 text-sm w-1/2"
            />
          </div>
        </div>

        {/* 3. Room Announcement - Label Left, Value Right */}
        <div className="mb-5">
          <div className="flex items-start justify-between px-1">
            <label className="text-sm font-medium text-gray-600 pt-1">Room Announcement</label>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Enter announcement..."
              rows={2}
              className="text-right text-gray-800 bg-transparent border-none focus:outline-none placeholder-gray-400 text-sm w-1/2 resize-none"
            />
          </div>
        </div>

        {/* 4. Theme - Label Left, Text Right */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-medium text-gray-600">Theme</label>
            <span className="text-sm text-gray-800">Default</span>
          </div>
        </div>

        {/* 5. Admin - Label Left, Text Right */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-medium text-gray-600">Admin</label>
            <span className="text-sm text-gray-800">Manage Admins</span>
          </div>
        </div>

        {/* 6. Lock Room - Label Left, Toggle Right */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-medium text-gray-600">Lock Room</label>
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`relative w-12 h-7 rounded-full transition-colors ${isLocked ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isLocked ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* 7. Mic Mode - Label Left, Value Right */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-medium text-gray-600">Mic Mode</label>
            <button 
              onClick={() => setShowMicModeSheet(true)}
              className="text-sm text-gray-800 flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-lg"
            >
              <span>{selectedMicMode} Mic Mode</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-gray-400 stroke-[2]">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mic Mode Bottom Sheet - 3 cards per row */}
      {showMicModeSheet && (
        <div className="absolute inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowMicModeSheet(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl px-4 py-6 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Select Mic Mode</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {micModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => {
                    setSelectedMicMode(mode.value)
                    setShowMicModeSheet(false)
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    selectedMicMode === mode.value 
                      ? 'border-blue-400 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm font-medium">{mode.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowMicModeSheet(false)}
              className="w-full mt-4 py-3 text-gray-500 font-medium text-center hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
