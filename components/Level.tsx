'use client'

import React, { useEffect, useRef } from 'react'
import { ChevronLeft, Sparkles } from 'lucide-react'

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
      className={`${className} drop-shadow-[0_6px_14px_rgba(0,0,0,0.8)] transition-transform duration-300`}
    />
  )
}

export default function Level({ onBack }: LevelProps) {
  const currentXP = 59692
  const nextLevelXP = 68414
  const neededXP = nextLevelXP - currentXP
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100)

  return (
    <div className="relative w-full max-w-[440px] mx-auto min-h-screen bg-[#05030a] text-white flex flex-col font-sans select-none overflow-x-hidden shadow-[0_0_80px_rgba(168,85,247,0.25)] border-x border-white/5">
      
      {/* Dynamic Vivid Light Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Electric Cyan Beacon */}
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-[#00d2ff]/30 rounded-full blur-[90px]" />
        {/* Intense Hot Pink / Fuchsia Flare */}
        <div className="absolute top-[28%] -right-20 w-96 h-96 bg-[#ff007f]/25 rounded-full blur-[100px]" />
        {/* Deep Royal Purple Center Aura */}
        <div className="absolute top-[52%] -left-10 w-96 h-96 bg-[#7928ca]/30 rounded-full blur-[110px]" />
        {/* Bottom Laser Sky Glow */}
        <div className="absolute -bottom-10 right-0 w-80 h-80 bg-[#3b82f6]/25 rounded-full blur-[90px]" />
      </div>

      {/* Gloss Top Beam */}
      <div className="absolute top-0 left-0 right-0 h-36 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-600/40 via-purple-600/20 to-transparent blur-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1.5px] bg-gradient-to-r from-transparent via-[#00f2fe] via-[#ff007f] to-transparent shadow-[0_0_25px_#00f2fe]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-3 mb-4">
        <button
          onClick={onBack}
          className="p-2.5 bg-gradient-to-b from-white/15 to-white/5 border border-white/20 hover:border-pink-400/50 active:scale-90 rounded-2xl backdrop-blur-xl transition-all shadow-[0_4px_15px_rgba(0,0,0,0.5)] cursor-pointer"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-1.5">
          <Sparkles size={15} className="text-pink-400 animate-pulse" />
          <h1 className="text-base font-black tracking-widest bg-gradient-to-r from-[#ffffff] via-[#ffd6f6] to-[#a5f3fc] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(255,255,255,0.6)]">
            LEVEL SYSTEM
          </h1>
          <Sparkles size={15} className="text-cyan-400 animate-pulse" />
        </div>
        <div className="w-9" />
      </div>

      {/* Main Scroll Content */}
      <div className="flex-1 px-4 pt-1 pb-10 space-y-6 overflow-y-auto z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* VIP Level Card - Metallic Glass Morphism */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1138]/95 via-[#23093b]/90 to-[#0e1b4d]/95 p-4 shadow-[0_12px_40px_rgba(255,0,128,0.25)] border border-pink-400/40 backdrop-blur-2xl group">
          {/* Glass Gloss Shimmer Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-pink-500/40 to-cyan-400/30 blur-2xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff007f] via-[#7928ca] to-[#00d2ff] p-[2px] shadow-[0_0_15px_rgba(255,0,128,0.5)]">
                  <div className="w-full h-full rounded-[14px] bg-[#0c0919] flex items-center justify-center text-white text-lg font-black tracking-wider">
                    K
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                  Aawara.
                </h2>
                <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/20 shadow-inner backdrop-blur-md">
                  <span className="text-[9px] font-black text-white bg-gradient-to-r from-[#ff007f] to-[#7928ca] px-1.5 py-[1px] rounded-full shadow-sm">
                    UID
                  </span>
                  <span className="text-[11px] text-cyan-200 font-mono font-semibold tracking-wide">
                    100658242
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/50 via-fuchsia-500/50 to-purple-600/50 blur-lg rounded-full animate-pulse" />
              <ShaderImageBadge
                src="/1787590094184~2.jpg"
                isWhiteBg={false}
                className="w-24 h-24 object-contain"
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-cyan-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] pointer-events-none">
                Lv.9
              </span>
            </div>
          </div>

          <div className="mt-4 relative z-10 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-semibold">
              <span className="text-pink-200/90 drop-shadow-sm">
                Next Rank Target
              </span>
              <span className="text-cyan-300 font-mono">
                {neededXP.toLocaleString()} XP left
              </span>
            </div>

            {/* Glowing Dual Progress Bar */}
            <div className="relative w-full h-2.5 bg-black/70 rounded-full p-[1.5px] border border-white/20 shadow-inner overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f2fe] via-[#ff0844] to-[#f355da] rounded-full shadow-[0_0_15px_rgba(255,0,128,0.9)] transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-purple-200 font-mono">
                Lv.9 [{currentXP.toLocaleString()}/{nextLevelXP.toLocaleString()}]
              </span>
              <button className="px-3.5 py-1 rounded-full bg-gradient-to-r from-white/20 via-pink-500/20 to-purple-500/20 hover:from-white/30 hover:to-pink-500/40 border border-white/30 backdrop-blur-md text-[10px] font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] active:scale-95 transition-all">
                Upgrade Rules ↗
              </button>
            </div>
          </div>
        </div>

        {/* Level Medal Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-pink-500" />
            <h3 className="text-xs font-black tracking-widest bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent uppercase drop-shadow-[0_2px_8px_rgba(255,0,128,0.4)]">
              Honor Medals
            </h3>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-500" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {medalTiers.map((tier, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#19142b]/95 via-[#110d1f]/90 to-[#090712]/95 p-3 flex flex-col items-center justify-center space-y-1.5 border border-white/10 hover:border-pink-500/60 shadow-[0_8px_24px_rgba(0,0,0,0.7)] hover:shadow-[0_0_20px_rgba(255,0,128,0.3)] active:scale-95 transition-all duration-300 cursor-pointer group backdrop-blur-md"
              >
                {/* Shiny Edge Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-pink-500/60 via-cyan-400/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/[0.08] via-purple-500/[0.08] to-cyan-500/[0.08] opacity-0 group-hover:opacity-100 transition-opacity" />

                <ShaderImageBadge
                  src={tier.imageSrc}
                  isWhiteBg={tier.isWhiteBg}
                  className="w-14 h-8 object-contain group-hover:scale-110"
                />
                <span className="text-[10px] font-bold text-neutral-300 group-hover:text-cyan-200 transition-colors tracking-tight">
                  {tier.range}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-purple-500" />
            <h3 className="text-xs font-black tracking-widest bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent uppercase drop-shadow-[0_2px_8px_rgba(0,210,255,0.4)]">
              Level Perks & Rewards
            </h3>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-purple-500" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {rewardLevels.map((reward, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#19142b]/95 via-[#110d1f]/90 to-[#090712]/95 p-2.5 pt-4 flex flex-col items-center justify-between min-h-[102px] border border-white/10 hover:border-cyan-400/60 shadow-[0_8px_24px_rgba(0,0,0,0.7)] hover:shadow-[0_0_20px_rgba(0,210,255,0.3)] active:scale-95 transition-all duration-300 cursor-pointer group backdrop-blur-md"
              >
                {/* Shiny Edge Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 via-purple-500/60 to-transparent" />

                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ff007f] via-[#7928ca] to-[#00d2ff] p-[1px] shadow-[0_0_12px_rgba(255,0,128,0.6)]">
                  <div className="px-1.5 py-[1px] rounded-full bg-black/80 backdrop-blur-sm">
                    <span className="text-[8px] font-black text-pink-200 leading-none">
                      {reward.level}
                    </span>
                  </div>
                </div>

                <ShaderImageBadge
                  src={reward.imageSrc}
                  isWhiteBg={true}
                  className="w-10 h-10 object-contain group-hover:scale-110 drop-shadow-[0_4px_12px_rgba(255,0,128,0.4)]"
                />
                
                <span className="text-[11px] font-black bg-gradient-to-r from-white via-pink-100 to-cyan-100 bg-clip-text text-transparent mt-1">
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

