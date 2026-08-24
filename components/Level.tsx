'use client'

import React from 'react'
import { ChevronLeft, Shield, Sparkles } from 'lucide-react'

interface LevelProps {
  onBack?: () => void
}

interface MedalTier {
  range: string
  gradient: string
  badgeColor: string
  iconColor: string
}

const medalTiers: MedalTier[] = [
  { range: 'Lv.1~Lv.9', gradient: 'from-amber-900/60 to-amber-700/40', badgeColor: 'bg-amber-800/80', iconColor: 'text-amber-200' },
  { range: 'Lv.10~Lv.19', gradient: 'from-slate-400 to-slate-300', badgeColor: 'bg-slate-300', iconColor: 'text-slate-700' },
  { range: 'Lv.20~Lv.29', gradient: 'from-amber-500 to-yellow-400', badgeColor: 'bg-yellow-400', iconColor: 'text-amber-900' },
  { range: 'Lv.30~Lv.39', gradient: 'from-purple-400 to-indigo-300', badgeColor: 'bg-purple-300', iconColor: 'text-purple-900' },
  { range: 'Lv.40~Lv.49', gradient: 'from-fuchsia-600 to-purple-500', badgeColor: 'bg-fuchsia-400', iconColor: 'text-white' },
  { range: 'Lv.50~Lv.59', gradient: 'from-blue-600 to-indigo-500', badgeColor: 'bg-blue-400', iconColor: 'text-white' },
  { range: 'Lv.60~Lv.69', gradient: 'from-emerald-500 to-teal-400', badgeColor: 'bg-emerald-400', iconColor: 'text-emerald-950' },
  { range: 'Lv.70~Lv.79', gradient: 'from-rose-600 to-amber-500', badgeColor: 'bg-rose-400', iconColor: 'text-white' },
  { range: 'Lv.80~Lv.89', gradient: 'from-red-600 to-orange-500', badgeColor: 'bg-red-500', iconColor: 'text-yellow-200' },
  { range: 'Lv.90~Lv.99', gradient: 'from-teal-400 via-indigo-500 to-purple-600', badgeColor: 'bg-teal-300', iconColor: 'text-indigo-900' },
  { range: 'Lv.100~Lv.109', gradient: 'from-purple-700 via-pink-600 to-orange-500', badgeColor: 'bg-purple-400', iconColor: 'text-yellow-200' },
]

export default function Level({ onBack }: LevelProps) {
  const currentXP = 59692
  const nextLevelXP = 68414
  const neededXP = nextLevelXP - currentXP
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100)

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col font-sans select-none">
      {/* Top App Bar */}
      <div className="relative flex items-center justify-center px-4 py-4">
        <button
          onClick={onBack}
          className="absolute left-4 p-1 hover:bg-white/10 active:scale-95 rounded-full transition-all"
        >
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h1 className="text-lg font-semibold tracking-wide text-white">Level</h1>
      </div>

      <div className="flex-1 px-4 pb-8 space-y-4 overflow-y-auto">
        {/* Blue Theme Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-900 p-5 shadow-2xl border border-sky-400/20">
          {/* Subtle Glow Overlay */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-300/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            {/* User Details */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-400/30 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold shadow-inner backdrop-blur-md">
                K
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white leading-tight">Aawara.</h2>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-950/40 border border-sky-300/30 backdrop-blur-sm">
                  <span className="text-[10px] font-bold tracking-wider text-sky-200 bg-sky-500/40 px-1 rounded">ID</span>
                  <span className="text-xs text-sky-100 font-medium">100658242</span>
                </div>
              </div>
            </div>

            {/* Glowing Hexagonal Level Badge */}
            <div className="relative flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 bg-sky-400/30 blur-xl rounded-full animate-pulse" />
              
              {/* Outer Metallic Ring */}
              <div className="relative w-20 h-20 rounded-2xl rotate-45 bg-gradient-to-tr from-sky-400 via-blue-200 to-indigo-600 p-[3px] shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-blue-950 via-[#0a1835] to-slate-950 rounded-xl flex items-center justify-center border border-sky-300/50">
                  <div className="-rotate-45 flex flex-col items-center">
                    <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-cyan-400 tracking-tight">
                      Lv.9
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative Corner Sparks */}
              <Sparkles size={14} className="absolute top-1 right-1 text-sky-200 animate-bounce" />
            </div>
          </div>

          {/* Level Progress Section */}
          <div className="mt-3 relative z-10 space-y-1.5">
            <p className="text-xs text-sky-100/90 font-medium">
              {neededXP} needed for the next level.
            </p>

            {/* Progress Track */}
            <div className="w-full h-2.5 bg-blue-950/60 rounded-full p-[2px] border border-sky-400/20">
              <div
                className="h-full bg-gradient-to-r from-sky-300 via-cyan-400 to-blue-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.75)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-sky-200/80 font-mono pt-0.5">
              Lv.9 {currentXP}/{nextLevelXP}
            </p>

            <button className="mt-2 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md text-xs font-semibold text-white transition-all active:scale-95 shadow-sm">
              How to upgrade?
            </button>
          </div>
        </div>

        {/* Level Medals Dark Container */}
        <div className="rounded-3xl bg-[#0e1422] p-5 border border-white/5 space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sky-400 text-sm">✦</span>
            <h3 className="text-sm font-semibold tracking-wider text-sky-100 uppercase">
              Level Medal
            </h3>
            <span className="text-sky-400 text-sm">✦</span>
          </div>

          {/* Medals 3-Column Grid */}
          <div className="grid grid-cols-3 gap-3">
            {medalTiers.map((tier, idx) => (
              <div
                key={idx}
                className="bg-[#141b2d] rounded-2xl p-3.5 flex flex-col items-center justify-center space-y-2 border border-white/[0.04] hover:border-sky-500/30 transition-all cursor-pointer"
              >
                {/* Pill Medal Graphic */}
                <div
                  className={`w-14 h-6 rounded-full bg-gradient-to-r ${tier.gradient} p-0.5 flex items-center shadow-md`}
                >
                  <div
                    className={`w-5 h-5 rounded-full ${tier.badgeColor} flex items-center justify-center shadow-sm -ml-0.5 border border-white/40`}
                  >
                    <Shield size={10} className={tier.iconColor} />
                  </div>
                </div>

                <span className="text-[11px] font-medium text-slate-400">
                  {tier.range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

