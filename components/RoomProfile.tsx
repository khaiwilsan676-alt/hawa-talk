'use client'

import React, { useEffect, useState, useRef } from 'react'
import { 
  Copy, 
  AlertTriangle,
  AtSign,
  Heart,
  MessageCircle,
  Mic
} from 'lucide-react'
import WhiteColorRemovalShader from './WhiteColorRemovalShader'
import { getUser } from '../src/lib/googleSheets'

// ============ Green Color Removal Shader Component ============
const GreenColorRemovalShader = ({ 
  imageSrc, 
  className = "",
  style = {}
}: { 
  imageSrc: string
  className?: string
  style?: React.CSSProperties
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageSrc) return

    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.src = imageSrc

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (g > 100 && g > r * 1.3 && g > b * 1.3) {
          data[i + 3] = 0
        }
      }

      ctx.putImageData(imageData, 0, 0)
      setIsLoaded(true)
    }

    img.onerror = () => {
      console.warn("Failed to load green removal shader image:", imageSrc)
    }
  }, [imageSrc])

  return (
    <div className={`relative inline-block ${className}`} style={style}>
      {!isLoaded && (
        <img
          src={imageSrc}
          alt="loading"
          className="w-full h-full object-contain absolute inset-0"
        />
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

interface RoomProfileProps {
  user: {
    uid?: string
    id?: string
    accountId?: string
    name: string
    country?: string
    image?: string
  }
  onClose: () => void
  onMuteToggle?: () => void
  onLock?: () => void
  isRoomOwner?: boolean
  isSeatOwner?: boolean
  hasSeat?: boolean
  seatNumber?: number
}

// Country Options
const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
]

export default function RoomProfile({
  user,
  onClose,
  onMuteToggle,
  onLock,
  isRoomOwner = false,
  isSeatOwner = false,
  hasSeat = false,
  seatNumber
}: RoomProfileProps) {
  const [copied, setCopied] = useState(false)

  const displayAccountId = user.accountId || user.id || '100001'
  const displayCountry = user.country || '🇮🇳'

  // Tag states
  const [tags, setTags] = useState({
    adminTag: false,
    officialTag: false,
    vipTag: false,
    premiumTag: false,
  })

  // Fetch tags from Google Sheets
  useEffect(() => {
    const uid = user.uid || user.id || user.accountId
    if (!uid || uid === 'N/A' || uid === 'User') return

    const fetchTags = async () => {
      try {
        const res = await getUser(uid)
        const data = res && (res.user || res.data || res)
        if (data) {
          setTags({
            adminTag: Boolean(data.adminTag),
            officialTag: Boolean(data.officialTag),
            vipTag: Boolean(data.vipTag),
            premiumTag: Boolean(data.premiumTag),
          })
        }
      } catch (err) {
        console.error("Error fetching tags from Google Sheets:", err)
      }
    }

    fetchTags()
  }, [user])

  const copyId = () => {
    navigator.clipboard.writeText(displayAccountId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white/95 backdrop-blur-md w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Header Decoration */}
        <div className="h-24 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* User Content */}
        <div className="px-5 pb-5 pt-0 relative flex flex-col items-center text-center">

          {/* Avatar Container */}
          <div className="relative -mt-12 mb-2">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 relative">
              <img
                src={user.image || '/default-avatar.png'}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Tags Display */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap justify-center min-h-[32px]">
            {tags.adminTag && (
              <div className="h-8 relative inline-block">
                <GreenColorRemovalShader
                  imageSrc="/1788021461820~2.jpg"
                  className="h-full w-auto"
                />
              </div>
            )}
            {tags.officialTag && (
              <div className="h-8 relative inline-block">
                <GreenColorRemovalShader
                  imageSrc="/1788021468845~2.jpg"
                  className="h-full w-auto"
                />
              </div>
            )}
            {tags.vipTag && (
              <div className="h-8 relative inline-block">
                <WhiteColorRemovalShader
                  imageSrc="/1785469775751.png"
                  className="h-full w-auto"
                />
              </div>
            )}
            {tags.premiumTag && (
              <div className="h-8 relative inline-block">
                <WhiteColorRemovalShader
                  imageSrc="/1785469784333.png"
                  className="h-full w-auto"
                />
              </div>
            )}
          </div>

          {/* User Name & Country */}
          <div className="flex items-center gap-1.5 justify-center mb-1">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">
              {user.name}
            </h2>
            <span className="text-base">{displayCountry}</span>
          </div>

          {/* ID with Copy */}
          <button
            onClick={copyId}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-[11px] font-medium transition mb-4 cursor-pointer"
          >
            <span>ID: {displayAccountId}</span>
            <Copy className="w-3 h-3" />
            {copied && <span className="text-green-600 font-bold ml-1">Copied!</span>}
          </button>

          {/* Action Buttons Row 1 (Socials) */}
          <div className="grid grid-cols-3 gap-2 w-full mb-3">
            <button className="flex items-center justify-center gap-1 py-2 px-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl text-xs font-semibold transition cursor-pointer">
              <Heart className="w-3.5 h-3.5" />
              <span>Follow</span>
            </button>
            <button className="flex items-center justify-center gap-1 py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold transition cursor-pointer">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
            <button className="flex items-center justify-center gap-1 py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl text-xs font-semibold transition cursor-pointer">
              <AtSign className="w-3.5 h-3.5" />
              <span>@ Mention</span>
            </button>
          </div>

          {/* Action Buttons Row 2 (Seat Controls if Room/Seat Owner) */}
          {(isRoomOwner || isSeatOwner) && hasSeat && (
            <div className="grid grid-cols-2 gap-2 w-full mb-3 border-t border-slate-100 pt-3">
              {onMuteToggle && (
                <button
                  onClick={onMuteToggle}
                  className="flex items-center justify-center gap-1 py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Mute Mic</span>
                </button>
              )}
              {onLock && (
                <button
                  onClick={onLock}
                  className="flex items-center justify-center gap-1 py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Lock Seat</span>
                </button>
              )}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
