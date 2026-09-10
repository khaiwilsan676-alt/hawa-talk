'use client'

import React, { useEffect, useRef } from 'react'
import { ChevronLeft, HelpCircle } from 'lucide-react'

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

// Nayi image add kar di gayi hai Coins section ke liye
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
  return (
    <div className="relative w-full max-w-[440px] mx-auto min-h-screen bg-black text-white flex flex-col font-sans select-none overflow-x-hidden border-x border-purple-950/40">
      
      {/* Background Section (20vh) */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-black overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-[20vh] bg-top bg-cover bg-no-repeat opacity-90"
          style={{ backgroundImage: "url('/file_00000000e02481f4bb2153e2714aca47.png')" }}
        />
        <div className="absolute top-0 left-0 w-full h-[20vh] bg-gradient-to-b from-transparent via-black/60 to-black" />
      </div>

      {/* Top Header - Gap 1 maintained */}
      <div
        className="relative z-10 flex items-center justify-between px-4"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}
      >
        <button
          onClick={onBack}
          className="p-1 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer"
        >
          <ChevronLeft size={24} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </button>
        <h1 className="text-base font-semibold text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          Level
        </h1>
        <button className="p-1 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer">
          <HelpCircle size={22} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </button>
      </div>

      {/* Main Content - Strictly flex gap-1 */}
      <div className="flex-1 px-4 pt-1 pb-10 flex flex-col gap-1 overflow-y-auto z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Edge to Edge Top Card Image */}
        <div className="-mx-4 relative">
          <img 
            src="/file_000000007044820ea729df406d1dc320.png" 
            alt="Top Card Edge to Edge" 
            className="w-full h-auto object-cover block"
          />
        </div>

        {/* Level Update Text and Right Image Section - Strictly gap-1 */}
        <div className="flex items-center justify-between relative z-10 gap-1">
          <h2 className="text-white font-extrabold text-[22px] whitespace-nowrap leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
            Update Your level to 100
          </h2>
          <img 
            src="/file_00000000b06081fabde2d7eac02ce8c2.png" 
            alt="Level up graphic" 
            className="w-[100px] h-[100px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Level Section - Image jaisa premium dark blue box, no tier text */}
        <div className="space-y-3 relative z-10 pt-1">
          <div className="flex items-center justify-center gap-2 text-white/90">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
            <span className="text-xs font-bold tracking-wider text-blue-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Level</span>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent via-blue-400/50 to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {medalTiers.map((tier, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl bg-[#0a111c] border border-[#1a2942] flex flex-col items-center justify-center py-4 px-2 min-h-[110px] group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50"
              >
                <span className="absolute top-2 left-2 text-[11px] font-bold text-white tracking-wide">
                  {tier.range}
                </span>

                <div className="w-full flex items-center justify-center mt-3">
                  <ShaderImageBadge
                    src={tier.imageSrc}
                    isWhiteBg={tier.isWhiteBg}
                    className="w-14 h-7 object-contain group-hover:scale-110 drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)] transition-transform duration-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coins Reward Section - Premium dark blue box, simple flat red label */}
        <div className="space-y-3 pt-3 relative z-10">
          <div className="flex items-center justify-center gap-2 text-white/90">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
            <span className="text-xs font-bold tracking-wider text-blue-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Coins Reward</span>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent via-blue-400/50 to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {rewardLevels.map((reward, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl bg-[#0a111c] border border-[#1a2942] flex flex-col items-center justify-center py-3 px-2 min-h-[120px] group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50"
              >
                <span className="absolute top-2 left-2 text-[11px] font-bold text-white tracking-wide">
                  {reward.level}
                </span>

                <div className="w-full flex items-center justify-center mt-2 flex-1">
                  <ShaderImageBadge
                    src={reward.imageSrc}
                    isWhiteBg={true}
                    className="w-11 h-11 object-contain group-hover:scale-110 drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)] transition-transform duration-200"
                  />
                </div>

                <div className="w-full flex flex-col items-center gap-1 pt-1.5 mt-auto">
                  <div className="px-2.5 py-1 rounded bg-[#ef4444] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white leading-none tracking-wide">
                      {reward.amount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

