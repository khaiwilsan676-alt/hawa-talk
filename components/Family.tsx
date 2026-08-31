
'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Users, Crown, ChevronRight } from 'lucide-react'

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

  useEffect(() => {
    // Load family data from localStorage
    const savedMembers = localStorage.getItem('familyMembers')
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers))
    }
    
    const savedCode = localStorage.getItem('familyCode')
    if (savedCode) {
      setFamilyCode(savedCode)
    }
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

  const handleGenerateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setFamilyCode(code)
    localStorage.setItem('familyCode', code)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 bg-white border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 ml-3">Family</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Family Code Section */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Users size={24} />
              Family Code
            </h2>
            <p className="text-sm opacity-90 mb-4">
              Share this code with family members to join your family group
            </p>
            
            {familyCode ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-3xl font-bold tracking-widest mb-2">{familyCode}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(familyCode)}
                  className="text-xs bg-white/30 hover:bg-white/40 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
                >
                  Copy Code
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateCode}
                className="w-full bg-white/30 hover:bg-white/40 rounded-xl p-4 transition-colors cursor-pointer"
              >
                <Plus size={24} className="mx-auto mb-2" />
                <span className="text-sm">Generate Family Code</span>
              </button>
            )}
          </div>

          {/* Family Members List */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users size={20} className="text-purple-600" />
                Family Members ({members.length})
              </h3>
            </div>

            {members.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
                <p className="text-gray-500 text-sm mb-4">No family members yet</p>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Add Your First Member
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-purple-600">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        {member.name}
                        {member.isAdmin && (
                          <Crown size={14} className="text-yellow-500" />
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{member.relation}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Member Button */}
          {members.length > 0 && (
            <button
              onClick={() => setShowAddMember(true)}
              className="w-full bg-purple-600 text-white font-medium py-3 rounded-2xl hover:bg-purple-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Family Member
            </button>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Family Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <select
                  value={newMemberRelation}
                  onChange={(e) => setNewMemberRelation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
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

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 bg-gray-200 text-gray-700 font-medium py-2 rounded-xl hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="flex-1 bg-purple-600 text-white font-medium py-2 rounded-xl hover:bg-purple-700 transition-colors cursor-pointer"
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
