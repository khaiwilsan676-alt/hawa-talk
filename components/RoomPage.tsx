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
      {/* Background Image - Using your specific room background */}
      <img 
        src="/1784533036732~2.jpg" 
        alt="Room Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-60" 
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex justify-between items-center text-white">
          <button 
            onClick={onClose}
            className="hover:opacity-80 transition-opacity"
          >
            ← Back
          </button>
          <div className="text-center">
            <h2 className="font-bold text-lg">{user.name}</h2>
            <p className="text-xs text-gray-300">ID: 313574</p>
          </div>
          <button className="hover:opacity-80 transition-opacity">...</button>
        </div>

        {/* Room Slots Grid (9 slots) */}
        <div className="flex-1 flex flex-wrap justify-center items-center gap-4 mt-10">
          {/* Example 9 circular slots with lock icons */}
          {[...Array(9)].map((_, index) => (
            <div 
              key={index}
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-white/70" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Footer Controls */}
        <div className="pb-8 space-y-3">
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-full font-bold transition-colors">
            Join Voice Chat
          </button>
          
          {/* Input field and action icons */}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Send a message..." 
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white placeholder-gray-400 outline-none focus:border-white/40"
            />
            <button className="bg-white/10 backdrop-blur-sm p-2 rounded-full hover:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
