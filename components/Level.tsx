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
  const currentXP = 59692
  const nextLevelXP = 68414
  const neededXP = nextLevelXP - currentXP
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100)

  return (
    <div className="relative w-full max-w-[440px] mx-auto min-h-screen bg-[#0a0c16] text-white flex flex-col font-sans select-none overflow-x-hidden shadow-2xl border-x border-purple-950/30">
      
      {/* 30vh Top Background Image with Subtle Fade */}
      <div className="absolute top-0 left-0 right-0 h-[30vh] pointer-events-none z-0 overflow-hidden">
        <img
          src="/file_00000000360c82118a57a81f560c0ec3.png"
          alt="Top Background"
          className="w-full h-full object-cover object-top opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0c16]/60 to-[#0a0c16]" />
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

        <h1 className="text-lg font-bold text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          Level
        </h1>

        <button className="p-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer">
          <HelpCircle size={22} className="text-white/80 hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 pt-3 pb-10 space-y-6 overflow-y-auto z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Exact Same-to-Same Card Design from Reference Image */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#231a47] via-[#1b1735] to-[#121024] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(180,160,255,0.25)] border border-[#483c74]/50">
          
          {/* Top Edge Purple Neon Glow Line */}
          <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-[#885df1] to-transparent shadow-[0_0_8px_#a855f7]" />

          {/* Right Side 3D Isometric Platform Blocks (Podium) */}
          <div className="absolute -bottom-2 -right-4 w-44 h-36 pointer-events-none opacity-85">
            <div className="absolute bottom-0 right-2 w-24 h-16 bg-[#16122c] border border-purple-500/20 rounded-md shadow-2xl transform skew-y-[-8deg]" />
            <div className="absolute bottom-6 right-16 w-20 h-20 bg-[#1e193d] border border-purple-400/25 rounded-md shadow-2xl transform skew-y-[-8deg]" />
            <div className="absolute bottom-3 right-8 w-16 h-16 bg-[#251f49] border border-purple-400/30 rounded-md shadow-2xl transform skew-y-[-8deg]" />
            <div className="absolute top-2 right-12 w-24 h-24 bg-purple-600/10 blur-xl rounded-full" />
          </div>

          <div className="relative z-10 space-y-4">
            {/* User Profile Info */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#54408d] shadow-[0_0_12px_rgba(139,92,246,0.4)]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif">
                  Aawara.
                </h2>
                <span className="text-sky-400 text-sm drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]">💙</span>
              </div>
            </div>

            {/* Level Title & XP Info */}
            <div className="space-y-1">
              <h3 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Lv.2
              </h3>
              <p className="text-xs font-semibold text-slate-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {neededXP.toLocaleString()} EXP to upgrade
              </p>
            </div>

            {/* Mint Green Progress Bar */}
            <div className="pt-1">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 h-1.5 bg-[#141026] rounded-full overflow-hidden shadow-inner border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#2dd4bf] to-[#34d399] rounded-full shadow-[0_0_10px_#2dd4bf] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-400">Lv.3</span>
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

          {/* Cards - 3D Blue Corner Pill */}
          <div className="grid grid-cols-3 gap-2.5">
            {medalTiers.map((tier, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl bg-[#141226] border border-purple-900/30 shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center min-h-[95px] p-2.5 group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/40"
              >
                {/* 3D Blue Pill at exact top-left corner */}
                <div className="absolute top-0 left-0 px-2.5 py-0.5 rounded-br-xl bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.4)] border-r border-b border-sky-300/40 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {tier.range}
                  </span>
                </div>

                {/* Badge Center */}
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

          {/* Coins Reward Cards - 3D Blue Corner Pill + Coin Image + 3D Red Pill Below */}
          <div className="grid grid-cols-3 gap-2.5">
            {rewardLevels.map((reward, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl bg-[#141226] border border-purple-900/30 shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex flex-col items-center justify-between min-h-[115px] p-2 pt-2.5 group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/40"
              >
                {/* 3D Blue Pill at exact top-left corner */}
                <div className="absolute top-0 left-0 px-2.5 py-0.5 rounded-br-xl bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.4)] border-r border-b border-sky-300/40 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {reward.level}
                  </span>
                </div>

                {/* Coin Image (Center) */}
                <div className="flex-1 flex items-center justify-center pt-2">
                  <ShaderImageBadge
                    src={reward.imageSrc}
                    isWhiteBg={true}
                    className="w-11 h-11 object-contain group-hover:scale-110 drop-shadow-md transition-transform duration-200"
                  />
                </div>

                {/* 3D Red Pill with Coin Value directly underneath the image */}
                <div className="w-full flex justify-center pb-1">
                  <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-b from-[#ff4d4d] via-[#e62e2e] to-[#b31414] shadow-[0_3px_6px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.5)] flex items-center gap-1 border border-red-300/40">
                    <span className="text-[9px] drop-shadow-sm"></span>
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
