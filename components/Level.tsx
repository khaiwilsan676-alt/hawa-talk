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

const medalTiers: MedalTier[] = [
  { range: 'Lv.1-10', imageSrc: '/1785137410522.png', isWhiteBg: true },
  { range: 'Lv.11-20', imageSrc: '/1787573593167~2.jpg', isWhiteBg: false },
  { range: 'Lv.21-30', imageSrc: '/1787573599045~2.jpg', isWhiteBg: false },
  { range: 'Lv.31-40', imageSrc: '/1787573616413~2.jpg', isWhiteBg: false },
  { range: 'Lv.41-50', imageSrc: '/1787586493548~2.jpg', iswhiteBg: false }, 
  { range: 'Lv.51-60', imageSrc: '/1787573621768~2.jpg', isWhiteBg: false },
  { range: 'Lv.61-70', imageSrc: '/1787586465659~2.jpg', isWhiteBg: false },
  { range: 'Lv.71-80', imageSrc: '/1787573604873~2.jpg', isWhiteBg: false },
  { range: 'Lv.81-90', imageSrc: '/1787573627153~2.jpg', isWhiteBg: false },
  { range: 'Lv.91-100', imageSrc: '/1787573633612~2.jpg', isWhiteBg: false },
]

function ShaderImageBadge({ src, isWhiteBg }: { src: string; isWhiteBg: boolean }) {
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
      className="w-16 h-8 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:scale-110"
    />
  )
}

export default function Level({ onBack }: LevelProps) {
  const currentXP = 59692
  const nextLevelXP = 68414
  const neededXP = nextLevelXP - currentXP
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100)

  return (
    <div className="relative w-full max-w-[440px] mx-auto min-h-screen bg-[#000000] text-white flex flex-col font-sans select-none overflow-x-hidden shadow-2xl">
      {/* 5vh Top Glossy Blue Shine */}
      <div className="absolute top-0 left-0 right-0 h-[5vh] pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0088ff]/40 via-[#0055ff]/15 to-transparent blur-md" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1.5px] bg-gradient-to-r from-transparent via-[#60a5fa] to-transparent shadow-[0_0_12px_#38bdf8]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-center px-4 pt-3 pb-2">
        <button
          onClick={onBack}
          className="absolute left-3 p-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h1 className="text-base font-semibold tracking-wide text-white">Level</h1>
      </div>

      {/* Main Scroll Content */}
      <div className="flex-1 px-4 pb-8 space-y-4 overflow-y-auto z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Blue Level Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e4db7] via-[#1560bd] to-[#0d2a6b] h-[140px] p-4 shadow-xl border border-sky-400/20">
          <div className="relative z-10 flex items-center justify-between">
            {/* User Profile */}
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-full bg-slate-500/40 border border-white/40 flex items-center justify-center text-white text-lg font-bold shadow-inner">
                K
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">Aawara.</h2>
                <div className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full bg-blue-950/60 border border-sky-400/30">
                  <span className="text-[9px] font-bold text-sky-200 bg-sky-500/40 px-1 rounded">ID</span>
                  <span className="text-[11px] text-sky-100 font-medium">100658242</span>
                </div>
              </div>
            </div>

            {/* Glowing Badge */}
            <div className="relative flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 bg-sky-400/25 blur-md rounded-full" />
              <div className="relative w-14 h-14 rounded-xl rotate-45 bg-gradient-to-tr from-sky-400 via-blue-200 to-indigo-600 p-[2px] shadow-md">
                <div className="w-full h-full bg-gradient-to-br from-[#0b1c40] to-[#040a18] rounded-[10px] flex items-center justify-center border border-sky-300/40">
                  <span className="-rotate-45 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-cyan-300">
                    Lv.9
                  </span>
                </div>
              </div>
              <Sparkles size={11} className="absolute -top-1 right-0 text-sky-200 animate-pulse" />
            </div>
          </div>

          {/* Progress Section */}
          <div className="mt-2.5 relative z-10 space-y-1">
            <p className="text-[11px] text-sky-100/90">
              {neededXP} needed for the next level.
            </p>

            <div className="w-full h-2 bg-blue-950/80 rounded-full p-[1px] border border-sky-400/20">
              <div
                className="h-full bg-gradient-to-r from-sky-300 via-cyan-400 to-blue-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.7)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[10px] text-sky-200/80 font-mono">
              Lv.9 {currentXP}/{nextLevelXP}
            </p>

            <button className="mt-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md text-[11px] font-medium text-white active:scale-95 transition-all">
              How to upgrade?
            </button>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <span className="text-sky-400 text-xs">✦</span>
          <h3 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Level Medal
          </h3>
          <span className="text-sky-400 text-xs">✦</span>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {medalTiers.map((tier, idx) => (
            <div
              key={idx}
              className="bg-[#0e0e11] rounded-2xl p-3 flex flex-col items-center justify-center space-y-1.5 border border-white/[0.08] active:scale-95 transition-all cursor-pointer group"
            >
              <div className="h-8 flex items-center justify-center">
                <ShaderImageBadge
                  src={tier.imageSrc}
                  isWhiteBg={tier.isWhiteBg}
                />
              </div>

              <span className="text-[11px] font-medium text-neutral-400 group-hover:text-neutral-200">
                {tier.range}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

