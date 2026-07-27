'use client'

import { useState } from 'react'
import { db } from "../lib/firebase" // Apne firebase path ke according adjust kar lena
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore"

interface UserCard {
  id: string
  name: string
  country: string
  image: string
}

interface GlobalRoom {
  id: string
  name: string
  country: string
  image: string
  accountId: string
  createdAt: number
}

interface SearchSheetProps {
  isOpen: boolean
  onClose: () => void
  globalRooms: GlobalRoom[]
  onUserSelect: (user: UserCard) => void
}

type SearchTab = 'user' | 'room'

export default function SearchSheet({
  isOpen,
  onClose,
  globalRooms,
  onUserSelect
}: SearchSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTab>('user')
  const [searchResults, setSearchResults] = useState<GlobalRoom[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  if (!isOpen) return null

  // Dual-Collection Search Logic
  const handlePerformSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    const q = searchQuery.trim().toLowerCase()

    try {
      const foundList: GlobalRoom[] = []

      // 1. Local state filter
      const localMatches = globalRooms.filter(r => 
        r.accountId.toLowerCase().includes(q) || 
        r.name.toLowerCase().includes(q)
      )
      foundList.push(...localMatches)

      // 2. Direct Firestore 'users' collection query
      const usersRef = collection(db, "users")
      const qSnap = await getDocs(query(usersRef, where("accountId", "==", searchQuery.trim())))

      qSnap.docs.forEach((doc) => {
        const uData = doc.data() as GlobalRoom
        if (!foundList.some(item => item.accountId === uData.accountId)) {
          foundList.push({
            id: uData.id || doc.id,
            name: uData.name || 'User',
            country: uData.country || '🇮🇳',
            image: uData.image || '/1784466691241~2.jpg',
            accountId: uData.accountId || doc.id,
            createdAt: uData.createdAt || Date.now()
          })
        }
      })

      setSearchResults(foundList)
      setHasSearched(true)
    } catch (err) {
      console.error("Search error:", err)
      const localMatches = globalRooms.filter(r => 
        r.accountId.toLowerCase().includes(q) || 
        r.name.toLowerCase().includes(q)
      )
      setSearchResults(localMatches)
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCardClick = (user: GlobalRoom) => {
    onUserSelect({
      id: user.accountId,
      name: user.name,
      country: user.country,
      image: user.image
    })
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-[120] bg-white flex flex-col" 
      style={{ animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <style>{`
        @keyframes slideUpSheet {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
      `}</style>

      {/* Top Row Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-gray-100">
        {/* Back Arrow */}
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Glossy Search Bar Patti */}
        <div className="flex-1 flex items-center bg-gradient-to-r from-gray-100/90 to-blue-50/70 border border-white/60 shadow-inner rounded-full px-4 py-2 backdrop-blur-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search User ID..."
            className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePerformSearch()
            }}
          />
        </div>

        {/* Glossy Top Right Search Icon */}
        <button
          onClick={handlePerformSearch}
          className="p-2.5 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white rounded-full shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* 2nd Row: User / Room Tabs */}
      <div className="flex px-4 border-b border-gray-100 mt-1">
        <button
          type="button"
          onClick={() => setActiveSearchTab('user')}
          className={`py-3 px-6 text-sm font-bold relative transition-colors ${
            activeSearchTab === 'user' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          User
          {activeSearchTab === 'user' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveSearchTab('room')}
          className={`py-3 px-6 text-sm font-bold relative transition-colors ${
            activeSearchTab === 'room' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          Room
          {activeSearchTab === 'room' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Search Result Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-semibold">Searching users...</p>
          </div>
        ) : hasSearched ? (
          searchResults.length > 0 ? (
            <div className="flex flex-col gap-3">
              {searchResults.map((user) => (
                <div
                  key={user.accountId}
                  onClick={() => handleCardClick(user)}
                  className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900 text-sm truncate">{user.name}</span>
                      <span className="text-xs">{user.country}</span>
                    </div>
                    <span className="text-xs text-gray-400 mt-0.5 font-medium">ID: {user.accountId}</span>
                  </div>
                  <div className="px-3.5 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-sm">
                    Enter
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-40">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-sm font-semibold">No user or room found</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-xs font-medium text-gray-400">Type ID and tap search button to find user</p>
          </div>
        )}
      </div>
    </div>
  )
}

