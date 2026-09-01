'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, HelpCircle } from 'lucide-react'

// ==========================================
// MAIN COMPONENT LOGIC
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
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: '1', name: 'Aarav', relation: 'Father', isAdmin: true },
    { id: '2', name: 'Neha', relation: 'Mother' },
    { id: '3', name: 'Rahul', relation: 'Brother' },
    { id: '4', name: 'Priya', relation: 'Sister' },
    { id: '5', name: 'Rohan', relation: 'Son' }
  ])
  
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRelation, setNewMemberRelation] = useState('')
  const [familyCode, setFamilyCode] = useState('')

  const [currentView, setCurrentView] = useState<'main' | 'join'>('main')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    const savedMembers = localStorage.getItem('familyMembers')
    if (savedMembers && JSON.parse(savedMembers).length > 0) {
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
  // VIEW 2: JOIN FAMILY PAGE (Cup Sheet)
  // ==========================================
  if (currentView === 'join') {
    return (
      <div className="min-h-screen bg-[#362011] flex flex-col relative overflow-x-hidden font-sans text-white">
        
        {/* NATIVE SVG SHADER FOR GREEN SCREEN REMOVAL */}
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

        {/* 50vh Top Image */}
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

        {/* Header - Corner Icons, No Heading */}
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

        {/* List Starts Exactly at 50vh, Gap 1.5, Smaller Cards */}
        <div className="relative z-10 w-full mt-[50vh] px-4 pb-10 space-y-1.5">
          {Array.from({ length: 50 }, (_, index) => {
            const rank = index + 1;
            return (
              // Chota Card (h-14)
              <div key={rank} className="relative w-full h-14 flex items-center justify-between px-4">
                <img 
                  src="/1788259008478~2.jpg" 
                  alt="Row Background" 
                  className="absolute inset-0 w-full h-full object-fill"
                  style={{ filter: 'url(#remove-green)' }}
                />
                
                {/* Sirf Number */}
                <div className="relative z-10">
                  <span className="text-2xl font-black text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {rank}
                  </span>
                </div>

                {/* Right side icon */}
                <div className="relative z-10">
                  <img 
                    src="/IMG_20260901_160944.png" 
                    alt="Icon" 
                    className="w-10 h-10 object-contain"
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
    <div className="min-h-screen bg-[#362011] flex flex-col relative overflow-x-hidden font-sans text-white">
      
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
        
        {/* TOP HEADER - Ekdam ek line mein, corner se corner */}
        <div className="flex flex-row items-center justify-between w-full px-2 pt-2 relative z-20">
          <button onClick={onBack} className="p-1 cursor-pointer w-10 flex justify-start">
            <ArrowLeft size={28} className="text-white drop-shadow-md" />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-lg font-bold text-[#FFD700] drop-shadow-md whitespace-nowrap leading-tight">
              Top families Of the month
            </h1>
            <div className="text-sm font-bold text-white drop-shadow-md leading-tight">
              {`${timeLeft.days}D : ${timeLeft.hours}H : ${timeLeft.mins}M : ${timeLeft.secs}S`}
            </div>
          </div>

          <button 
            onClick={() => setCurrentView('join')}
            className="cursor-pointer p-1 w-10 flex justify-end"
          >
            <img 
              src="/1788258883971~2.jpg" 
              alt="Cup" 
              className="w-8 h-8 object-contain drop-shadow-lg"
              style={{ filter: 'url(#remove-green)' }}
            />
          </button>
        </div>

        {/* MIDDLE SECTION - Gap hata diya, theek countdown ke neeche */}
        <div className="flex flex-col w-full mt-1 px-6 relative z-10">
          <div className="flex justify-center w-full relative z-20">
            <img 
              src="/IMG_20260901_161023.png" 
              alt="Middle Rank" 
              className="w-32 h-32 object-contain drop-shadow-2xl" 
              style={{ filter: 'url(#remove-green)' }}
            />
          </div>

          <div className="flex justify-between w-full -mt-8 relative z-10 px-4">
            <img 
              src="/1788258909655~2.jpg" 
              alt="Left Rank" 
              className="w-24 h-24 object-contain drop-shadow-xl"
              style={{ filter: 'url(#remove-green)' }} 
            />
            <img 
              src="/1788258915366~2.jpg" 
              alt="Right Rank" 
              className="w-24 h-24 object-contain drop-shadow-xl"
              style={{ filter: 'url(#remove-green)' }} 
            />
          </div>
        </div>

        {/* Gap 10Vh */}
        <div className="h-[10vh] w-full"></div>

        {/* CARDS SECTION */}
        <div className="flex-1 px-4 space-y-6">
          {members.length === 0 ? (
             <div className="text-center text-white/70 mt-10 font-bold">
               No members yet. Click bottom button to add.
             </div>
          ) : (
            members.map((member, index) => {
              const rank = index + 1;
              const cardImage = rank <= 3 
                ? '/1788258921361~2.jpg' 
                : '/1788259008478~2.jpg';

              return (
                <div key={member.id} className="relative w-full h-24 flex items-center justify-between px-4">
                  <img 
                    src={cardImage} 
                    alt={`Rank ${rank} Background`} 
                    className="absolute inset-0 w-full h-full object-fill"
                    style={{ filter: 'url(#remove-green)' }}
                  />
                  
                  <div className="relative z-10 flex items-center gap-4 w-full">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white/50 text-white drop-shadow-md">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] flex items-center gap-2">
                        {member.name} 
                        {member.isAdmin && <span className="text-xs bg-yellow-500 px-2 py-0.5 rounded text-black font-black">Admin</span>}
                      </h3>
                      <p className="text-sm text-gray-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{member.relation}</p>
                    </div>
                    <div className="ml-auto font-black text-3xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                      #{rank}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* BOTTOM BUTTON */}
      <div className="fixed bottom-6 w-full flex justify-center z-50">
        <button 
          onClick={() => setShowAddMember(true)}
          className="hover:scale-105 transition-transform cursor-pointer drop-shadow-2xl"
        >
          <img 
            src="/IMG_20260901_161001.png" 
            alt="Add Button" 
            className="w-48 h-auto object-contain"
            style={{ filter: 'url(#remove-green)' }}
          />
        </button>
      </div>

      {/* ADD MEMBER MODAL (UNTOUCHED) */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Family Member</h3>
            
            <div className="space-y-4 text-black">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <select
                  value={newMemberRelation}
                  onChange={(e) => setNewMemberRelation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 bg-white"
                >
                  <option value="">Select relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Husband">Husband</option>
                  <option value="Wife">Wife</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 bg-gray-200 text-gray-700 font-medium py-2 rounded-xl hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="flex-1 bg-[#362011] text-white font-medium py-2 rounded-xl hover:bg-[#2a180d] transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

