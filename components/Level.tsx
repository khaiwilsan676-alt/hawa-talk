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
  const currentXP = 0
  const nextLevelXP = 857342265
  const progressPercent = 0

  return (
    <div className="relative w-full max-w-[440px] mx-auto min-h-screen bg-gradient-to-b from-[#120822] via-[#090414] to-[#030107] text-white flex flex-col font-sans select-none overflow-x-hidden shadow-2xl border-x border-purple-950/40">
      
      {/* 30vh Top Background Image Layer */}
      <div 
        className="absolute top-0 left-0 w-full h-[30vh] bg-cover bg-center z-0 pointer-events-none opacity-80"
        style={{ backgroundImage: "url('/file_00000000360c82118a57a81f560c0ec3.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#120822]/20 via-[#120822]/60 to-[#120822]" />
      </div>

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full h-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/25 via-indigo-900/10 to-transparent blur-3xl" />
        <div className="absolute top-[30%] -left-20 w-80 h-80 bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[25%] -right-20 w-80 h-80 bg-fuchsia-900/10 rounded-full blur-[120px]" />
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
        
        {/* Main Profile Card - Clean & Exact Reference Style */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-[#160b2b] via-[#0d061c] to-[#070310] p-5 shadow-[0_16px_35px_rgba(10,4,20,0.8)] border border-purple-500/20">
          
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
          <div className="absolute top-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            
            {/* Top Row: Avatar Frame & Username (Lv.0 and Elite Player removed) */}
            <div className="flex items-center gap-4 py-2">
              
              {/* Avatar Frame Container */}
              <div className="relative w-[84px] h-[84px] flex items-center justify-center shrink-0">
                <img 
                  src="/file_0000000055ac821186486b31f4a0d239.png" 
                  alt="Avatar Frame" 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                />
                <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-black z-0 flex items-center justify-center">
                  <img 
                    src="/IMG-20260905-WA0078.jpg" 
                    alt="User" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Username Only */}
              <div className="flex flex-col justify-center">
                <h2 className="text-[26px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#d97706] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-serif">
                  KāziR Khān
                </h2>
              </div>
            </div>

            {/* Bottom Progress Bar Section with 0% and Badge */}
            <div className="flex items-center gap-3 pt-2">
              <div className="relative flex-1 h-9 flex items-center px-3">
                <img 
                  src="/file_000000006ff48211a6b2db258441b739.png" 
                  alt="Progress Bar Frame" 
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                />
                <div className="relative z-10 w-full flex items-center justify-between text-xs font-bold text-white px-2">
                  <span className="text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">0%</span>
                  <div className="flex-1 mx-3 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                <ShaderImageBadge
                  src="/1787590094184~2.jpg"
                  isWhiteBg={false}
                  className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Level Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-white/90">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
            <span className="text-xs font-bold tracking-wider text-purple-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Level</span>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent via-purple-400/50 to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {medalTiers.map((tier, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl bg-[#110722] border border-purple-950/60 shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center min-h-[95px] p-2.5 group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/40"
              >
                <div className="absolute top-0 left-0 px-2.5 py-0.5 rounded-br-xl bg-gradient-to-b from-[#a855f7] via-[#7e22ce] to-[#581c87] shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] border-r border-b border-purple-400/30 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {tier.range}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-center">
                  <ShaderImageBadge
                    src={tier.imageSrc}
                    isWhiteBg={tier.isWhiteBg}
                    className="w-14 h-7 object-contain group-hover:scale-110 drop-shadow-md transition-transform duration-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coins Reward Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-white/90">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
            <span className="text-xs font-bold tracking-wider text-purple-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Coins Reward</span>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent via-purple-400/50 to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {rewardLevels.map((reward, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl bg-[#110722] border border-purple-950/60 shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex flex-col items-center justify-between min-h-[115px] p-2 pt-2.5 group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/40"
              >
                <div className="absolute top-0 left-0 px-2.5 py-0.5 rounded-br-xl bg-gradient-to-b from-[#a855f7] via-[#7e22ce] to-[#581c87] shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] border-r border-b border-purple-400/30 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {reward.level}
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center pt-2">
                  <ShaderImageBadge
                    src={reward.imageSrc}
                    isWhiteBg={true}
                    className="w-11 h-11 object-contain group-hover:scale-110 drop-shadow-md transition-transform duration-200"
                  />
                </div>

                <div className="w-full flex justify-center pb-1">
                  <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-b from-[#ff4d4d] via-[#e62e2e] to-[#b31414] shadow-[0_3px_6px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.6)] flex items-center gap-1 border border-red-300/40">
                    <span className="text-[9px] drop-shadow-sm">🪙</span>
                    <span className="text-[9px] font-black text-white leading-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
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

