'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, HelpCircle } from 'lucide-react'

interface LevelProps {
  onBack?: () => void
}

interface MedalTier {
  range: string
  imageSrc: string
  isWhiteBg: boolean
}

interface RewardItem {
  level: string
  amount: string
  imageSrc: string
}

const medalTiers: MedalTier[] = [
  { range: 'Lv.1-10', imageSrc: '/1785137410522.png', isWhiteBg: true },
  { range: 'Lv.11-20', imageSrc: '/1787573593167~2.jpg', isWhiteBg: false },
  { range: 'Lv.21-30', imageSrc: '/1787573599045~2.jpg', isWhiteBg: false },
  { range: 'Lv.31-40', imageSrc: '/1787573616413~2.jpg', isWhiteBg: false },
  { range: 'Lv.41-50', imageSrc: '/1787586493548~2.jpg', isWhiteBg: false },
  { range: 'Lv.51-60', imageSrc: '/1787573621768~2.jpg', isWhiteBg: false },
  { range: 'Lv.61-70', imageSrc: '/1787586465659~2.jpg', isWhiteBg: false },
  { range: 'Lv.71-80', imageSrc: '/1787573604873~2.jpg', isWhiteBg: false },
  { range: 'Lv.81-90', imageSrc: '/1787573627153~2.jpg', isWhiteBg: false },
  { range: 'Lv.91-100', imageSrc: '/1787573633612~2.jpg', isWhiteBg: false },
]

const rewardLevels: RewardItem[] = [
  { level: 'Lv.5', amount: '2,00,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.10', amount: '5,00,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.20', amount: '14,50,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.26', amount: '20,00,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.32', amount: '26,75,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.45', amount: '30,56,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.56', amount: '34,00,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.64', amount: '40,50,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.76', amount: '47,67,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.82', amount: '57,00,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.91', amount: '68,00,000', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
  { level: 'Lv.100', amount: '90,99,999', imageSrc: '/file_00000000b2d481fd8cd233482dbeb9ef.png' },
]

function ShaderImageBadge({
  src,
  isWhiteBg,
  className = 'w-16 h-8 object-contain',
}: {
  src: string
  isWhiteBg: boolean
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const img = new Image()
    img.src = src

    img.onload = () => {
      const w = img.naturalWidth || 120
      const h = img.naturalHeight || 60
      canvas.width = w
      canvas.height = h

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)

      try {
        const imgData = ctx.getImageData(0, 0, w, h)
        const d = imgData.data

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i]
          const g = d[i + 1]
          const b = d[i + 2]

          if (isWhiteBg) {
            const minVal = Math.min(r, g, b)
            const maxVal = Math.max(r, g, b)
            const isNeutral = maxVal - minVal < 30

            if (r > 200 && g > 200 && b > 200 && isNeutral) {
              if (r > 235 && g > 235 && b > 235) {
                d[i + 3] = 0
              } else {
                const factor = (255 - Math.max(r, g, b)) / 55
                d[i + 3] = Math.floor(d[i + 3] * Math.max(0, Math.min(1, factor)))
              }
            }
          } else {
            const maxRB = Math.max(r, b)
            const greenDiff = g - maxRB

            if (g > 70 && greenDiff > 25) {
              d[i + 3] = 0
            } else if (g > 60 && greenDiff > 10) {
              const alphaRatio = 1 - (greenDiff - 10) / 15
              d[i + 3] = Math.floor(d[i + 3] * Math.max(0, Math.min(1, alphaRatio)))
              d[i + 1] = Math.min(g, maxRB + 5)
            }
          }
        }

        ctx.putImageData(imgData, 0, 0)
      } catch (e) {
        ctx.drawImage(img, 0, 0, w, h)
      }
    }
  }, [src, isWhiteBg])

  return (
    <canvas
      ref={canvasRef}
      className={`${className} drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)] filter transition-transform duration-200`}
    />
  )
}

export default function Level({ onBack }: LevelProps) {
  const [showAllLevels, setShowAllLevels] = useState(false)
  const [showAllRewards, setShowAllRewards] = useState(false)

  const visibleLevels = showAllLevels ? medalTiers : medalTiers.slice(0, 6)
  const visibleRewards = showAllRewards ? rewardLevels : rewardLevels.slice(0, 6)

  const emptyCards = [...Array(6)]

  return (
    <div className="relative w-full max-w-[440px] mx-auto min-h-screen bg-gradient-to-b from-[#060a12] via-[#091122] to-[#060a12] text-white flex flex-col font-sans select-none border-x border-purple-950/40 shadow-2xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* Background Image Top */}
      <div className="absolute top-0 left-0 w-full h-[40vh] pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-top bg-cover bg-no-repeat opacity-80 mix-blend-screen"
          style={{ backgroundImage: "url('/file_00000000e02481f4bb2153e2714aca47.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060a12]/80 to-[#060a12]" />
      </div>

      {/* Header */}
      <div
        className="sticky top-0 z-50 flex items-center justify-center w-full px-2 pb-2 pt-2 bg-transparent"
        style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 8px))' }}
      >
        <button
          onClick={onBack}
          className="absolute left-2 p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer"
        >
          <ArrowLeft size={26} strokeWidth={2.5} className="text-white drop-shadow-md" />
        </button>
        
        <h1 className="text-xl font-extrabold text-white tracking-wide drop-shadow-lg">
          Level
        </h1>
        
        <button className="absolute right-2 p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer">
          <HelpCircle size={24} strokeWidth={2.5} className="text-white drop-shadow-md" />
        </button>
      </div>

      {/* Main flow content */}
      <div className="flex-1 px-4 flex flex-col pb-12 z-10 relative">
        
        {/* Top Card */}
        <div className="relative -mt-7 z-20 -mx-4">
          <img 
            src="/file_000000007044820ea729df406d1dc320.png" 
            alt="Top Card" 
            className="w-full h-auto block" 
          />
          <div className="absolute inset-0 z-10 flex items-center px-4 gap-3">
            <img src="/IMG-20260905-WA0078.jpg" alt="User" className="w-10 h-10 rounded-full object-cover shadow-lg" />
            <span className="text-white font-bold text-[17px] tracking-wide drop-shadow-md">
              KāziR Khān
            </span>
          </div>
        </div>

        {/* Text aur Right Image (Extreme Left & Right aligned) */}
        <div className="flex items-center justify-between w-full pointer-events-none -mt-8 z-30">
          <h2 className="text-white font-extrabold text-[18px] whitespace-nowrap leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] -mt-6">
            Update level to 100
          </h2>
          <img 
            src="/file_00000000b06081fabde2d7eac02ce8c2.png" 
            alt="Level up graphic" 
            className="w-[140px] h-[140px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] pointer-events-auto -translate-y-4"
          />
        </div>

        {/* --- ALL SECTIONS WITH 5VH GAP --- */}
        <div className="flex flex-col gap-[5vh] mt-2">
          
          {/* --- LEVEL SECTION --- */}
          <div className="w-full relative">
            <div className="flex justify-center w-full mb-5">
              <img src="/IMG_20260910_220024.png" alt="Level" className="h-10 object-contain drop-shadow-md" />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {visibleLevels.map((tier, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-md bg-white/10 backdrop-blur-md flex flex-col items-center justify-center py-4 px-2 min-h-[110px] group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-white/20"
                >
                  <span className="absolute top-2 left-2 text-[11px] font-bold text-white tracking-wide">
                    {tier.range}
                  </span>

                  <div className="w-full flex items-center justify-center mt-3">
                    <ShaderImageBadge
                      src={tier.imageSrc}
                      isWhiteBg={tier.isWhiteBg}
                      className="w-14 h-14 object-contain group-hover:scale-110 drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)] transition-transform duration-200"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setShowAllLevels(!showAllLevels)}
              className="mt-4 w-full flex justify-center hover:opacity-80 active:scale-95 transition-all"
            >
              <img 
                src="/file_000000005dac820685e667586bcc16f4.png" 
                alt="View More" 
                className="h-7 object-contain"
              />
            </button>
          </div>

          {/* --- COINS REWARD SECTION --- */}
          <div className="w-full relative">
            <div className="flex justify-center w-full mb-5">
              <img src="/file_00000000cee4821082edb60451e825f4.png" alt="Rewards" className="h-10 object-contain drop-shadow-md" />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {visibleRewards.map((reward, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-md bg-white/10 backdrop-blur-md flex flex-col items-center justify-center py-3 px-2 min-h-[120px] group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-white/20"
                >
                  <span className="absolute top-2 left-2 text-[11px] font-bold text-white tracking-wide">
                    {reward.level}
                  </span>

                  <div className="w-full flex items-center justify-center mt-2 flex-1">
                    <ShaderImageBadge
                      src={reward.imageSrc}
                      isWhiteBg={true}
                      className="w-14 h-14 object-contain group-hover:scale-110 drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)] transition-transform duration-200"
                    />
                  </div>

                  <div className="w-full flex flex-col items-center gap-1 pt-1.5 mt-auto">
                    <div className="flex items-center justify-center">
                      <span className="text-[12px] font-bold text-white leading-none tracking-wide drop-shadow-md">
                        {reward.amount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowAllRewards(!showAllRewards)}
              className="mt-4 w-full flex justify-center hover:opacity-80 active:scale-95 transition-all"
            >
              <img 
                src="/file_000000005dac820685e667586bcc16f4.png" 
                alt="View More" 
                className="h-7 object-contain"
              />
            </button>
          </div>

          {/* --- MEDAL SECTION --- */}
          <div className="w-full relative">
            <div className="flex justify-center w-full mb-5">
              <img src="/IMG_20260910_220038.png" alt="Medal" className="h-10 object-contain drop-shadow-md" />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {emptyCards.map((_, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-md bg-white/10 backdrop-blur-md min-h-[110px] group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-white/20 flex items-center justify-center"
                />
              ))}
            </div>
          </div>

          {/* --- VEHICLE SECTION --- */}
          <div className="w-full relative">
            <div className="flex justify-center w-full mb-5">
              <img src="/IMG_20260910_220000.png" alt="Vehicle" className="h-10 object-contain drop-shadow-md" />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {emptyCards.map((_, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-md bg-white/10 backdrop-blur-md min-h-[110px] group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-white/20 flex items-center justify-center"
                />
              ))}
            </div>
          </div>
          
          {/* --- BACKGROUND SECTION --- */}
          <div className="w-full relative">
            <div className="flex justify-center w-full mb-5">
              <img src="/file_00000000d2f8822fb27fd8617d452ed6.png" alt="Background" className="h-10 object-contain drop-shadow-md" />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {emptyCards.map((_, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-md bg-white/10 backdrop-blur-md min-h-[110px] group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-white/20 flex items-center justify-center"
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

