'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, HelpCircle, Plus, Star, X } from 'lucide-react'

interface MedalProps {
  onBack?: () => void
}

interface MedalItem {
  id: string
  name: string
  image: string
  stars: number
  category: 'achievement' | 'activity'
}

// 1. WebGL Background Shader (Deep Ultra Dark Base)
function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;

        float len = length(p);
        
        vec3 baseDark = vec3(0.005, 0.008, 0.02);
        vec3 faintGlow = vec3(0.01, 0.02, 0.06) * (0.4 / (len + 0.5));
        vec3 softStars = vec3(0.02, 0.04, 0.1) * sin(uv.y * 3.0 + u_time * 0.2);

        vec3 finalColor = baseDark + faintGlow + softStars * 0.1;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const posAttr = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(posAttr)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)

    const resUniform = gl.getUniformLocation(program, 'u_resolution')
    const timeUniform = gl.getUniformLocation(program, 'u_time')

    let animationFrameId: number
    const render = (time: number) => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resUniform, canvas.width, canvas.height)
      gl.uniform1f(timeUniform, time * 0.001)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />
}

// 2. Green Screen Removal Canvas
function ChromaKeyImage({ src, alt, isColorless = false }: { src: string; alt: string; isColorless?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (g > 75 && g > r * 1.3 && g > b * 1.3) {
          data[i + 3] = 0
        }
      }

      ctx.putImageData(imgData, 0, 0)
    }
  }, [src])

  return (
    <canvas
      ref={canvasRef}
      aria-label={alt}
      className={`w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-all ${
        isColorless ? 'grayscale brightness-110 contrast-125' : ''
      }`}
    />
  )
}

// 3. Golden Sparkle Star Component (Only For Fullscreen Modal)
function GoldenSparklesOverlay() {
  const sparkles = [
    { top: '15%', left: '22%', size: 28, delay: '0s', dur: '1.8s' },
    { top: '25%', left: '72%', size: 34, delay: '0.4s', dur: '2.1s' },
    { top: '42%', left: '18%', size: 26, delay: '0.9s', dur: '1.6s' },
    { top: '50%', left: '50%', size: 40, delay: '0.2s', dur: '2.4s' },
    { top: '38%', left: '78%', size: 30, delay: '0.7s', dur: '1.9s' },
    { top: '65%', left: '32%', size: 24, delay: '1.2s', dur: '1.7s' },
    { top: '60%', left: '68%', size: 32, delay: '0.5s', dur: '2.2s' },
    { top: '78%', left: '46%', size: 22, delay: '1.0s', dur: '1.5s' },
    { top: '30%', left: '40%', size: 20, delay: '1.4s', dur: '1.8s' },
    { top: '55%', left: '25%', size: 18, delay: '0.6s', dur: '2.0s' },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
      {/* Center Golden Warm Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/30 rounded-full blur-2xl animate-pulse" />

      {sparkles.map((sp, idx) => (
        <div
          key={idx}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-sparkle-twinkle"
          style={{
            top: sp.top,
            left: sp.left,
            animationDelay: sp.delay,
            animationDuration: sp.dur,
          }}
        >
          <svg
            width={sp.size}
            height={sp.size}
            viewBox="0 0 24 24"
            fill="none"
            className="drop-shadow-[0_0_8px_rgba(255,220,100,0.9)]"
          >
            <path
              d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z"
              fill="url(#goldGrad)"
            />
            <circle cx="12" cy="12" r="3" fill="#ffffff" />
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF9D2" />
                <stop offset="0.4" stopColor="#FACC15" />
                <stop offset="1" stopColor="#EAB308" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}
    </div>
  )
}

export default function Medal({ onBack }: MedalProps) {
  const [activeTab, setActiveTab] = useState<'achievement' | 'activity'>('activity')
  const [selectedMedal, setSelectedMedal] = useState<MedalItem | null>(null)

  const medals: MedalItem[] = [
    {
      id: '1',
      name: 'CP-TOP1',
      image: '/IMG_20260828_003941.png',
      stars: 0,
      category: 'activity',
    },
    {
      id: '2',
      name: 'CP-TOP2',
      image: '/IMG_20260828_003922.png',
      stars: 0,
      category: 'activity',
    },
    {
      id: '3',
      name: 'CP-TOP 3',
      image: '/IMG_20260828_003958.png',
      stars: 0,
      category: 'activity',
    },
    {
      id: '4',
      name: 'Pure Love',
      image: '/IMG_20260828_003941.png',
      stars: 0,
      category: 'activity',
    },
    {
      id: '5',
      name: 'VIP1',
      image: '/IMG_20260828_003922.png',
      stars: 4,
      category: 'activity',
    },
    {
      id: '6',
      name: 'VIP2',
      image: '/IMG_20260828_003958.png',
      stars: 4,
      category: 'activity',
    },
    {
      id: '7',
      name: 'VIP3',
      image: '/IMG_20260828_003941.png',
      stars: 4,
      category: 'activity',
    },
    {
      id: '8',
      name: 'Huna',
      image: '/IMG_20260828_003922.png',
      stars: 3,
      category: 'activity',
    },
    {
      id: '9',
      name: 'I LOVE YOU',
      image: '/IMG_20260828_003958.png',
      stars: 1,
      category: 'activity',
    },
  ]

  const filteredMedals = medals.filter((m) => m.category === activeTab)

  return (
    <div className="h-screen w-full text-white flex flex-col font-sans select-none relative overflow-hidden bg-[#02050e]">
      {/* 1. Base Dark WebGL Canvas */}
      <WebGLBackground />

      {/* 2. Top 50vh Background Image */}
      <div 
        className="fixed top-0 left-0 right-0 h-[50vh] pointer-events-none z-[1] bg-top bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('/IMG_20260829_163143.png')`,
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#02050e]/50 to-[#02050e]" />
      </div>

      {/* 3. FIXED TOP AREA */}
      <div className="relative z-10 flex-none w-full max-w-md mx-auto px-4 pt-11 pb-2 sm:pt-4">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={onBack}
            className="p-1 text-gray-200 hover:text-white transition-colors cursor-pointer drop-shadow-md"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-semibold text-white tracking-wide drop-shadow-md">Medal</h1>
          <button className="p-1 text-blue-200/90 hover:text-white transition-colors drop-shadow-md">
            <HelpCircle size={22} />
          </button>
        </div>

        {/* Current Medal Circular Slots 2x5 */}
        <div className="pt-2 pb-1">
          <div className="grid grid-cols-5 gap-2.5 px-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-full bg-[#0a2368]/50 border border-[#3b71ca]/40 flex items-center justify-center shadow-md shadow-black/60 hover:border-yellow-400/60 transition-all cursor-pointer backdrop-blur-sm"
              >
                <Plus size={20} className="text-blue-100 stroke-[2.2]" />
              </div>
            ))}
          </div>

          {/* Obtained Count */}
          <div className="flex items-center justify-center gap-1.5 mt-4 text-xs tracking-wide">
            <span className="text-gray-300 font-medium drop-shadow-sm">Obtained Medal(s): 0</span>
            <button className="text-yellow-400 font-semibold hover:underline cursor-pointer drop-shadow-sm">
              Check&gt;
            </button>
          </div>
        </div>

        {/* Sub Navigation Category Tabs */}
        <div className="flex items-center justify-center gap-12 pb-2 text-sm pt-2">
          {[
            { key: 'achievement', label: 'Achievements' },
            { key: 'activity', label: 'Activities' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'achievement' | 'activity')}
              className={`relative font-medium transition-colors flex flex-col items-center cursor-pointer ${
                activeTab === tab.key
                  ? 'text-white text-base font-semibold'
                  : 'text-blue-300/60 hover:text-blue-200 text-sm'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="w-5 h-[2.5px] bg-yellow-400 rounded-full mt-1 shadow-sm" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. SCROLLABLE AREA - ONLY CARD GRID SCROLLS */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-8 relative z-10 w-full max-w-md mx-auto scrollbar-thin scrollbar-thumb-blue-900/40">
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {filteredMedals.map((medal) => (
            <div
              key={medal.id}
              onClick={() => setSelectedMedal(medal)}
              className="relative bg-gradient-to-b from-[#0c3596] to-[#041a54] border border-[#2563eb]/40 rounded-2xl p-2.5 flex flex-col items-center justify-between text-center hover:border-yellow-400/60 active:scale-95 transition-all duration-200 shadow-lg shadow-black/70 cursor-pointer min-h-[160px]"
            >
              {/* Colorless Chrome/Silver Medal Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 my-auto flex items-center justify-center relative">
                <ChromaKeyImage src={medal.image} alt={medal.name} isColorless={true} />
              </div>

              {/* Stars Display */}
              {medal.stars > 0 && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {Array.from({ length: medal.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className="fill-yellow-400 text-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                    />
                  ))}
                </div>
              )}

              {/* Title */}
              <h3 className="text-[11px] sm:text-xs font-semibold text-white tracking-wide mt-1 line-clamp-1 drop-shadow-sm">
                {medal.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Center Modal with Smooth Zoom & Realistic Shine & Sparkles */}
      {selectedMedal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedMedal(null)}
        >
          <button 
            onClick={() => setSelectedMedal(null)}
            className="absolute top-12 sm:top-6 right-6 p-2 rounded-full bg-white/10 text-gray-200 hover:text-white transition-all z-50 cursor-pointer shadow-md"
          >
            <X size={24} />
          </button>

          <div 
            className="relative flex flex-col items-center justify-center text-center max-w-sm w-full animate-modal-zoom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Wrapper with Centered Shine & Golden Sparkles */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
              
              {/* Rotating Shiny Ray Effect behind medal */}
              <div className="absolute inset-0 -inset-10 -z-10 animate-spin-slow pointer-events-none flex items-center justify-center">
                <div 
                  className="w-full h-full rounded-full opacity-60"
                  style={{
                    background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.4) 0deg 8deg, transparent 8deg 24deg)'
                  }}
                />
                <div className="absolute inset-8 rounded-full bg-blue-400/25 blur-xl pointer-events-none" />
              </div>

              {/* Golden Sparkles Twinkling over the modal Medal */}
              <GoldenSparklesOverlay />

              {/* Modal Colored Medal Image with Shine Streak Overlay */}
              <div className="w-52 h-52 sm:w-60 sm:h-60 relative flex items-center justify-center overflow-hidden rounded-full animate-subtle-pulse z-10">
                <ChromaKeyImage src={selectedMedal.image} alt={selectedMedal.name} isColorless={false} />
                
                {/* Diagonal Metallic Shine Sweep Effect over Image */}
                <div className="absolute inset-0 pointer-events-none animate-shine-sweep">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-25" />
                </div>
              </div>
            </div>

            {/* Stars */}
            {selectedMedal.stars > 0 && (
              <div className="flex items-center gap-1.5 mt-2 mb-1">
                {Array.from({ length: selectedMedal.stars }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                  />
                ))}
              </div>
            )}

            {/* Medal Name */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider mt-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {selectedMedal.name}
            </h2>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalZoom {
          0% {
            opacity: 0;
            transform: scale(0.65) translateY(20px);
          }
          60% {
            transform: scale(1.05) translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes shineSweep {
          0% {
            transform: translateX(-150%) skewX(-25deg);
          }
          35%, 100% {
            transform: translateX(150%) skewX(-25deg);
          }
        }
        @keyframes subtlePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
        @keyframes sparkleTwinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.3) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(45deg);
          }
        }

        .animate-spin-slow {
          animation: spinSlow 14s linear infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-modal-zoom {
          animation: modalZoom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-shine-sweep {
          animation: shineSweep 2.8s infinite ease-in-out;
        }
        .animate-subtle-pulse {
          animation: subtlePulse 3s infinite ease-in-out;
        }
        .animate-sparkle-twinkle {
          animation: sparkleTwinkle ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

