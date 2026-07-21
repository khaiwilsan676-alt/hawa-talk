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
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
      {/* Background Image */}
      <img 
        src="/1784533036732~2.jpg" 
        alt="Room Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" 
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col h-full justify-between p-4">
        
        {/* Top Header Section */}
        <div className="flex justify-between items-center text-white">
          {/* Top Left Icons (From Provided Image) */}
          <div className="flex items-center gap-2">
            {/* User count pill */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>1</span>
            </div>

            {/* Settings Hexagon Icon */}
            <button className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Share Arrow Icon */}
            <button className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            {/* Power / Exit Icon */}
            <button 
              onClick={onClose}
              className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>

          {/* User Details */}
          <div className="text-right">
            <h2 className="font-bold text-base">{user.name}</h2>
            <p className="text-xs text-gray-300">ID: 313574</p>
          </div>
        </div>

        {/* Room Seats Layout (1 + 4 + 4) */}
        <div className="flex-1 flex flex-col justify-center gap-6 my-auto">
          
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
        <div className="pb-4 space-y-3">
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-full font-bold transition-colors shadow-lg">
            Join Voice Chat
          </button>
          
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

{/* Seat Component based on Concert.tsx */}
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
