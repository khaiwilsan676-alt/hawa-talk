'use client'

import React, { useState } from 'react'
import { db } from "../src/lib/firebase"
import { doc, setDoc } from "firebase/firestore"

interface RoomSettingPageProps {
  onBack: () => void
  roomOwnerId?: string
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

// ---------- Mini room preview for mic mode cards ----------
function MicModePreview({ count, selected }: { count: number; selected: boolean }) {
  // Image mapping based on mic mode count
  const getModeImage = (count: number) => {
    switch(count) {
      case 5:
        return '/IMG_20260812_015943.jpg'
      case 9:
        return '/IMG_20260812_020002.jpg'
      case 10:
        return '/IMG_20260812_015111.jpg'
      case 13:
        return '/IMG_20260812_015943.jpg'
      default:
        return '/IMG_20260812_020002.jpg'
    }
  }

  return (
    <div className="relative w-20 h-24 mx-auto">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-70" />
      
      {/* Room image as background */}
      <img 
        src={getModeImage(count)} 
        alt={`Mic mode ${count}`}
        className="absolute inset-0 w-full h-full object-cover rounded-xl"
      />
      
      {/* Subtle count number */}
      <div className="absolute bottom-1 right-1.5 text-[9px] font-bold text-white bg-black/50 px-1 rounded">
        {count}
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 rounded-xl border-2 border-blue-400" />
      )}
    </div>
  )
}

// Main preview for the settings page
function MainMicModePreview({ count }: { count: number }) {
  const getModeImage = (count: number) => {
    switch(count) {
      case 5:
        return '/IMG_20260812_015943.jpg'
      case 9:
        return '/IMG_20260812_020002.jpg'
      case 10:
        return '/IMG_20260812_015111.jpg'
      case 13:
        return '/IMG_20260812_015943.jpg'
      default:
        return '/IMG_20260812_020002.jpg'
    }
  }

  return (
    <div className="relative w-10 h-12">
      <img 
        src={getModeImage(count)} 
        alt={`Mic mode ${count}`}
        className="w-full h-full object-contain rounded-lg"
      />
    </div>
  )
}

// ------------------------------------------------------------

export default function RoomSettingPage({ onBack, roomOwnerId, roomData, onSave }: RoomSettingPageProps) {
  const [roomImage, setRoomImage] = useState<string>(roomData?.roomImage || '/1784533036732~2.jpg')
  const [roomName, setRoomName] = useState<string>(roomData?.roomName || '')
  const [announcement, setAnnouncement] = useState<string>(roomData?.announcement || '')
  const [isLocked, setIsLocked] = useState<boolean>(roomData?.isLocked || false)
  const [selectedMicMode, setSelectedMicMode] = useState<number>(roomData?.micMode || 9)
  const [showMicModeSheet, setShowMicModeSheet] = useState<boolean>(false)

  const micModes = [5, 9, 10, 13]

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

  const handleSave = async () => {
    const settingsData = {
      roomImage,
      roomName,
      announcement,
      isLocked,
      micMode: selectedMicMode,
    }

    if (roomOwnerId && db) {
      try {
        await setDoc(doc(db, "globalRooms", roomOwnerId), {
          name: roomName,
          image: roomImage,
          announcement: announcement,
          micMode: selectedMicMode,
        }, { merge: true })
      } catch (err) {
        console.error("Firestore update failed:", err)
      }
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
        {/* 1. Room Cover (DP) – square image, label below */}
        <div className="mb-6 flex flex-col items-center">
          <label className="cursor-pointer relative group">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
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
          <p className="text-sm font-medium text-gray-600 mt-2">Room Cover</p>
        </div>

        {/* 2. Room Name */}
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

        {/* 3. Room Announcement – starts empty */}
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

        {/* 4. Theme */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-medium text-gray-600">Theme</label>
            <span className="text-sm text-gray-800">Default</span>
          </div>
        </div>

        {/* 5. Admin */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-medium text-gray-600">Admin</label>
            <span className="text-sm text-gray-800">Manage Admins</span>
          </div>
        </div>

        {/* 6. Lock Room */}
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

        {/* 7. Mic Mode – now shows image preview */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-medium text-gray-600">Mic Mode</label>
            <button
              onClick={() => setShowMicModeSheet(true)}
              className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg"
            >
              {/* Image preview of the currently selected mode */}
              <MainMicModePreview count={selectedMicMode} />
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-gray-400 stroke-[2]">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mic Mode Bottom Sheet */}
      {showMicModeSheet && (
        <div className="absolute inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowMicModeSheet(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl px-4 py-6 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Select Mic Mode</h3>

            <div className="grid grid-cols-3 gap-4">
              {micModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setSelectedMicMode(mode)
                    setShowMicModeSheet(false)
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    selectedMicMode === mode
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Image preview with object-contain */}
                  <MicModePreview count={mode} selected={selectedMicMode === mode} />
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
