'use client'

import React, { useEffect, useRef } from 'react'
import { ChevronLeft, Lock } from 'lucide-react'

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
      className={`${className} drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] transition-transform duration-200`}
    />
  )
}

export default function Level({ onBack }: LevelProps) {
  const currentXP = 59692
  const nextLevelXP = 68414
  const neededXP = nextLevelXP - currentXP
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100)

  return (
    <div className="relative w-full max-w-[440px] mx-auto min-h-screen bg-gradient-to-b from-[#0a2342] via-[#051426] to-[#020b14] text-white flex flex-col font-sans select-none overflow-x-hidden shadow-2xl border-x border-cyan-950/40">
      {/* Background Soft Ray / Glow Effect */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-80 bg-gradient-to-b from-sky-500/20 via-sky-900/5 to-transparent blur-3xl" />
        <div className="absolute top-[40%] -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] -right-20 w-72 h-72 bg-cyan-700/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-center px-4 pt-4 pb-2">
        <button
          onClick={onBack}
          className="absolute left-3 p-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer"
        >
          <ChevronLeft size={24} className="text-white drop-shadow-md" />
        </button>
        <h1 className="text-lg font-medium text-white tracking-wide drop-shadow-md">
          Level
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pt-3 pb-10 space-y-6 overflow-y-auto z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Main Level Profile Card - Bright Cyan & Golden Badge Style */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] p-4 shadow-[0_10px_25px_rgba(2,132,199,0.3)] border border-sky-300/30">
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#52352a]/90 flex items-center justify-center text-white text-xl font-bold shadow-md border-2 border-white/20">
                  K
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white drop-shadow-sm">
                    Aawara.
                  </h2>
                  <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-black/30 border border-white/10">
                    <span className="text-[10px] font-bold text-sky-200">ID</span>
                    <span className="text-[11px] text-white/90 font-medium">100658242</span>
                  </div>
                </div>
              </div>

              {/* Progress & XP Details */}
              <div className="space-y-1.5 pt-1">
                <div className="inline-flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full text-[10px] font-medium text-sky-100">
                  <span className="text-[#fde047] font-bold">{currentXP.toLocaleString()}</span>
                  <span>/</span>
                  <span>{nextLevelXP.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-44 h-2 bg-black/40 rounded-full p-[1px] border border-white/20">
                    <div
                      className="h-full bg-gradient-to-r from-sky-200 to-cyan-300 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                    {/* Circle thumb on bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border border-cyan-400"
                      style={{ left: `calc(${progressPercent}% - 6px)` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white/90">Lv.10</span>
                </div>

                <p className="text-[11px] text-sky-100 font-medium">
                  Need {neededXP.toLocaleString()} EXP to reach the next level
                </p>

                <button className="inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-full bg-black/30 hover:bg-black/40 text-[11px] font-medium text-white/95 border border-white/15 transition-all">
                  <span>How to upgrade?</span>
                  <span className="text-yellow-400 text-xs">▲</span>
                </button>
              </div>
            </div>

            {/* Big Right Badge */}
            <div className="relative flex flex-col items-center justify-center shrink-0">
              <div className="relative flex items-center justify-center">
                <ShaderImageBadge
                  src="/1787590094184~2.jpg"
                  isWhiteBg={false}
                  className="w-24 h-24 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                />
              </div>
              <div className="mt-[-10px] px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 text-[11px] font-black shadow-md border border-amber-200">
                Lv.9
              </div>
            </div>
          </div>
        </div>

        {/* Level Section Divider */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-white/90">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/40" />
            <span className="text-xs font-bold tracking-wider">Level</span>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/40" />
          </div>

          {/* Medals Grid (Navy Blue Frosted Card Style) */}
          <div className="grid grid-cols-3 gap-2.5">
            {medalTiers.map((tier, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden bg-gradient-to-b from-[#132c4a]/90 to-[#0c1c30]/95 rounded-xl border border-sky-900/50 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between min-h-[110px] group cursor-pointer transition-all hover:border-sky-500/40"
              >
                {/* Header Tag */}
                <div className="w-full bg-[#1b3d63]/80 py-1 text-center border-b border-sky-900/40">
                  <span className="text-[10px] font-semibold text-cyan-200">
                    {tier.range}
                  </span>
                </div>

                {/* Badge Center */}
                <div className="py-2 flex items-center justify-center">
                  <ShaderImageBadge
                    src={tier.imageSrc}
                    isWhiteBg={tier.isWhiteBg}
                    className="w-14 h-7 object-contain group-hover:scale-105 drop-shadow-md"
                  />
                </div>

                {/* Bottom Lock Area */}
                <div className="w-full py-1.5 bg-[#091524]/90 flex items-center justify-center border-t border-sky-950/60">
                  <Lock size={12} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coins Reward Section Divider */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-white/90">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/40" />
            <span className="text-xs font-bold tracking-wider">Coins Reward</span>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/40" />
          </div>

          {/* Rewards Grid (Navy Blue & Orange Coin Badges Style) */}
          <div className="grid grid-cols-3 gap-2.5">
            {rewardLevels.map((reward, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden bg-gradient-to-b from-[#132c4a]/90 to-[#0c1c30]/95 rounded-xl border border-sky-900/50 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between min-h-[120px] group cursor-pointer transition-all hover:border-sky-500/40"
              >
                {/* Top Level Tag */}
                <div className="w-full bg-[#1b3d63]/80 py-1 px-2 flex items-center justify-start border-b border-sky-900/40">
                  <span className="text-[9px] font-semibold text-cyan-200">
                    {reward.level}
                  </span>
                </div>

                {/* Amount Ribbon & Coins Image */}
                <div className="flex flex-col items-center justify-center py-2 space-y-1">
                  <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-[9px] font-bold text-white shadow-sm flex items-center gap-1 border border-white/20">
                    <span></span>
                    <span>{reward.amount}</span>
                  </div>
                  <ShaderImageBadge
                    src={reward.imageSrc}
                    isWhiteBg={true}
                    className="w-10 h-10 object-contain group-hover:scale-110 drop-shadow-md"
                  />
                </div>

                {/* Bottom Lock Area */}
                <div className="w-full py-1.5 bg-[#091524]/90 flex items-center justify-center border-t border-sky-950/60">
                  <Lock size={12} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
