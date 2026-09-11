'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, HelpCircle } from 'lucide-react'

interface LevelProps {
  onBack?: () => void
}

interface TierData {
  id: string
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
    id: 'tier-1',
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
    id: 'tier-2',
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
    id: 'tier-3',
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
    id: 'tier-4',
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
    id: 'tier-5',
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
    id: 'tier-6',
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
    id: 'tier-7',
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
    id: 'tier-8',
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
    id: 'tier-9',
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
    id: 'tier-10',
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
  const [activeTierIdx, setActiveTierIdx] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const tierSectionRefs = useRef<(HTMLDivElement | null)[]>([])

  const currentTier = tiersList[activeTierIdx] || tiersList[0]

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const containerTop = container.getBoundingClientRect().top
    const triggerPoint = containerTop + 140

    let active = 0
    tierSectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect()
        if (rect.top <= triggerPoint) {
          active = index
        }
      }
    })
    setActiveTierIdx(active)
  }

  return (
    <div className="relative w-full max-w-[440px] mx-auto h-screen bg-[#04060a] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* 1. TOP BACKGROUND IMAGE */}
      <div className="absolute top-0 left-0 w-full h-[280px] pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-top bg-cover bg-no-repeat"
          style={{ backgroundImage: "url('/file_00000000e02481f4bb2153e2714aca47.png')" }}
        />
        <div className="absolute -top-10 -left-10 w-[280px] h-[280px] bg-[#1d4ed8]/30 blur-[90px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#04060a]/40 to-[#04060a]" />
      </div>

      {/* 2. FIXED / PINNED TOP CONTAINER */}
      <div className="relative z-30 flex flex-col shrink-0 px-4">
        {/* Top App Bar */}
        <div
          className="flex items-center justify-center w-full px-2 pb-2 pt-2 bg-transparent relative"
          style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 8px))' }}
        >
          <button
            onClick={onBack}
            className="absolute left-0 p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer"
          >
            <ArrowLeft size={26} strokeWidth={2.5} className="text-white drop-shadow-md" />
          </button>

          <h1 className="text-xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Level
          </h1>

          <button className="absolute right-0 p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer">
            <HelpCircle size={24} strokeWidth={2.5} className="text-white drop-shadow-md" />
          </button>
        </div>

        {/* Top Image Card Frame */}
        <div className="relative -mt-3 -mx-4">
          <img
            src="/file_000000007044820ea729df406d1dc320.png"
            alt="Top Card Frame"
            className="w-full h-auto block"
          />

          <div className="absolute inset-0 z-10 flex items-center px-6 gap-3.5">
            {/* User Avatar */}
            <div className="relative shrink-0">
              <img
                src="/IMG-20260905-WA0078.jpg"
                alt="User"
                className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-[#e0b76e]/70"
              />
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-serif font-black text-[17px] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">
                  KāziR Khān
                </span>

                {/* Bina Card/Pill ke direct Badge Image */}
                <ShaderImageBadge
                  src="/1785137410522.png"
                  isWhiteBg={true}
                  className="w-6 h-6 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Progress Bar with Thumb Indicator */}
              <div className="relative w-full h-[6px] bg-white/25 rounded-full mt-2 overflow-visible">
                <div
                  className="h-full bg-gradient-to-r from-[#ffe072] to-[#f4b63f] rounded-full relative"
                  style={{ width: '38%' }}
                >
                  <span className="absolute -right-1.5 -top-[3px] w-3 h-3 bg-white rounded-full border-2 border-[#f4b63f] shadow-md" />
                </div>
              </div>

              {/* Remaining Points Text */}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10.5px] text-white/90 font-medium tracking-wide drop-shadow-sm">
                  4.5k/20.2k remaining to reach Level 5 &gt;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sticky Header: Screen Edge Chipki Image + Left Text + Right Graphic */}
        <div className="relative flex items-center justify-between w-full -mt-7 pb-1 min-h-[90px]">
          {/* Left Screen Corner se Chipki Hui Image */}
          <div className="absolute -top-3.5 -left-4 pointer-events-none z-20">
            <img
              src="/file_000000006688821197edc482e295d3fd.png"
              alt="Corner Tag"
              className="h-7 object-contain drop-shadow-md"
            />
          </div>

          {/* Left Side: Thoda Ouper Shifted + Chhota Font */}
          <div className="flex items-center gap-2 -mt-2 z-10">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="w-4 h-4 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3L4 11h5v9h6v-9h5L12 3z" />
              </svg>
              <div className="flex flex-col gap-0.5 mt-0.5">
                <div className="w-3.5 h-[1.5px] bg-white rounded-full" />
                <div className="w-2 h-[1.5px] bg-white rounded-full mx-auto" />
              </div>
            </div>

            <h2 className="text-white font-bold text-[14px] whitespace-nowrap tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              Update level to {currentTier.range}
            </h2>
          </div>

          {/* Right Floating Graphic */}
          <div className="shrink-0 -mr-2 -mt-4 z-10 transition-all duration-300">
            <img
              key={currentTier.rightGraphic}
              src={currentTier.rightGraphic}
              alt="Tier Graphic"
              className="w-[100px] h-[100px] object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200"
            />
          </div>
        </div>
      </div>

      {/* 3. SCROLLABLE SET SECTION */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 px-4 overflow-y-auto z-20 pb-24 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="flex flex-col gap-9">
          {tiersList.map((tier, tIdx) => (
            <div
              key={tier.id}
              ref={(el) => {
                tierSectionRefs.current[tIdx] = el
              }}
              className="w-full flex flex-col pt-1"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between w-full min-h-[60px] mb-2 px-1">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-white drop-shadow-md shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 4l-8 8h5v8h6v-8h5z" />
                  </svg>
                  <h3 className="text-white font-bold text-[14px] tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    Upgrade to level {tier.range}
                  </h3>
                </div>

                <div className="shrink-0 -mr-1">
                  <img
                    src={tier.rightGraphic}
                    alt={tier.range}
                    className="w-[60px] h-[60px] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2.5 w-full">
                {tier.features.map((item, fIdx) => (
                  <div
                    key={fIdx}
                    className="w-full relative overflow-hidden rounded-md border border-white/5 bg-gradient-to-r from-[#06080d] via-[#080d17] to-[#132c54]/45 px-3.5 py-3 flex items-center justify-between backdrop-blur-md transition-all duration-200 hover:to-[#173a70]/60 shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
                  >
                    <div className="flex flex-col justify-center z-10">
                      <span className="text-[13.5px] font-semibold text-white tracking-wide">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="text-[11px] text-gray-400 mt-0.5 font-normal">
                          {item.subtitle}
                        </span>
                      )}
                    </div>

                    {/* Right side items */}
                    <div className="flex items-center gap-2 shrink-0 z-10">
                      {item.isReward ? (
                        /* Bina kisi background card/border ke direct Coin Image + Text */
                        <div className="flex items-center gap-1.5">
                          <ShaderImageBadge
                            src="/file_00000000b2d481fd8cd233482dbeb9ef.png"
                            isWhiteBg={true}
                            className="w-6 h-6 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                          />
                          <span className="text-[13px] font-extrabold text-[#fcd34d] tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            {tier.coinsAmount}
                          </span>
                        </div>
                      ) : item.badgeText ? (
                        <div className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[#177488] to-[#1ea3b3] text-white font-bold text-[11px] shadow-sm flex items-center">
                          {item.badgeText}
                        </div>
                      ) : item.title === 'Room Send image' ? (
                        <div className="w-8 h-8 rounded-md bg-[#131f33] border border-blue-400/30 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-300"
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
                          className="w-9 h-6 object-contain"
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

