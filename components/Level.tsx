'use client'

import React, { useEffect, useRef } from 'react'
import { ChevronLeft, Sparkles } from 'lucide-react'

interface LevelProps {
  onBack?: () => void
}

interface MedalTier {
  range: string
  imageSrc: string
  isWhiteBg?: boolean // true for WebGL white remove, false for green screen chroma key
}

const medalTiers: MedalTier[] = [
  { range: 'Lv.1 - Lv.10', imageSrc: '/1785137410522.png', isWhiteBg: true },
  { range: 'Lv.11 - Lv.20', imageSrc: '/1787573593167~2.jpg', isWhiteBg: false },
  { range: 'Lv.21 - Lv.30', imageSrc: '/1787573599045~2.jpg', isWhiteBg: false },
  { range: 'Lv.31 - Lv.40', imageSrc: '/1787573616413~2.jpg', isWhiteBg: false },
  { range: 'Lv.41 - Lv.50', imageSrc: '/1787573621768~2.jpg', isWhiteBg: false },
  { range: 'Lv.51 - Lv.60', imageSrc: '/1787573610638~2.jpg', isWhiteBg: false },
  { range: 'Lv.61 - Lv.70', imageSrc: '/1787573604873~2.jpg', isWhiteBg: false },
  { range: 'Lv.71 - Lv.80', imageSrc: '/1787573627153~2.jpg', isWhiteBg: false },
  { range: 'Lv.81 - Lv.90', imageSrc: '/1787573633612~2.jpg', isWhiteBg: false },
]

/**
 * WebGL Shader Canvas Component
 * - isWhiteBg = true: Strips pure white/near-white backgrounds smoothly.
 * - isWhiteBg = false: Strips green-screen background (Chroma key with spill suppression).
 */
function ShaderImageBadge({ src, isWhiteBg = false }: { src: string; isWhiteBg?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) return

    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `

    // White Keying Fragment Shader
    const fsWhiteSource = `
      precision mediump float;
      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        // Calculate brightness/luminance
        float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        float minChannel = min(min(color.r, color.g), color.b);
        
        // Soft edge threshold for white removal
        float alpha = 1.0 - smoothstep(0.85, 0.96, minChannel);
        
        if (luminance > 0.92 && minChannel > 0.82) {
          alpha = 0.0;
        }
        
        gl_FragColor = vec4(color.rgb, color.a * alpha);
      }
    `

    // Green Chroma Keying Fragment Shader
    const fsGreenSource = `
      precision mediump float;
      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        
        // Green dominance check
        float greenDiff = color.g - max(color.r, color.b);
        float mask = smoothstep(0.05, 0.22, greenDiff);
        float alpha = 1.0 - mask;
        
        // Spill suppression so edges do not show green tint
        vec3 cleanRgb = color.rgb;
        if (color.g > max(color.r, color.b)) {
          cleanRgb.g = max(color.r, color.b) * 0.9;
        }
        
        gl_FragColor = vec4(cleanRgb, color.a * alpha);
      }
    `

    const fsSource = isWhiteBg ? fsWhiteSource : fsGreenSource

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource)
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Setup Quad Geometry
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
      ]),
      gl.STATIC_DRAW
    )

    const posAttr = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posAttr)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)

    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 1, 1, 1, 0, 0,
        0, 0, 1, 1, 1, 0
      ]),
      gl.STATIC_DRAW
    )

    const texAttr = gl.getAttribLocation(program, 'a_texCoord')
    gl.enableVertexAttribArray(texAttr)
    gl.vertexAttribPointer(texAttr, 2, gl.FLOAT, false, 0, 0)

    // Load Texture
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = src
    image.onload = () => {
      canvas.width = image.naturalWidth || 160
      canvas.height = image.naturalHeight || 80
      gl.viewport(0, 0, canvas.width, canvas.height)

      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    return () => {
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [src, isWhiteBg])

  return (
    <canvas
      ref={canvasRef}
      className="w-20 h-10 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
    />
  )
}

export default function Level({ onBack }: LevelProps) {
  const currentXP = 59692
  const nextLevelXP = 68414
  const neededXP = nextLevelXP - currentXP
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100)

  return (
    <div className="min-h-screen bg-[#060a13] text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <div className="relative flex items-center justify-center px-4 py-4">
        <button
          onClick={onBack}
          className="absolute left-4 p-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer"
        >
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h1 className="text-lg font-semibold tracking-wide text-white">Level</h1>
      </div>

      <div className="flex-1 px-4 pb-8 space-y-4 overflow-y-auto">
        {/* Blue Theme Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-900 p-5 shadow-2xl border border-sky-400/20">
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
              <div className="relative w-20 h-20 rounded-2xl rotate-45 bg-gradient-to-tr from-sky-400 via-blue-200 to-indigo-600 p-[3px] shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-blue-950 via-[#0a1835] to-slate-950 rounded-xl flex items-center justify-center border border-sky-300/50">
                  <div className="-rotate-45 flex flex-col items-center">
                    <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-cyan-400 tracking-tight">
                      Lv.9
                    </span>
                  </div>
                </div>
              </div>
              <Sparkles size={14} className="absolute top-1 right-1 text-sky-200 animate-bounce" />
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-3 relative z-10 space-y-1.5">
            <p className="text-xs text-sky-100/90 font-medium">
              {neededXP} needed for the next level.
            </p>

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

        {/* Level Medal Container */}
        <div className="rounded-3xl bg-[#0e1422] p-5 border border-white/5 space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sky-400 text-sm">✦</span>
            <h3 className="text-sm font-semibold tracking-wider text-sky-100 uppercase">
              Level Medal
            </h3>
            <span className="text-sky-400 text-sm">✦</span>
          </div>

          {/* 3-Column Medals Grid with WebGL Cutouts */}
          <div className="grid grid-cols-3 gap-3">
            {medalTiers.map((tier, idx) => (
              <div
                key={idx}
                className="bg-[#141b2d] rounded-2xl p-3 flex flex-col items-center justify-center space-y-2 border border-white/[0.04] hover:border-sky-500/40 transition-all cursor-pointer group"
              >
                {/* WebGL Shader Badge */}
                <div className="h-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <ShaderImageBadge
                    src={tier.imageSrc}
                    isWhiteBg={tier.isWhiteBg}
                  />
                </div>

                <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200">
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

