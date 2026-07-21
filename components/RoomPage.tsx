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
        src="/1784533036732~2.jpg" 
        alt="Room Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" 
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col h-full p-4">
        
        {/* Top Header Section - More Compact */}
        <div className="flex justify-between items-center text-white flex-shrink-0">
          
          {/* User Details (Left Side) */}
          <div className="text-left">
            <h2 className="font-bold text-base">{user.name}</h2>
            <p className="text-xs text-gray-300">ID: 313574</p>
          </div>

          {/* Top Right Icons - More Compact */}
          <div className="flex items-center gap-1.5">
            
            {/* 1. Followers / User Count Pill */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 h-8">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <circle cx="9" cy="7" r="4" />
                <path d="M 2 20 C 2 15 5 13 9 13 C 13 13 16 15 16 20" />
                <line x1="18" y1="8" x2="21" y2="8" />
                <line x1="18" y1="12" x2="21" y2="12" />
                <line x1="18" y1="16" x2="20" y2="16" />
              </svg>
              <span className="text-white text-xs font-semibold leading-none">1</span>
            </div>

            {/* 2. Hexagon Settings Icon */}
            <button 
              aria-label="Settings"
              className="p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                <polygon points="12 2.5 20.2 7.25 20.2 16.75 12 21.5 3.8 16.75 3.8 7.25" />
                <circle cx="12" cy="12" r="2.8" />
              </svg>
            </button>

            {/* 3. Share Arrow Icon */}
            <button 
              aria-label="Share"
              className="p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                <path d="M4 14.5C4.5 10 8 7 14 7V3L21 10.5L14 18V14C9.5 14 6 15.5 4 19.5C4 18 4 16 4 14.5Z" />
              </svg>
            </button>

            {/* 4. Power / Exit Icon */}
            <button 
              onClick={onClose}
              aria-label="Power"
              className="p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                <path d="M12 3.5v7.5" />
                <path d="M18.36 5.64a8.5 8.5 0 1 1-12.72 0" />
              </svg>
            </button>
          </div>

        </div>

        {/* Room Seats Layout - Moved Up Completely */}
        <div className="flex-1 flex flex-col justify-start gap-3 pt-2">
          
          {/* Row 1: 1 Seat */}
          <div className="flex justify-center">
            <SeatItem seatNumber={1} />
          </div>

          {/* Row 2: 4 Seats */}
          <div className="flex justify-around items-center px-2">
            <SeatItem seatNumber={2} />
            <SeatItem seatNumber={3} />
            <SeatItem seatNumber={4} />
            <SeatItem seatNumber={5} />
          </div>

          {/* Row 3: 4 Seats */}
          <div className="flex justify-around items-center px-2">
            <SeatItem seatNumber={6} />
            <SeatItem seatNumber={7} />
            <SeatItem seatNumber={8} />
            <SeatItem seatNumber={9} />
          </div>

        </div>

        {/* Footer Controls */}
        <div className="flex-shrink-0 pb-4">
          {/* Input field and action icons */}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Send a message..." 
              className="flex-1 bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white placeholder-gray-400 outline-none focus:border-white/40"
            />
            <button className="bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/20 hover:bg-black/50 transition-colors">
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

{/* Seat Component */}
function SeatItem({ seatNumber }: { seatNumber: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center shrink-0
        bg-[rgba(125,143,168,0.32)]
        border border-[rgba(210,220,235,0.55)]
        backdrop-blur-[12px]
        shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),inset_0_-1px_1.5px_rgba(0,0,0,0.18),inset_0_0_22px_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.28)]
        transition-transform duration-300 hover:scale-105 cursor-pointer"
      >
        <div className="w-[58%] h-[58%] flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible", display: "block" }}
          >
            {/* mic stand */}
            <g
              fill="none"
              stroke="#94a7be"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 28 44 Q 28 74 50 74 Q 72 74 72 44" />
              <path d="M 50 74 L 50 86" />
              <path d="M 38 90 L 62 90" />
            </g>

            {/* mic head */}
            <g
              fill="#94a7be"
              stroke="#5a6d89"
              strokeWidth="2.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              transform="translate(0, 6)"
            >
              <path d="M 36 18 Q 36 10 50 10 Q 64 10 64 18 L 64 42 Q 64 52 50 52 Q 36 52 36 42 Z" />
            </g>
          </svg>
        </div>
      </div>
      {/* Seat Number */}
      <span className="text-xs font-medium text-white/80">No {seatNumber}</span>
    </div>
  )
}
