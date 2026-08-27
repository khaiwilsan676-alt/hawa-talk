'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Plus, Star, X } from 'lucide-react'

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

// 1. WebGL Background Shader (Always Visible)
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

// 2. Green Screen Removal Canvas
function ChromaKeyImage({ src, alt }: { src: string; alt: string }) {
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
      className="w-full h-full object-contain pointer-events-none"
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

      {/* Header - Android Top Safe Spacing */}
      <div className="relative z-10 flex items-center justify-between px-3 pt-12 pb-2 sm:pt-4">
        <button
          onClick={onBack}
          className="p-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-lg font-medium text-white tracking-wide">Medal</h1>
        <div className="w-7" />
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 pb-6 relative z-10">
        <div className="max-w-md mx-auto flex flex-col gap-1.5">
          
          {/* Current Medal Showcase Section */}
          <div className="relative pt-1 pb-1">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-amber-400/60" />
              <span className="text-xs text-amber-200/90 font-medium tracking-wide">
                Current Medal
              </span>
              <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-amber-400/60" />
            </div>

            {/* Small Slots 2x5 Grid */}
            <div className="grid grid-cols-5 gap-1.5 px-0.5 relative z-10">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl bg-[#170e28]/80 border border-purple-500/20 flex items-center justify-center shadow-inner shadow-black/60 hover:border-amber-400/40 transition-colors cursor-pointer"
                >
                  <Plus size={14} className="text-amber-300/80" />
                </div>
              ))}
            </div>

            {/* Bottom Glow Platform */}
            <div className="relative -mt-2">
              <div className="h-6 w-4/5 mx-auto rounded-[100%] bg-gradient-to-r from-blue-600/40 via-purple-500/50 to-blue-600/40 blur-sm" />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-around border-b border-white/10 pb-1 text-sm">
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
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2.5px] bg-amber-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Big Medal Cards Grid */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {filteredMedals.map((medal) => (
              <div
                key={medal.id}
                onClick={() => setSelectedMedal(medal)}
                className="bg-[#120822] border border-purple-800/30 rounded-2xl p-3 flex flex-col items-center justify-between text-center hover:border-amber-400/50 active:scale-95 transition-all duration-200 shadow-lg shadow-black cursor-pointer"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 my-0.5 flex items-center justify-center relative">
                  <ChromaKeyImage src={medal.image} alt={medal.name} />
                </div>

                <div className="flex items-center gap-0.5 my-1">
                  {Array.from({ length: medal.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <h3 className="text-xs font-medium text-gray-200 tracking-wide">
                  {medal.name}
                </h3>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Center Modal - No Black Screen (Original Background Visible) with Smaller Rotating White Shine */}
      {selectedMedal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25"
          onClick={() => setSelectedMedal(null)}
        >
          {/* Close Button Adjusted for Android */}
          <button 
            onClick={() => setSelectedMedal(null)}
            className="absolute top-12 sm:top-6 right-6 p-2 rounded-full bg-white/15 text-gray-200 hover:text-white transition-all z-50 cursor-pointer shadow-md"
          >
            <X size={24} />
          </button>

          <div 
            className="relative flex flex-col items-center justify-center text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Small Compact White Shiny Rays */}
            <div className="absolute w-60 h-60 sm:w-72 sm:h-72 -z-10 animate-spin-slow pointer-events-none flex items-center justify-center">
              <div 
                className="w-full h-full rounded-full"
                style={{
                  background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.4) 0deg 8deg, transparent 8deg 24deg)'
                }}
              />
              {/* Inner Soft Glow */}
              <div className="absolute inset-4 rounded-full bg-white/10 blur-sm pointer-events-none" />
            </div>

            {/* Medal Image (Original Color without Background) */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 my-2 relative flex items-center justify-center">
              <ChromaKeyImage src={selectedMedal.image} alt={selectedMedal.name} />
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 mt-2 mb-1.5">
              {Array.from({ length: selectedMedal.stars }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
            </div>

            {/* Medal Name */}
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wider">
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
        .animate-spin-slow {
          animation: spinSlow 14s linear infinite;
        }
      `}</style>
    </div>
  )
}

