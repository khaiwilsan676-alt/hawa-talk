'use client'

import { useState, useEffect } from 'react'
import { db } from "../src/lib/firebase"
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"

interface DailyRewardsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onCoinsUpdated?: (newCoins: number) => void
}

interface RewardDay {
  day: number
  title: string
  reward: number
  type: 'coin' | 'bag' | 'diamond' | 'crown' | 'star'
  icon: string
}

const REWARDS_DATA: RewardDay[] = [
  { day: 1, title: 'DAY 1', reward: 5000, type: 'coin', icon: '🪙' },
  { day: 2, title: 'DAY 2', reward: 5000, type: 'coin', icon: '🪙' },
  { day: 3, title: 'DAY 3', reward: 8000, type: 'bag', icon: '💰' },
  { day: 4, title: 'DAY 4', reward: 10000, type: 'diamond', icon: '💎' },
  { day: 5, title: 'DAY 5', reward: 10000, type: 'diamond', icon: '💎' },
  { day: 6, title: 'DAY 6', reward: 10000, type: 'crown', icon: '👑' },
]

export default function DailyRewardsModal({
  isOpen,
  onClose,
  userId,
  onCoinsUpdated
}: DailyRewardsModalProps) {
  const [streak, setStreak] = useState(1)
  const [claimedToday, setClaimedToday] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !userId) return

    const fetchRewardStatus = async () => {
      try {
        const userRef = doc(db, "users", userId)
        const snap = await getDoc(userRef)
        
        if (snap.exists()) {
          const data = snap.data()
          const lastClaimDate = data.lastClaimDate || ""
          const todayStr = new Date().toISOString().split('T')[0]
          
          setStreak(data.streak || 1)
          if (lastClaimDate === todayStr) {
            setClaimedToday(true)
          } else {
            setClaimedToday(false)
          }
        }
      } catch (error) {
        console.error("Error fetching reward status:", error)
      }
    }

    fetchRewardStatus()
  }, [isOpen, userId])

  if (!isOpen) return null

  const handleSignIntoday = async () => {
    if (claimedToday || loading) return
    setLoading(true)

    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      let currentCoins = 0
      let currentStreak = streak

      if (userSnap.exists()) {
        const data = userSnap.data()
        currentCoins = data.coins || 0
        currentStreak = data.streak || 1
      }

      const rewardIndex = ((currentStreak - 1) % 7)
      const currentRewardObj = rewardIndex === 6 ? { reward: 15000 } : REWARDS_DATA[rewardIndex]
      const earnedCoins = currentRewardObj.reward

      const newCoins = currentCoins + earnedCoins
      const nextStreak = currentStreak >= 7 ? 1 : currentStreak + 1

      if (userSnap.exists()) {
        await updateDoc(userRef, {
          coins: newCoins,
          streak: nextStreak,
          lastClaimDate: todayStr
        })
      } else {
        await setDoc(userRef, {
          coins: newCoins,
          streak: nextStreak,
          lastClaimDate: todayStr
        })
      }

      setClaimedToday(true)
      setStreak(nextStreak)
      if (onCoinsUpdated) {
        onCoinsUpdated(newCoins)
      }
      
      onClose()
    } catch (error) {
      console.error("Error claiming reward:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      {/* Main Container */}
      <div 
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col border-4 border-blue-500"
        style={{ fontFamily: 'Nunito, Inter, sans-serif', top: '2vh' }}
      >
        {/* Row 1: Top Blue Header with Title */}
        <div className="w-full bg-blue-600 py-4 px-5 text-center">
          <h2 className="text-xl font-extrabold text-white tracking-wide">Daily Sign-in</h2>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-3">
          {/* Streak Badge */}
          <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-2.5 flex items-center justify-center gap-2">
            <span className="text-lg animate-bounce">🔥</span>
            <span className="text-blue-900 font-bold text-sm">{streak} day streak!</span>
          </div>

          {/* Row 2: 4 Small Cards (Day 1 to 4) */}
          <div className="grid grid-cols-4 gap-2">
            {REWARDS_DATA.slice(0, 4).map((item) => {
              const isCurrent = item.day === streak && !claimedToday
              const isPassed = item.day < streak || (item.day === streak && claimedToday)

              return (
                <div
                  key={item.day}
                  className={`rounded-2xl p-2 flex flex-col items-center justify-center relative border transition-all ${
                    isCurrent 
                      ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-300' 
                      : isPassed
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{ height: '80px' }}
                >
                  <span className="text-[9px] font-bold text-gray-400 mb-0.5">
                    {item.title}
                  </span>
                  <div className="text-xl mb-0.5">{item.icon}</div>
                  <span className="text-[10px] font-extrabold text-gray-800">
                    {item.reward.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Row 3: 2 Small Cards (Day 5 and 6) */}
          <div className="grid grid-cols-2 gap-2">
            {REWARDS_DATA.slice(4, 6).map((item) => {
              const isCurrent = item.day === streak && !claimedToday
              const isPassed = item.day < streak || (item.day === streak && claimedToday)

              return (
                <div
                  key={item.day}
                  className={`rounded-2xl p-2.5 flex flex-col items-center justify-center relative border transition-all ${
                    isCurrent 
                      ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-300' 
                      : isPassed
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{ height: '85px' }}
                >
                  <span className="text-[10px] font-bold text-gray-400 mb-1">
                    {item.title}
                  </span>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <span className="text-xs font-extrabold text-gray-800">
                    {item.reward.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Row 4: Big Day 7 Card */}
          <div 
            className={`rounded-2xl p-3 flex flex-col items-center justify-center border transition-all ${
              streak === 7 && !claimedToday 
                ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-400' 
                : 'border-blue-200 bg-blue-50/30'
            }`}
          >
            <span className="text-[10px] font-bold text-blue-700 tracking-wider mb-0.5">
              DAY 7 - BIG REWARDS
            </span>
            <div className="text-2xl mb-0.5 animate-pulse">⭐</div>
            <span className="text-sm font-extrabold text-blue-900">
              15,000 Coins
            </span>
          </div>

          {/* Row 5: Blue Sign-In Button */}
          <button
            onClick={handleSignIntoday}
            disabled={claimedToday || loading}
            className={`w-full py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all flex flex-col items-center justify-center ${
              claimedToday 
                ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/30'
            }`}
          >
            <span className="text-sm leading-tight">
              {claimedToday ? 'Claimed Today' : 'Sign-In'}
            </span>
            {!claimedToday && (
              <span className="text-[11px] text-white/80 font-medium mt-0.5">
                +5,000 coins
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Outside Cross Icon */}
      <button
        onClick={onClose}
        className="mt-4 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white text-xl font-bold transition-all shadow-lg"
      >
        ✕
      </button>
    </div>
  )
}

