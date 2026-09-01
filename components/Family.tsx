'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, HelpCircle, Plus, ChevronRight } from 'lucide-react'

// ==========================================
// MAIN COMPONENT LOGIC (UNTOUCHED)
// ==========================================
interface FamilyMember {
  id: string
  name: string
  relation: string
  avatar?: string
  isAdmin?: boolean
}

interface FamilyProps {
  onBack: () => void
}

export default function Family({ onBack }: FamilyProps) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRelation, setNewMemberRelation] = useState('')
  const [familyCode, setFamilyCode] = useState('')

  const [currentView, setCurrentView] = useState<'main' | 'join' | 'create'>('main')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  // New States for Setting Sheet
  const [showApplyMode, setShowApplyMode] = useState(false)
  const [applyModeState, setApplyModeState] = useState<'free' | 'admin'>('free')

  useEffect(() => {
    const savedMembers = localStorage.getItem('familyMembers')
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers))
    }
    
    const savedCode = localStorage.getItem('familyCode')
    if (savedCode) {
      setFamilyCode(savedCode)
    }

    const timer = setInterval(() => {
      const now = new Date()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const diff = endOfMonth.getTime() - now.getTime()
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / 1000 / 60) % 60),
        secs: Math.floor((diff / 1000) % 60)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberRelation.trim()) {
      alert('Please fill in all fields')
      return
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newMemberName,
      relation: newMemberRelation,
      isAdmin: members.length === 0
    }

    const updatedMembers = [...members, newMember]
    setMembers(updatedMembers)
    localStorage.setItem('familyMembers', JSON.stringify(updatedMembers))
    
    setNewMemberName('')
    setNewMemberRelation('')
    setShowAddMember(false)
  }

  // ==========================================
  // VIEW 3: CREATE FAMILY PAGE (Full White Sheet)
  // ==========================================
  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans text-black relative">
        
        {/* NATIVE SVG SHADER FOR WHITE SCREEN REMOVAL (Image ke white bg ke liye) */}
        <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
          <filter id="remove-white" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              -1 -1 -1 3 0
            " />
          </filter>
        </svg>

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 mt-2">
          <button onClick={() => setCurrentView('main')} className="p-1 cursor-pointer">
            <ArrowLeft size={28} className="text-black" />
          </button>
          <h1 className="text-xl font-bold text-black tracking-wide">
            Create
          </h1>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* 1st Row - Square Image Upload */}
          <div className="flex flex-col items-center mt-8">
            <div className="w-24 h-24 border-2 border-[#FFD700] rounded-lg flex items-center justify-center cursor-pointer bg-gray-50/50">
              <Plus size={36} className="text-gray-400" />
            </div>
            <p className="mt-2 text-sm font-bold text-gray-500">Upload Image</p>
          </div>

          {/* 2nd Row - Family Name Input */}
          <div className="px-5 mt-8">
            <label className="block text-sm font-bold text-black mb-2">Family name</label>
            <input 
              type="text" 
              className="w-full bg-[#F3F4F6] border-none rounded-xl p-4 text-black outline-none font-medium"
              placeholder=""
            />
          </div>

          {/* 3rd Row - Family Announcement Input */}
          <div className="px-5 mt-5">
            <label className="block text-sm font-bold text-black mb-2">Family Announcement</label>
            <input 
              type="text" 
              className="w-full bg-[#F3F4F6] border-none rounded-xl p-4 text-black outline-none font-medium"
              placeholder=""
            />
          </div>

          {/* 4th Row - Setting */}
          <div className="px-5 mt-8">
            <h2 className="text-sm font-bold text-gray-500 mb-2">Setting</h2>
            <div 
              onClick={() => setShowApplyMode(true)}
              className="flex items-center justify-between bg-[#F3F4F6] p-4 rounded-xl cursor-pointer"
            >
              <span className="font-bold text-black">Apply Mode</span>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* 5th Row - Bottom Elements */}
        <div className="absolute bottom-6 w-full flex flex-col items-center px-6">
          <button className="w-[85%] bg-[#3b82f6] shadow-[0_5px_0_#2563eb] active:shadow-[0_0px_0_#2563eb] active:translate-y-1 text-white font-bold py-3.5 rounded-full transition-all text-lg tracking-wide cursor-pointer">
            Create
          </button>
          
          <div className="flex items-center gap-2 mt-6 mb-2">
            <img 
              src="/1786855398290.png" 
              alt="Coin" 
              className="w-6 h-6 object-contain"
              style={{ filter: 'url(#remove-white)' }}
            />
            <span className="font-bold text-gray-400 tracking-wider">1500000</span>
          </div>
        </div>

        {/* 20vh Apply Mode Bottom Sheet */}
        {showApplyMode && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white w-full h-[22vh] rounded-t-3xl p-6 flex flex-col shadow-2xl relative">
              
              <div 
                onClick={() => {
                  setApplyModeState('free')
                  setTimeout(() => setShowApplyMode(false), 200)
                }} 
                className="flex items-center justify-between py-4 border-b border-gray-100 cursor-pointer"
              >
                <span className="font-bold text-black text-sm">Free mode</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${applyModeState === 'free' ? 'border-[#3b82f6]' : 'border-gray-300'}`}>
                  {applyModeState === 'free' && <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full"></div>}
                </div>
              </div>

              <div 
                onClick={() => {
                  setApplyModeState('admin')
                  setTimeout(() => setShowApplyMode(false), 200)
                }} 
                className="flex items-center justify-between py-4 cursor-pointer"
              >
                <span className="font-bold text-black text-sm">Apply Mode / Admin & Owner</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${applyModeState === 'admin' ? 'border-[#3b82f6]' : 'border-gray-300'}`}>
                  {applyModeState === 'admin' && <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full"></div>}
                </div>
              </div>
              
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================================
  // VIEW 2: JOIN FAMILY PAGE (Cup Sheet)
  // ==========================================
  if (currentView === 'join') {
    return (
      <div className="min-h-screen bg-black flex flex-col relative overflow-x-hidden font-sans text-white">
        
        <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
          <filter id="remove-green" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              1.5 -2.5 1.5 1 0
            " />
          </filter>
        </svg>

        <div 
          className="absolute top-0 left-0 w-full h-[50vh] z-0"
          style={{
            backgroundImage: "url('/IMG_20260901_162148.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
          }}
        />

        <div className="absolute top-0 left-0 w-full flex flex-row items-center justify-between px-2 pt-2 z-20">
          <button 
            onClick={() => setCurrentView('main')} 
            className="p-1 cursor-pointer flex items-center justify-start"
          >
            <ArrowLeft size={28} className="text-white drop-shadow-md" />
          </button>
          
          <button className="p-1 cursor-pointer flex items-center justify-end">
            <HelpCircle size={28} className="text-white drop-shadow-md" />
          </button>
        </div>

        <div className="relative z-10 w-full mt-[50vh] px-4 pb-10 space-y-2">
          {Array.from({ length: 50 }, (_, index) => {
            const rank = index + 1;
            return (
              <div key={rank} className="relative w-full h-20 flex items-center justify-between px-4">
                <img 
                  src="/1788259008478~2.jpg" 
                  alt="Row Background" 
                  className="absolute inset-0 w-full h-full object-fill"
                  style={{ filter: 'url(#remove-green)' }}
                />
                
                <div className="relative z-10 pl-2">
                  <span className="text-lg font-black text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {rank}
                  </span>
                </div>

                <div className="relative z-10 pr-2">
                  <img 
                    src="/IMG_20260901_160944.png" 
                    alt="Icon" 
                    className="w-16 h-16 object-contain"
                    style={{ filter: 'url(#remove-green)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: MAIN FAMILY PAGE 
  // ==========================================
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-x-hidden font-sans text-white">
      
      <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
        <filter id="remove-green" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            1.5 -2.5 1.5 1 0
          " />
        </filter>
      </svg>

      <div 
        className="absolute top-0 left-0 w-full h-[50vh] z-0"
        style={{
          backgroundImage: "url('/IMG_20260901_160704.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
        }}
      />

      <div className="relative z-10 flex flex-col w-full min-h-screen pb-24">
        
        <div className="flex flex-row items-center justify-between w-full px-2 pt-2 relative z-20">
          <button onClick={onBack} className="p-1 cursor-pointer w-10 flex justify-start">
            <ArrowLeft size={28} className="text-white drop-shadow-md" />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Maine Yahan Heading ka color White kar diya hai (text-white) */}
            <h1 className="text-lg font-bold text-white drop-shadow-md whitespace-nowrap leading-tight">
              Top families Of the month
            </h1>
            <div className="text-sm font-bold text-white drop-shadow-md leading-tight">
              {`${timeLeft.days}D : ${timeLeft.hours}H : ${timeLeft.mins}M : ${timeLeft.secs}S`}
            </div>
          </div>

          <div className="w-10"></div>
        </div>

        <div className="flex flex-col w-full mt-1 px-6 relative z-10">
          <div className="flex justify-center w-full relative z-20">
            <img 
              src="/IMG_20260901_161023.png" 
              alt="Middle Rank" 
              className="w-50 h-50 object-contain drop-shadow-2xl" 
              style={{ filter: 'url(#remove-green)' }}
            />
          </div>

          <div className="flex justify-between w-full -mt-8 relative z-10 px-4">
            <img 
              src="/1788258909655~2.jpg" 
              alt="Left Rank" 
              className="w-40 h-40 object-contain drop-shadow-xl"
              style={{ filter: 'url(#remove-green)' }} 
            />
            <img 
              src="/1788258915366~2.jpg" 
              alt="Right Rank" 
              className="w-40 h-40 object-contain drop-shadow-xl"
              style={{ filter: 'url(#remove-green)' }} 
            />
          </div>
        </div>

        <div className="h-[10vh] w-full"></div>

        <div className="flex-1 px-4 space-y-4">
          <div className="relative w-full">
            <img 
              src="/1788258921361~2.jpg" 
              alt="Top 1, 2, 3" 
              className="w-full h-auto object-contain"
              style={{ filter: 'url(#remove-green)' }}
            />
          </div>

          <div className="relative w-[90%] mx-auto h-16 flex items-center overflow-hidden">
            <img 
              src="/1788259008478~2.jpg" 
              alt="Rank 4" 
              className="absolute inset-0 w-full h-full object-fill"
              style={{ filter: 'url(#remove-green)' }}
            />
            <div className="relative z-10 pl-6">
              <span className="text-xl font-black text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                4
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 w-full px-6 flex items-center justify-between z-50">
        <button 
          onClick={() => setCurrentView('create')}
          className="hover:scale-105 transition-transform cursor-pointer drop-shadow-2xl"
        >
          <img 
            src="/IMG_20260901_161001.png" 
            alt="Add Button" 
            className="w-40 h-auto object-contain"
            style={{ filter: 'url(#remove-green)' }}
          />
        </button>

        <button 
          onClick={() => setCurrentView('join')}
          className="hover:scale-105 transition-transform cursor-pointer drop-shadow-2xl"
        >
          <img 
            src="/1788263346291~2.jpg" 
            alt="Join Family" 
            className="w-16 h-16 object-contain"
            style={{ filter: 'url(#remove-green)' }}
          />
        </button>
      </div>
    </div>
  )
}

