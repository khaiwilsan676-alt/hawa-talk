'use client'

import React, { useEffect, useRef } from 'react'
import { ArrowLeft, HelpCircle } from 'lucide-react'

interface LevelProps {
  onBack?: () => void
}

interface TierData {
  range: string
  rightGraphic: string
  medalBadgeSrc: string
  isWhiteBg: boolean
  coinsAmount?: string
  features: {
    title: string
    subtitle?: string
    badgeText?: string
    isReward?: boolean
  }[]
}

const tiersList: TierData[] = [
  {
    range: 'Lv.1 - Lv.10',
    rightGraphic: '/IMG_20260911_230430.png',
    medalBadgeSrc: '/1785137410522.png',
    isWhiteBg: true,
    coinsAmount: '5,00,000',
    features: [
      { title: 'Level 1-10', subtitle: 'Level badge upgraded' },
      { title: 'Special Entry Tag', badgeText: 'Entry Tag' },
      { title: 'Special Label', badgeText: '10' },
      { title: 'Reward Coins', isReward: true },
      { title: 'Room Send image' },
    ],
  },
  {
    range: 'Lv.11 - Lv.20',
    rightGraphic: '/IMG_20260911_230448.png',
    medalBadgeSrc: '/1787573593167~2.jpg',
    isWhiteBg: false,
    coinsAmount: '14,50,000',
    features: [
      { title: 'Level 11-20', subtitle: 'Level badge upgraded' },
      { title: 'Special Entry Tag', badgeText: 'Entry Tag' },
      { title: 'Special Label', badgeText: '20' },
      { title: 'Reward Coins', isReward: true },
      { title: 'Room Send image' },
    ],
  },
  {
    range: 'Lv.21 - Lv.30',
    rightGraphic: '/IMG_20260911_230538.png',
    medalBadgeSrc: '/1787573599045~2.jpg',
    isWhiteBg: false,
    coinsAmount: '20,00,000',
    features: [
      { title: 'Level 21-30', subtitle: 'Level badge upgraded' },
      { title: 'Special Entry Tag', badgeText: 'Entry Tag' },
      { title: 'Special Label', badgeText: '30' },
      { title: 'Reward Coins', isReward: true },
      { title: 'Room Send image' },
    ],
  },
  {
    range: 'Lv.31 - Lv.40',
    rightGraphic: '/IMG_20260911_230602.png',
    medalBadgeSrc: '/1787573616413~2.jpg',
    isWhiteBg: false,
    coinsAmount: '26,75,000',
    features: [
      { title: 'Level 31-40', subtitle: 'Level badge upgraded' },
      { title: 'Special Entry Tag', badgeText: 'Entry Tag' },
      { title: 'Special Label', badgeText: '40' },
      { title: 'Reward Coins', isReward: true },
      { title: 'Room Send image' },
    ],
  },
  {
    range: 'Lv.41 - Lv.50',
    rightGraphic: '/IMG_20260911_230631.png',
    medalBadgeSrc: '/1787586493548~2.jpg',
    isWhiteBg: false,
    coinsAmount: '30,56,000',
    features: [
      { title: 'Level 41-50', subtitle: 'Level badge upgraded' },
      { title: 'Special Entry Tag', badgeText: 'Entry Tag' },
      { title: 'Special Label', badgeText: '50' },
      { title: 'Reward Coins', isReward: true },
      { title: 'Room Send image' },
    ],
  },
  {
    range: 'Lv.51 - Lv.60',
    rightGraphic: '/IMG_20260911_230722.png',
    medalBadgeSrc: '/1787573621768~2.jpg',
    isWhiteBg: false,
    coinsAmount: '34,00,000',
    features: [
      { title: 'Level 51-60', subtitle: 'Level badge upgraded' },
      { title: 'Special Entry Tag', badgeText: 'Entry Tag' },
      { title: 'Special Label', badgeText: '60' },
      { title: 'Reward Coins', isReward: true },
      { title: 'Room Send image' },
    ],
  },
  {
    range: 'Lv.61 - Lv.70',
    rightGraphic: '/IMG_20260911_230739.png',
    medalBadgeSrc: '/1787586465659~2.jpg',
    isWhiteBg: false,
    coinsAmount: '40,50,000',
    features: [
      { title: 'Level 61-70', subtitle: 'Level badge upgraded' },
      { title: 'Special Entry Tag', badgeText: 'Entry Tag' },
      { title: 'Special Label', badgeText: '70' },
      { title: 'Reward Coins', isReward: true },
      { title: 'Room Send image' },
    ],
  },
  {
    range: 'Lv.71 - Lv.80',
    rightGraphic: '/IMG_20260911_230808.png',
    medalBadgeSrc: '/1787573604873~2.jpg',
    isWhiteBg: false,
    coinsAmount: '47,67,000',
    features: [
      { title: 'Level 71-80', subtitle: 'Level badge upgraded' },
      { title: 'Special Entry Tag', badgeText: 'Entry Tag' },
      { title: 'Special Label', badgeText: '80' },
      { title: 'Reward Coins', isReward: true },
      { title: 'Room Send image' },
    ],
  },
  {
    range: 'Lv.81 - Lv.90',
    rightGraphic: '/IMG_20260911_230826.png',
    medalBadgeSrc: '/1787573627153~2.jpg',
    isWhiteBg: false,
    coinsAmount: '57,00,000',
    features: [
      { title: 'Level 81-90', subtitle: 'Level badge upgraded' },
      { title: 'Special Entry Tag', badgeText: 'Entry Tag' },
      { title: 'Special Label', badgeText: '90' },
      { title: 'Reward Coins', isReward: true },
      { title: 'Room Send image' },
    ],
  },
  {
    range: 'Lv.91 - Lv.100',
    rightGraphic: '/file_00000000b06081fabde2d7eac02ce8c2.png',
    medalBadgeSrc: '/1787573633612~2.jpg',
    isWhiteBg: false,
    coinsAmount: '90,99,999',
    features: [
      { title: 'Level 91-100', subtitle: 'Level badge upgraded' },
      { title: 'Special Entry Tag', badgeText: 'Entry Tag' },
      { title: 'Special Label', badgeText: '100' },
      { title: 'Reward Coins', isReward: true },
      { title: 'Room Send image' },
    ],
  },
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
    <div className="relative w-full max-w-[440px] mx-auto min-h-screen bg-[#050505] text-white flex flex-col font-sans select-none overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Top Left Deep Blue Glow */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[120px] -left-[100px] w-[450px] h-[450px] bg-[#1a4a8d] opacity-35 blur-[120px] rounded-full"></div>
      </div>

      {/* Background Image Top Overlay */}
      <div className="absolute top-0 left-0 w-full h-[40vh] pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-top bg-cover bg-no-repeat opacity-20 mix-blend-screen"
          style={{ backgroundImage: "url('/file_00000000e02481f4bb2153e2714aca47.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
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

      {/* Main Flow Content */}
      <div className="flex-1 px-4 flex flex-col pb-16 z-10 relative">
        {/* Top Profile Card */}
        <div className="relative -mt-7 z-20 -mx-4">
          <img
            src="/file_000000007044820ea729df406d1dc320.png"
            alt="Top Card"
            className="w-full h-auto block"
          />
          <div className="absolute inset-0 z-10 flex items-center px-4 gap-3">
            <img
              src="/IMG-20260905-WA0078.jpg"
              alt="User"
              className="w-10 h-10 rounded-full object-cover shadow-lg"
            />
            <span className="text-white font-bold text-[17px] tracking-wide drop-shadow-md">
              KāziR Khān
            </span>
          </div>
        </div>

        {/* --- SET WISE LEVEL TIERS (1-10 to 91-100) --- */}
        <div className="flex flex-col gap-10 mt-3">
          {tiersList.map((tier, tIdx) => (
            <div key={tIdx} className="w-full relative flex flex-col">
              {/* Corner Tag / Badge image right above the title in the very first tier */}
              {tIdx === 0 && (
                <div className="-mb-1 self-start pointer-events-none">
                  <img
                    src="/file_000000006688821197edc482e295d3fd.png"
                    alt="Badge Tag"
                    className="h-7 object-contain drop-shadow-md"
                  />
                </div>
              )}

              {/* Set Header with Upgrade Arrow & Right Top Badge Graphic */}
              <div className="flex items-center justify-between w-full relative min-h-[70px] mb-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-white drop-shadow-md shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 4l-8 8h5v8h6v-8h5z" />
                  </svg>
                  <h2 className="text-white font-extrabold text-[17px] tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    Upgrade to level {tier.range}
                  </h2>
                </div>

                <div className="shrink-0 -mr-1">
                  <img
                    src={tier.rightGraphic}
                    alt={tier.range}
                    className="w-[100px] h-[100px] object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>

              {/* Stacked Cards for This Set */}
              <div className="flex flex-col gap-2.5 w-full">
                {tier.features.map((item, fIdx) => (
                  <div
                    key={fIdx}
                    className="w-full bg-[#121c17]/90 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between backdrop-blur-md transition-all duration-200 hover:bg-[#16241e]"
                  >
                    <div className="flex items-start gap-2.5">
                      {item.subtitle ? (
                        <div className="mt-1 w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_#f59e0b]" />
                      ) : null}
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-white tracking-wide">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="text-[11px] text-gray-400 mt-0.5 font-medium">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Action / Asset details per card */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.isReward ? (
                        <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                          <ShaderImageBadge
                            src="/file_00000000b2d481fd8cd233482dbeb9ef.png"
                            isWhiteBg={true}
                            className="w-4 h-4 object-contain"
                          />
                          <span className="text-[12px] font-bold text-amber-300">
                            {tier.coinsAmount}
                          </span>
                        </div>
                      ) : item.badgeText ? (
                        <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 text-black font-extrabold text-[11px] shadow-sm flex items-center gap-1">
                          {item.badgeText}
                        </div>
                      ) : item.title === 'Room Send image' ? (
                        <div className="w-8 h-8 rounded-lg bg-[#b48348]/20 border border-[#b48348]/40 flex items-center justify-center shadow-inner">
                          <svg
                            className="w-4 h-4 text-[#d8a867]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      ) : (
                        <ShaderImageBadge
                          src={tier.medalBadgeSrc}
                          isWhiteBg={tier.isWhiteBg}
                          className="w-10 h-7 object-contain"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

