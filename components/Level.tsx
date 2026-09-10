'use client'

import React, { useEffect, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'

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
  { level: 'Lv.5', amount: '2,00,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.10', amount: '5,00,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.20', amount: '14,50,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.26', amount: '20,00,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.32', amount: '26,75,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.45', amount: '30,56,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.56', amount: '34,00,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.64', amount: '40,50,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.76', amount: '47,67,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.82', amount: '57,00,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.91', amount: '68,00,000', imageSrc: '/1786855398290.png' },
  { level: 'Lv.100', amount: '90,99,999', imageSrc: '/1786855398290.png' },
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
    <div className="relative w-full max-w-[440px] mx-auto min-h-screen bg-black text-white flex flex-col font-sans select-none overflow-x-hidden shadow-2xl border-x border-purple-950/40">
      
      {/* Background Section */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-black overflow-hidden">
        {/* Top Background Image (~70vh height) */}
        <div 
          className="absolute top-0 left-0 w-full h-[70vh] bg-top bg-cover bg-no-repeat opacity-90"
          style={{ backgroundImage: "url('/file_00000000e02481f4bb2153e2714aca47.png')" }}
        />
        {/* Gradient that smoothly blends the image into the clean black background at the bottom */}
        <div className="absolute top-0 left-0 w-full h-[70vh] bg-gradient-to-b from-transparent via-black/40 to-black" />
      </div>

      {/* Top Header */}
      <div
        className="relative z-10 flex items-center justify-between px-4 pb-2"
        style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 12px)' }}
      >
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer"
        >
          <ChevronLeft size={24} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          Level
        </h1>
        <div className="w-8" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pt-2 pb-10 space-y-6 overflow-y-auto z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Edge to Edge Top Card Image */}
        <div className="-mx-4 relative">
          <img 
            src="/file_000000007044820ea729df406d1dc320.png" 
            alt="Top Card Edge to Edge" 
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Level Update Text and Right Image Section */}
        <div className="flex items-center justify-between mt-2 mb-4 relative z-10">
          <h2 className="text-white font-extrabold text-[32px] leading-tight w-[60%] drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
            Update Level to 100.
          </h2>
          <img 
            src="/file_00000000b06081fabde2d7eac02ce8c2.png" 
            alt="Level up graphic" 
            className="w-[120px] h-[120px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Level Section (Original ranges and design kept intact) */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-center gap-2 text-white/90">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
            <span className="text-xs font-bold tracking-wider text-purple-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Level</span>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent via-purple-400/50 to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {medalTiers.map((tier, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl bg-[#130926]/95 border border-purple-500/25 shadow-[0_8px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between py-3 px-2 min-h-[135px] group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-purple-400/50"
              >
                {/* Top-Left Level Tag */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1d1138]/90 border border-purple-400/30 text-[10px] font-black text-purple-200 shadow-sm">
                  {tier.range}
                </div>

                {/* Center Image */}
                <div className="flex-1 flex items-center justify-center pt-5 pb-2">
                  <ShaderImageBadge
                    src={tier.imageSrc}
                    isWhiteBg={tier.isWhiteBg}
                    className="w-14 h-7 object-contain group-hover:scale-110 drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)] transition-transform duration-200"
                  />
                </div>

                {/* Bottom subtle indicator */}
                <div className="w-full flex justify-center pt-1 border-t border-purple-900/40">
                  <span className="text-[9px] font-medium text-purple-300/70">★ Tier {idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coins Reward Section (Original rewards and design kept intact) */}
        <div className="space-y-3 pt-2 relative z-10">
          <div className="flex items-center justify-center gap-2 text-white/90">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
            <span className="text-xs font-bold tracking-wider text-purple-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Coins Reward</span>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent via-purple-400/50 to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {rewardLevels.map((reward, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl bg-[#130926]/95 border border-purple-500/25 shadow-[0_8px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between py-3 px-2 min-h-[145px] group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-amber-400/50"
              >
                {/* Top-Left Level Tag */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1d1138]/90 border border-purple-400/30 text-[10px] font-black text-purple-200 shadow-sm">
                  {reward.level}
                </div>

                {/* Center Image */}
                <div className="flex-1 flex items-center justify-center pt-5 pb-1">
                  <ShaderImageBadge
                    src={reward.imageSrc}
                    isWhiteBg={true}
                    className="w-11 h-11 object-contain group-hover:scale-110 drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)] transition-transform duration-200"
                  />
                </div>

                {/* Bottom Red Pill Amount */}
                <div className="w-full flex flex-col items-center gap-1 pt-1.5 border-t border-purple-900/40">
                  <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-b from-[#ff4d4d] via-[#e62e2e] to-[#b31414] shadow-md flex items-center gap-1 border border-red-300/30">
                    <span className="text-[8px]"></span>
                    <span className="text-[9px] font-black text-white leading-none tracking-tight">
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
