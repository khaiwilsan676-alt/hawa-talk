'use client'

import React, { useState, useEffect, useRef } from 'react'

interface LeaderboardProps {
  onBack: () => void
}

type LeaderboardTab = 'honour' | 'charm' | 'room'

// Helper component to remove green screen from images using WebGL Shaders
function ChromaKeyImage({
  src,
  alt,
  className = '',
  style = {}
}: {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false })
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

    // Green screen keying fragment shader
    const fsSource = `
      precision mediump float;
      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        // Green key detection
        float greenDiff = color.g - max(color.r, color.b);
        if (greenDiff > 0.15 && color.g > 0.35) {
          discard;
        } else {
          gl_FragColor = color;
        }
      }
    `

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')
    const imageLocation = gl.getUniformLocation(program, 'u_image')

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    )

    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,
      ]),
      gl.STATIC_DRAW
    )

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    img.onload = () => {
      canvas.width = img.naturalWidth || 300
      canvas.height = img.naturalHeight || 300
      gl.viewport(0, 0, canvas.width, canvas.height)

      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)

      gl.enableVertexAttribArray(positionLocation)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      gl.enableVertexAttribArray(texCoordLocation)
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

      gl.uniform1i(imageLocation, 0)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
  }, [src])

  return <canvas ref={canvasRef} aria-label={alt} className={className} style={style} />
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('honour')

  const tabs: { id: LeaderboardTab; label: string }[] = [
    { id: 'honour', label: 'Honour' },
    { id: 'charm', label: 'Charm' },
    { id: 'room', label: 'Room' },
  ]

  const tabImages: Record<LeaderboardTab, { top: string }> = {
    honour: {
      top: '/IMG-20260820-WA0068.jpg',
    },
    charm: {
      top: '/file_000000006adc82118aca1654ab78b34a.png',
    },
    room: {
      top: '/file_000000006f4082119aa31cd73d4211e2.png',
    },
  }

  // Top 4 to 50 cards array
  const rankCards = Array.from({ length: 47 }, (_, index) => index + 4)

  return (
    <div
      className="fixed inset-0 bg-[#2B1704] text-white overflow-hidden flex flex-col select-none"
      style={{
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
      }}
    >
      {/* BACKGROUND TOP IMAGE WITH FADE INTO BROWN */}
      <div
        className="absolute top-0 left-0 w-full pointer-events-none z-0 overflow-hidden"
        style={{
          height: '45vh',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
        }}
      >
        <img
          key={`${activeTab}-top`}
          src={tabImages[activeTab].top}
          alt={`${activeTab} leaderboard top`}
          className="w-full h-full object-cover"
          draggable="false"
        />
      </div>

      {/* TOP HEADER: Clean Back, Underlined Tabs, Simple Info */}
      <header className="relative z-50 flex items-center justify-between px-4 py-3 shrink-0">
        {/* Simple White Back Arrow */}
        <button
          onClick={onBack}
          className="p-2 text-white active:opacity-60 transition-opacity"
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Tab Buttons with Simple Underline */}
        <div className="flex items-center justify-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative pb-1.5 font-semibold text-base transition-colors"
              style={{
                color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Simple White Question Mark */}
        <button
          className="p-2 text-white active:opacity-60 transition-opacity text-xl font-bold"
          aria-label="Info"
        >
          ?
        </button>
      </header>

      {/* SCROLLABLE CONTENT AREA (BROWN CONTAINER) */}
      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-8 px-4 flex flex-col items-center">
        {/* PODIUM SECTION (TOP 1, 2, 3) */}
        <div className="w-full max-w-md flex flex-col items-center gap-3 mt-2">
          {/* Row 1: Top 1 (Middle) */}
          <div className="flex justify-center w-full">
            <ChromaKeyImage
              src="/1787994771034~2.jpg"
              alt="Top 1"
              className="w-28 h-auto object-contain drop-shadow-md"
            />
          </div>

          {/* Row 2: Top 2 (Left) and Top 3 (Right) */}
          <div className="flex justify-between items-center w-full px-6 -mt-3">
            <ChromaKeyImage
              src="/1787994751636~2.jpg"
              alt="Top 2"
              className="w-24 h-auto object-contain drop-shadow-md"
            />
            <ChromaKeyImage
              src="/1787994761762~2.jpg"
              alt="Top 3"
              className="w-24 h-auto object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Middle Gap: 10vh */}
        <div style={{ height: '10vh' }} className="w-full shrink-0" />

        {/* 50 CARDS (TOP 4 TO 50) */}
        <div className="w-full max-w-md flex flex-col gap-3">
          {rankCards.map((rank) => (
            <div
              key={rank}
              className="relative w-full flex items-center justify-center rounded-xl overflow-hidden shadow-sm"
            >
              <ChromaKeyImage
                src="/1787992320047~2.jpg"
                alt={`Rank ${rank}`}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

