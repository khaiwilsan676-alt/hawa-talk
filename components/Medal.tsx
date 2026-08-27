'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Plus, Star, X } from 'lucide-react'

interface MedalProps {
  onBack?: () => void
}

interface MedalItem {
  id: string
  name: string
  image: string
  stars: number
  category: 'achievement' | 'gift' | 'activity'
}

// 1. WebGL Dynamic Background Nebula Shader
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
        float angle = atan(p.y, p.x);
        
        float glow = sin(len * 3.0 - u_time * 0.8) + sin(angle * 4.0 + u_time * 0.5);
        vec3 color = vec3(0.04, 0.01, 0.09);
        
        vec3 purpleGlow = vec3(0.18, 0.05, 0.35) * (0.5 / (len + 0.3));
        vec3 goldAccent = vec3(0.25, 0.15, 0.02) * exp(-len * 2.5);

        color += purpleGlow * (0.8 + 0.2 * glow);
        color += goldAccent;

        gl_FragColor = vec4(color, 1.0);
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

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none -z-10" />
}

// 2. Realtime Green Screen Removal Canvas
function ChromaKeyImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
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

        // Green Screen removal threshold
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
      className={`w-full h-full object-contain ${className}`}
    />
  )
}

export default function Medal({ onBack }: MedalProps) {
  const [activeTab, setActiveTab] = useState<'achievement' | 'gift' | 'activity'>('achievement')
  const [selectedMedal, setSelectedMedal] = useState<MedalItem | null>(null)

  const medals: MedalItem[] = [
    {
      id: '1',
      name: 'Decabillionaire',
      image: '/IMG_20260828_003941.png',
      stars: 5,
      category: 'achievement',
    },
    {
      id: '2',
      name: 'Charm Legend',
      image: '/IMG_20260828_003922.png',
      stars: 5,
      category: 'achievement',
    },
    {
      id: '3',
      name: 'Billionaire',
      image: '/IMG_20260828_003958.png',
      stars: 4,
      category: 'achievement',
    },
    {
      id: '4',
      name: 'Charm Luminary',
      image: '/IMG_20260828_003922.png',
      stars: 4,
      category: 'achievement',
    },
  ]

  const filteredMedals = medals.filter((m) => m.category === activeTab)

  return (
    <div className="min-h-screen text-white flex flex-col font-sans select-none relative overflow-x-hidden bg-[#0a0512]">
      {/* Background WebGL Shader */}
      <WebGLBackground />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="p-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-lg font-medium text-white tracking-wide">Medal</h1>
        <div className="w-7" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 relative z-10">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Current Medal Showcase Section */}
          <div className="relative pt-1 pb-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-amber-400/60" />
              <span className="text-xs text-amber-200/90 font-medium tracking-wide">
                Current Medal
              </span>
              <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-amber-400/60" />
            </div>

            {/* 2x5 Grid */}
            <div className="grid grid-cols-5 gap-2 px-1 relative z-10">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl bg-[#170e28]/80 border border-purple-500/20 flex items-center justify-center shadow-inner shadow-black/60 hover:border-amber-400/40 transition-colors cursor-pointer backdrop-blur-sm"
                >
                  <Plus size={14} className="text-amber-300/80" />
                </div>
              ))}
            </div>

            {/* Glowing Podium */}
            <div className="relative -mt-3">
              <div className="h-8 w-4/5 mx-auto rounded-[100%] bg-gradient-to-r from-blue-600/40 via-purple-500/50 to-blue-600/40 blur-md" />
              <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 -mt-1 cursor-pointer hover:text-gray-200 transition-colors">
                <span>Obtained Medal(s): 0</span>
                <span className="text-indigo-400 font-medium ml-1">Check</span>
                <ChevronRight size={12} className="text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-around border-b border-white/10 pb-2 text-sm">
            {(['achievement', 'gift', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-1 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-amber-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-amber-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {filteredMedals.map((medal) => (
              <div
                key={medal.id}
                onClick={() => setSelectedMedal(medal)}
                className="bg-[#120822]/70 border border-purple-800/30 rounded-2xl p-4 flex flex-col items-center justify-between text-center hover:border-amber-400/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 backdrop-blur-md shadow-lg shadow-black/60 cursor-pointer"
              >
                {/* Cleaned Image */}
                <div className="w-28 h-28 my-1 flex items-center justify-center relative">
                  <ChromaKeyImage src={medal.image} alt={medal.name} />
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 my-1.5">
                  {Array.from({ length: medal.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Name */}
                <h3 className="text-xs font-medium text-gray-200 tracking-wide">
                  {medal.name}
                </h3>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 3. Center Screen Modal with Rotating Shine Background */}
      {selectedMedal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedMedal(null)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setSelectedMedal(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all z-50 cursor-pointer"
          >
            <X size={24} />
          </button>

          <div 
            className="relative flex flex-col items-center justify-center text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Rotating Sunburst / Light Rays Shine */}
            <div className="absolute w-80 h-80 sm:w-96 sm:h-96 -z-10 animate-spin-slow pointer-events-none flex items-center justify-center">
              <div 
                className="w-full h-full rounded-full opacity-70 blur-xs"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(245,158,11,0.5) 15deg, transparent 30deg, rgba(168,85,247,0.5) 45deg, transparent 60deg, rgba(245,158,11,0.5) 75deg, transparent 90deg, rgba(168,85,247,0.5) 105deg, transparent 120deg, rgba(245,158,11,0.5) 135deg, transparent 150deg, rgba(168,85,247,0.5) 165deg, transparent 180deg, rgba(245,158,11,0.5) 195deg, transparent 210deg, rgba(168,85,247,0.5) 225deg, transparent 240deg, rgba(245,158,11,0.5) 255deg, transparent 270deg, rgba(168,85,247,0.5) 285deg, transparent 300deg, rgba(245,158,11,0.5) 315deg, transparent 330deg, rgba(168,85,247,0.5) 345deg, transparent 360deg)'
                }}
              />
              <div className="absolute inset-0 bg-radial from-amber-400/30 via-purple-600/20 to-transparent blur-2xl rounded-full" />
            </div>

            {/* Floating Medal in Full Glory */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 my-4 relative flex items-center justify-center filter drop-shadow-[0_0_35px_rgba(251,191,36,0.6)] animate-pulse">
              <ChromaKeyImage src={selectedMedal.image} alt={selectedMedal.name} />
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 mt-2 mb-3">
              {Array.from({ length: selectedMedal.stars }).map((_, i) => (
                <Star
                  key={i}
                  size={22}
                  className="fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]"
                />
              ))}
            </div>

            {/* Medal Name */}
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 tracking-wide drop-shadow-md">
              {selectedMedal.name}
            </h2>
          </div>
        </div>
      )}

      {/* Rotating Keyframes Styling */}
      <style jsx global>{`
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spinSlow 12s linear infinite;
        }
      `}</style>
    </div>
  )
}
