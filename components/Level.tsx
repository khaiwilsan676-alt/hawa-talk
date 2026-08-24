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
      className={`${className} drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)] transition-transform duration-200`}
    />
  )
}

export default function Level({ onBack }: LevelProps) {
  const currentXP = 59692
  const nextLevelXP = 68414
  const neededXP = nextLevelXP - currentXP
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100)

  return (
    <div className="relative w-full max-w-[440px] mx-auto min-h-screen bg-[#07060e] text-white flex flex-col font-sans select-none overflow-x-hidden shadow-[0_0_60px_rgba(236,72,153,0.15)] border-x border-purple-900/30">
      {/* Dynamic Multi-Color Ambient Glows (Blue, Pink, Red, Purple) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Blue Orb */}
        <div className="absolute top-[8%] -left-16 w-80 h-80 bg-blue-600/25 rounded-full blur-[110px]" />
        {/* Purple Orb */}
        <div className="absolute top-[32%] -right-16 w-80 h-80 bg-purple-600/30 rounded-full blur-[115px]" />
        {/* Pink Orb */}
        <div className="absolute top-[58%] -left-14 w-72 h-72 bg-pink-500/25 rounded-full blur-[105px]" />
        {/* Red / Crimson Orb */}
        <div className="absolute bottom-[4%] right-0 w-80 h-80 bg-rose-600/20 rounded-full blur-[110px]" />
      </div>

      {/* Top Gloss Aurora Bar */}
      <div className="absolute top-0 left-0 right-0 h-[14vh] pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-pink-500/30 to-purple-600/40 blur-2xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-11/12 h-[2px] bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_20px_#ec4899]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-center px-4 pt-4 pb-3 mb-6">
        <button
          onClick={onBack}
          className="absolute left-3 p-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer backdrop-blur-md"
        >
          <ChevronLeft size={24} className="text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
        </button>
        <h1 className="text-base font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-sky-100 drop-shadow-[0_2px_8px_rgba(236,72,153,0.3)]">
          Level
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pt-2 pb-10 space-y-6 overflow-y-auto z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Level Card - Glossy Metallic Multi-Glow */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b]/90 via-[#31103f]/90 to-[#1e112a]/95 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-pink-500/30 backdrop-blur-xl">
          {/* Internal Shimmer Accent */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-pink-500/40 to-purple-600/0 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-700 via-pink-600 to-sky-400 p-[1.5px] shadow-[0_0_12px_rgba(236,72,153,0.5)]">
                <div className="w-full h-full rounded-full bg-slate-950/80 flex items-center justify-center text-white text-lg font-bold">
                  K
                </div>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  Aawara.
                </h2>
                <div className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full bg-purple-950/70 border border-pink-400/40 shadow-[0_0_6px_rgba(236,72,153,0.2)]">
                  <span className="text-[9px] font-bold text-pink-200 bg-gradient-to-r from-pink-500 to-rose-500 px-1 rounded">ID</span>
                  <span className="text-[11px] text-pink-100 font-medium">100658242</span>
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center w-14 h-14">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/40 to-blue-500/40 blur-md rounded-full" />
              <ShaderImageBadge
                src="/1787590094184~2.jpg"
                isWhiteBg={false}
                className="w-24 h-24 object-contain"
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-sky-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] pointer-events-none">
                Lv.9
              </span>
            </div>
          </div>

          <div className="mt-3 relative z-10 space-y-1.5">
            <p className="text-[11px] text-pink-100/90 font-medium">
              {neededXP} needed for the next level.
            </p>
            <div className="w-full h-2.5 bg-black/60 rounded-full p-[1px] border border-white/20 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-rose-500 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.8)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-purple-200/90 font-mono">
              Lv.9 {currentXP}/{nextLevelXP}
            </p>
            <button className="mt-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-600/30 hover:from-pink-500/40 hover:to-purple-600/40 border border-pink-400/40 backdrop-blur-md text-[11px] font-semibold text-white shadow-[0_0_10px_rgba(236,72,153,0.3)] active:scale-95 transition-all">
              How to upgrade?
            </button>
          </div>
        </div>

        {/* Medal Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-pink-400 text-xs">✦</span>
            <h3 className="text-xs font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 uppercase">
              Level Medal
            </h3>
            <span className="text-purple-400 text-xs">✦</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {medalTiers.map((tier, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden bg-gradient-to-b from-[#251d38]/80 via-[#130f1e]/85 to-[#09070f]/95 rounded-xl p-2.5 flex flex-col items-center justify-center space-y-1 border border-pink-500/20 shadow-[0_4px_16px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)] hover:border-pink-400/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.35)] active:scale-95 transition-all cursor-pointer group"
              >
                {/* Shiny Specular Top Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <ShaderImageBadge
                  src={tier.imageSrc}
                  isWhiteBg={tier.isWhiteBg}
                  className="w-14 h-7 object-contain group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(236,72,153,0.25)]"
                />
                <span className="text-[10px] font-medium text-neutral-300 group-hover:text-pink-200">
                  {tier.range}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-rose-400 text-xs">✦</span>
            <h3 className="text-xs font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-300 to-blue-300 uppercase">
              Rewards
            </h3>
            <span className="text-blue-400 text-xs">✦</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {rewardLevels.map((reward, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden bg-gradient-to-b from-[#251d38]/80 via-[#130f1e]/85 to-[#09070f]/95 rounded-xl p-2.5 pt-3.5 flex flex-col items-center justify-between min-h-[95px] border border-purple-500/20 shadow-[0_4px_16px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)] hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] active:scale-95 transition-all cursor-pointer group"
              >
                {/* Shiny Specular Top Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border border-white/40 flex items-center justify-center shadow-[0_0_8px_rgba(236,72,153,0.6)]">
                  <span className="text-[8px] font-black text-white leading-none tracking-tight">
                    {reward.level}
                  </span>
                </div>
                <ShaderImageBadge
                  src={reward.imageSrc}
                  isWhiteBg={true}
                  className="w-9 h-9 object-contain group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(244,63,94,0.3)]"
                />
                <span className="text-[10px] font-bold text-neutral-100 mt-0.5 group-hover:text-pink-100">
                  {reward.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

