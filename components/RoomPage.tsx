'use client'

import React, { useState } from 'react'
import { 
  ChevronLeft, 
  MoreHorizontal, 
  Lock, 
  Mic, 
  MicOff, 
  Gift, 
  Smile, 
  Send,
  Users
} from 'lucide-react'

interface RoomPageProps {
  user: {
    name: string
    image: string
  }
  onClose: () => void
}

export default function RoomPage({ user, onClose }: RoomPageProps) {
  const [message, setMessage] = useState('')
  const [isMuted, setIsMuted] = useState(false)

  // Mock data for chat
  const messages = [
    { id: 1, user: 'System', text: 'Welcome to the room! Keep it friendly.' },
    { id: 2, user: 'Guest_29', text: 'Hey everyone! 👋' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden font-sans">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/1784533036732~2.jpg" 
          alt="Room Background" 
          className="w-full h-full object-cover opacity-50 scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header */}
        <header className="flex justify-between items-center px-4 py-6">
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="text-white w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="bg-black/30 backdrop-blur-md px-4 py-1 rounded-full border border-white/10">
              <h2 className="font-bold text-white text-sm tracking-wide">{user.name}'s Room</h2>
              <div className="flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-gray-300 uppercase font-semibold">ID: 313574</p>
              </div>
            </div>
          </div>

          <button className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all">
            <MoreHorizontal className="text-white w-6 h-6" />
          </button>
        </header>

        {/* Room Slots Grid (3x3 Layout) */}
        <main className="flex-1 px-6 flex flex-col justify-center">
          <div className="grid grid-cols-3 gap-y-10 gap-x-4">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer
                  ${index === 0 
                    ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                    : 'border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/15'
                  }`}
                >
                  {index === 0 ? (
                    // Host Slot
                    <img 
                      src={user.image || "/api/placeholder/80/80"} 
                      className="w-full h-full rounded-full object-cover p-1"
                      alt="Host"
                    />
                  ) : (
                    // Locked Slots
                    <Lock className="w-6 h-6 text-white/40" />
                  )}
                  
                  {/* Slot Number/Badge */}
                  <div className="absolute -bottom-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                    <span className="text-[10px] text-white font-bold">{index + 1}</span>
                  </div>
                </div>
                <span className="text-[11px] text-white/70 font-medium truncate w-20 text-center">
                  {index === 0 ? 'Host' : 'Empty'}
                </span>
              </div>
            ))}
          </div>
        </main>

        {/* Chat Area (Optional Preview) */}
        <div className="px-4 py-2 max-h-32 overflow-y-auto mb-2 space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <span className="bg-white/10 rounded px-1.5 py-0.5 text-[11px] text-yellow-400 font-bold">LV.5</span>
              <p className="text-sm">
                <span className="text-emerald-400 font-semibold">{msg.user}: </span>
                <span className="text-white/90">{msg.text}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Footer Controls */}
        <footer className="p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            {/* Mic Toggle */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full transition-all ${isMuted ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>

            {/* Input Box */}
            <div className="flex-1 relative flex items-center">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something..." 
                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-5 py-3 text-white placeholder-gray-400 outline-none focus:border-emerald-500/50 transition-all text-sm"
              />
              <button className="absolute right-3 p-1 text-gray-400 hover:text-white transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/10">
              <Gift className="w-6 h-6 text-pink-400" />
            </button>
            
            {message.length > 0 && (
              <button className="p-3 bg-blue-500 rounded-full animate-in zoom-in transition-all">
                <Send className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
  )
}
