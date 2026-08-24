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
  { range: 'Lv.1~Lv.10', imageSrc: '/1785137410522.png', isWhiteBg: true },
  { range: 'Lv.11~Lv.20', imageSrc: '/1787573593167~2.jpg', isWhiteBg: false },
  { range: 'Lv.21~Lv.30', imageSrc: '/1787573599045~2.jpg', isWhiteBg: false },
  { range: 'Lv.31~Lv.40', imageSrc: '/1787573616413~2.jpg', isWhiteBg: false },
  { range: 'Lv.41~Lv.50', imageSrc: '/1787573621768~2.jpg', isWhiteBg: false },
  { range: 'Lv.51~Lv.60', imageSrc: '/1787573610638~2.jpg', isWhiteBg: false },
  { range: 'Lv.61~Lv.70', imageSrc: '/1787573604873~2.jpg', isWhiteBg: false },
  { range: 'Lv.71~Lv.80', imageSrc: '/1787573627153~2.jpg', isWhiteBg: false },
  { range: 'Lv.81~Lv.90', imageSrc: '/1787573633612~2.jpg', isWhiteBg: false },
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
            const isNeutral = (maxVal - minVal) < 30

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
      className="w-16 h-8 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:scale-110"
    />
  )
}

export default function Level({ onBack }: LevelProps) {
  const currentXP = 59692
  const nextLevelXP = 68414
  const neededXP = nextLevelXP - currentXP
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none relative overflow-hidden">
      {/* TOP 25vh: Glossy Blue Mixing into Black */}
      <div className="h-[25vh] w-full bg-gradient-to-b from-[#0e2a5c] via-[#081736] to-transparent relative px-4 pt-3 flex flex-col justify-between shrink-0">
        {/* Glossy Radial Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-sky-500/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/25 blur-2xl pointer-events-none rounded-full" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-center">
          <button
            onClick={onBack}
            className="absolute left-0 p-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer"
          >
            <ChevronLeft size={26} className="text-white" />
          </button>
          <h1 className="text-base font-semibold tracking-wide text-white">Level</h1>
        </div>

        {/* Compact Glossy Blue Card */}
        <div className="relative z-10 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/80 via-sky-900/60 to-indigo-950/80 backdrop-blur-xl p-3.5 shadow-[0_4px_25px_rgba(14,165,233,0.15)] border border-sky-400/25 mb-1">
          <div className="flex items-center justify-between">
            {/* User Profile */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-sky-400/20 border border-sky-300/40 flex items-center justify-center text-white text-base font-bold shadow-inner">
                K
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">Aawara.</h2>
                <div className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full bg-black/40 border border-sky-400/30 backdrop-blur-sm">
                  <span className="text-[9px] font-bold text-sky-300 bg-sky-500/30 px-1 rounded">ID</span>
                  <span className="text-[10px] text-sky-100 font-medium">100658242</span>
                </div>
              </div>
            </div>

            {/* Glowing Lv.9 Badge */}
            <div className="relative flex items-center justify-center w-14 h-14">
              <div className="absolute inset-0 bg-sky-400/20 blur-md rounded-full" />
              <div className="relative w-12 h-12 rounded-xl rotate-45 bg-gradient-to-tr from-sky-400 via-blue-300 to-indigo-600 p-[1.5px] shadow-md">
                <div className="w-full h-full bg-gradient-to-br from-[#0b1c40] to-[#040a18] rounded-[10px] flex items-center justify-center border border-sky-300/40">
                  <span className="-rotate-45 text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-cyan-300">
                    Lv.9
                  </span>
                </div>
              </div>
              <Sparkles size={10} className="absolute -top-0.5 right-0 text-sky-200 animate-pulse" />
            </div>
          </div>

          {/* Progress Section */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-sky-200/90">{neededXP} needed for the next level.</span>
              <span className="text-sky-300/80 font-mono">Lv.9 {currentXP}/{nextLevelXP}</span>
            </div>

            <div className="w-full h-1.5 bg-black/60 rounded-full p-[1px] border border-sky-400/20">
              <div
                className="h-full bg-gradient-to-r from-sky-300 via-cyan-400 to-blue-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.7)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* LOWER 75vh: Pure Pitch Black Sheet */}
      <div className="h-[75vh] w-full bg-black px-4 pt-3 pb-6 flex flex-col space-y-3 overflow-y-auto">
        {/* Section Heading */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-sky-400 text-xs">✦</span>
          <h3 className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
            Level Medal
          </h3>
          <span className="text-sky-400 text-xs">✦</span>
        </div>

        {/* 3-Column Medals Grid on Pure Black */}
        <div className="grid grid-cols-3 gap-2.5 pb-4">
          {medalTiers.map((tier, idx) => (
            <div
              key={idx}
              className="bg-[#0b0f17] rounded-2xl p-3 flex flex-col items-center justify-center space-y-1.5 border border-white/[0.06] hover:border-sky-500/40 hover:bg-[#111724] transition-all cursor-pointer group"
            >
              <div className="h-8 flex items-center justify-center">
                <ShaderImageBadge
                  src={tier.imageSrc}
                  isWhiteBg={tier.isWhiteBg}
                />
              </div>

              <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200">
                {tier.range}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

