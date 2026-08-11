'use client'

import React, { useState } from 'react'
import Image from 'next/image'

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
  const [selectedTheme, setSelectedTheme] = useState<string>(roomData?.theme || 'default')
  const [isLocked, setIsLocked] = useState<boolean>(roomData?.isLocked || false)
  const [selectedMicMode, setSelectedMicMode] = useState<number>(roomData?.micMode || 9)
  const [showMicModeSheet, setShowMicModeSheet] = useState<boolean>(false)

  const themes = [
    { id: 'default', name: 'Default', color: 'bg-gradient-to-br from-blue-500 to-purple-600' },
    { id: 'dark', name: 'Dark', color: 'bg-gradient-to-br from-gray-800 to-gray-900' },
    { id: 'sunset', name: 'Sunset', color: 'bg-gradient-to-br from-orange-400 to-red-500' },
    { id: 'ocean', name: 'Ocean', color: 'bg-gradient-to-br from-cyan-400 to-blue-600' },
    { id: 'forest', name: 'Forest', color: 'bg-gradient-to-br from-green-400 to-emerald-600' },
  ]

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
      const imageUrl = event.target?.result as string
      setRoomImage(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const settingsData = {
      roomImage,
      roomName,
      announcement,
      theme: selectedTheme,
      isLocked,
      micMode: selectedMicMode,
    }
    if (onSave) {
      onSave(settingsData)
    }
    onBack()
  }

  // Render seats based on mic mode
  const renderSeatsPreview = (micMode: number) => {
    const seats = []
    const totalSeats = micMode

    if (totalSeats === 5) {
      // 5 seats layout
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-center">
            <SeatPreview number={1} />
          </div>
          <div className="flex justify-around px-4">
            <SeatPreview number={2} />
            <SeatPreview number={3} />
            <SeatPreview number={4} />
            <SeatPreview number={5} />
          </div>
        </div>
      )
    }

    if (totalSeats === 9) {
      // 9 seats layout
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-center">
            <SeatPreview number={1} />
          </div>
          <div className="flex justify-around px-1">
            <SeatPreview number={2} />
            <SeatPreview number={3} />
            <SeatPreview number={4} />
            <SeatPreview number={5} />
          </div>
          <div className="flex justify-around px-1">
            <SeatPreview number={6} />
            <SeatPreview number={7} />
            <SeatPreview number={8} />
            <SeatPreview number={9} />
          </div>
        </div>
      )
    }

    if (totalSeats === 10) {
      // 10 seats layout
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-center gap-4">
            <SeatPreview number={1} />
            <SeatPreview number={2} />
          </div>
          <div className="flex justify-around px-1">
            <SeatPreview number={3} />
            <SeatPreview number={4} />
            <SeatPreview number={5} />
            <SeatPreview number={6} />
          </div>
          <div className="flex justify-around px-1">
            <SeatPreview number={7} />
            <SeatPreview number={8} />
            <SeatPreview number={9} />
            <SeatPreview number={10} />
          </div>
        </div>
      )
    }

    if (totalSeats === 13) {
      // 13 seats layout
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-center">
            <SeatPreview number={1} />
          </div>
          <div className="flex justify-around px-1">
            <SeatPreview number={2} />
            <SeatPreview number={3} />
            <SeatPreview number={4} />
            <SeatPreview number={5} />
          </div>
          <div className="flex justify-around px-1">
            <SeatPreview number={6} />
            <SeatPreview number={7} />
            <SeatPreview number={8} />
            <SeatPreview number={9} />
          </div>
          <div className="flex justify-around px-1">
            <SeatPreview number={10} />
            <SeatPreview number={11} />
            <SeatPreview number={12} />
            <SeatPreview number={13} />
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div 
        className="flex items-center px-4 py-3 border-b border-gray-200 flex-shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        {/* Left Arrow Back Button */}
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer flex-shrink-0"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-gray-800 stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Center Heading */}
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800">
          Room Setting
        </h1>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors cursor-pointer flex-shrink-0"
        >
          Save
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        
        {/* 1. Room Cover Image */}
        <div className="mb-6">
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-gray-600 mb-3">Room Cover</p>
            <label className="cursor-pointer relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md">
                <img 
                  src={roomImage} 
                  alt="Room Cover"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
              </div>
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 2. Room Name */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            maxLength={30}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{roomName.length}/30</p>
        </div>

        {/* 3. Room Announcement */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Room Announcement
          </label>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Enter room announcement or rules..."
            maxLength={200}
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{announcement.length}/200</p>
        </div>

        {/* 4. Theme Selection */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-3">
            Theme
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer`}
              >
                <div className={`w-14 h-14 rounded-2xl ${theme.color} shadow-md transition-all duration-200 ${
                  selectedTheme === theme.id ? 'ring-3 ring-blue-500 ring-offset-2 scale-110' : ''
                }`} />
                <span className={`text-xs font-medium ${
                  selectedTheme === theme.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Admin */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Admin
          </label>
          <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            <span className="text-gray-800 text-sm">Manage Admins</span>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-gray-400 stroke-[2] stroke-linecap-round stroke-linejoin-round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* 6. Room Lock */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-600">
              Room Lock
            </label>
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer ${
                isLocked ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-200 ${
                isLocked ? 'left-5.5' : 'left-0.5'
              }`} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {isLocked ? 'Room is locked. Only admin can add users.' : 'Room is open. Anyone can join.'}
          </p>
        </div>

        {/* 7. Mic Mode */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Mic Mode
          </label>
          <button 
            onClick={() => setShowMicModeSheet(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span className="text-gray-800">
              {selectedMicMode} Mic Mode
            </span>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-gray-400 stroke-[2] stroke-linecap-round stroke-linejoin-round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          
          {/* Seat Preview */}
          <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Seats Layout Preview</p>
            {renderSeatsPreview(selectedMicMode)}
          </div>
        </div>

      </div>

      {/* Mic Mode Bottom Sheet */}
      {showMicModeSheet && (
        <div className="absolute inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowMicModeSheet(false)}
          />
          
          <div 
            className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl px-6 py-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">
              Select Mic Mode
            </h3>
            
            <div className="space-y-2">
              {micModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => {
                    setSelectedMicMode(mode.value)
                    setShowMicModeSheet(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all cursor-pointer ${
                    selectedMicMode === mode.value 
                      ? 'bg-blue-50 border-2 border-blue-400 text-blue-700' 
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{mode.label}</span>
                  {selectedMicMode === mode.value && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-blue-500">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowMicModeSheet(false)}
              className="w-full mt-4 py-3 text-gray-500 font-medium text-center hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
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

// Seat Preview Component for Mic Mode Layout
function SeatPreview({ number }: { number: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-9 h-9 rounded-full bg-gray-300 border border-gray-400 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          width="55%"
          height="55%"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible", display: "block" }}
        >
          <g fill="none" stroke="#9ca3af" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 28 44 Q 28 74 50 74 Q 72 74 72 44" />
            <path d="M 50 74 L 50 86" />
            <path d="M 38 90 L 62 90" />
          </g>
          <g fill="#9ca3af" stroke="#6b7280" strokeWidth="3" transform="translate(0, 6)">
            <path d="M 36 18 Q 36 10 50 10 Q 64 10 64 18 L 64 42 Q 64 52 50 52 Q 36 52 36 42 Z" />
          </g>
        </svg>
      </div>
      <span className="text-[8px] text-gray-500">No {number}</span>
    </div>
  )
          }
