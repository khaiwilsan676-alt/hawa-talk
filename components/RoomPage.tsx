'use client'

import React from 'react'

interface RoomPageProps {
  user: {
    name: string
    image: string
  }
  onClose: () => void
}

export default function RoomPage({ user, onClose }: RoomPageProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Background Image */}
      <img 
        src={user.image} 
        alt="Room BG" 
        className="absolute inset-0 w-full h-full object-cover opacity-60" 
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex justify-between items-center text-white">
          <button onClick={onClose}>← Back</button>
          <div className="text-center">
            <h2 className="font-bold">{user.name}</h2>
            <p className="text-xs text-gray-300">ID: 313574</p>
          </div>
          <button>...</button>
        </div>

        {/* Room Slots Grid (9 slots) */}
        <div className="flex-1 flex flex-wrap justify-center items-center gap-4 mt-10">
          {/* Yahan aap apne 9 circular slots (lock icons) place karenge */}
        </div>

        {/* Footer Controls */}
        <div className="pb-8">
           <button className="w-full bg-emerald-500 text-white py-3 rounded-full font-bold">
             Join Voice Chat
           </button>
           {/* Input field and action icons */}
        </div>
      </div>
    </div>
  )
}

