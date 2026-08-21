'use client'

import { useState, useEffect, useRef } from 'react'

// --- WebGL Shader to strictly remove White Background & Fix UV Inversion ---
function WhiteColorRemovalShader({
  imageSrc,
  className = '',
  threshold = 0.88,
}: {
  imageSrc: string
  className?: string
  threshold?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
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

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform float u_threshold;
      varying vec2 v_texCoord;
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        if (color.r > u_threshold && color.g > u_threshold && color.b > u_threshold) {
          discard;
        } else {
          float brightness = (color.r + color.g + color.b) / 3.0;
          if (brightness > u_threshold - 0.08) {
            float alphaFactor = (u_threshold - brightness) / 0.08;
            gl_FragColor = vec4(color.rgb, color.a * clamp(alphaFactor, 0.0, 1.0));
          } else {
            gl_FragColor = color;
          }
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

    const posBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
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

    const posAttr = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posAttr)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)

    const texBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 1,
        1, 1,
        0, 0,
        0, 0,
        1, 1,
        1, 0,
      ]),
      gl.STATIC_DRAW
    )

    const texAttr = gl.getAttribLocation(program, 'a_texCoord')
    gl.enableVertexAttribArray(texAttr)
    gl.vertexAttribPointer(texAttr, 2, gl.FLOAT, false, 0, 0)

    const thresholdLoc = gl.getUniformLocation(program, 'u_threshold')
    gl.uniform1f(thresholdLoc, threshold)

    const texture = gl.createTexture()
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageSrc
    img.onload = () => {
      if (!canvas) return
      canvas.width = img.width || 120
      canvas.height = img.height || 120
      gl.viewport(0, 0, canvas.width, canvas.height)

      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
  }, [imageSrc, threshold])

  return <canvas ref={canvasRef} className={className} />
}

interface WalletProps {
  onBack: () => void
}

export default function Wallet({ onBack }: WalletProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'wallet' | 'diamonds'>('wallet')
  const [diamonds, setDiamonds] = useState('100')
  const [coins, setCoins] = useState('33')

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(id)
  }, [])

  // Handle diamond input change
  const handleDiamondChange = (value: string) => {
    setDiamonds(value)
    const diamondNum = parseFloat(value) || 0
    const coinValue = (diamondNum * 33 / 100).toFixed(0)
    setCoins(coinValue)
  }

  // Handle coin input change
  const handleCoinChange = (value: string) => {
    setCoins(value)
    const coinNum = parseFloat(value) || 0
    const diamondValue = (coinNum * 100 / 33).toFixed(0)
    setDiamonds(diamondValue)
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col"
      style={{
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        background: activeTab === 'wallet' 
          ? 'linear-gradient(180deg, #FFA500 0%, #FFB347 40%, #FFD699 75%, #FFFFFF 100%)'
          : 'linear-gradient(180deg, #FF1493 0%, #FF69B4 40%, #FFB6C1 75%, #FFFFFF 100%)',
      }}
    >
      <style>{`
        * {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          touch-action: manipulation;
        }
        @keyframes slideDown {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* TOP HEADER - Same sheet with gradient */}
      <div
        className="w-full relative overflow-hidden transition-all duration-500 flex items-center justify-between px-4"
        style={{
          height: '56px',
          animation: mounted ? 'slideDown 0.6s ease-out' : 'none',
        }}
      >
        {/* Back Button - Icon matching background color */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
          style={{
            background: activeTab === 'wallet' ? '#FFA500' : '#FF1493',
          }}
          aria-label="Back"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Title */}
        <h1
          className="text-xl font-extrabold tracking-wide"
          style={{
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {activeTab === 'wallet' ? 'Wallet' : 'Diamonds'}
        </h1>

        {/* History Button - Icon matching background color */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
          style={{
            background: activeTab === 'wallet' ? '#FFA500' : '#FF1493',
          }}
          aria-label="History"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        </button>
      </div>

      {/* TAB BUTTONS - Same sheet */}
      <div className="flex justify-center gap-8 py-1.5">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`relative pb-1 text-sm font-bold transition-all ${
            activeTab === 'wallet' ? 'text-white scale-105' : 'text-white/60'
          }`}
        >
          Wallet
          {activeTab === 'wallet' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('diamonds')}
          className={`relative pb-1 text-sm font-bold transition-all ${
            activeTab === 'diamonds' ? 'text-white scale-105' : 'text-white/60'
          }`}
        >
          Diamonds
          {activeTab === 'diamonds' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />
          )}
        </button>
      </div>

      {/* BOTTOM SECTION - Transparent to show gradient */}
      <div
        className="flex-1 overflow-y-auto px-3 pt-1.5 pb-3 relative"
        style={{
          background: 'transparent',
        }}
      >
        {/* COINS TAB CONTENT */}
        {activeTab === 'wallet' && (
          <div className="flex flex-col h-full" style={{ animation: mounted ? 'fadeInUp 0.4s ease-out 0.1s' : 'none' }}>
            <div className="space-y-2 flex-1">
              {/* CURRENT BALANCE BANNER */}
              <div
                className="rounded-2xl p-4 relative overflow-hidden flex justify-between items-center"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                  boxShadow: '0 8px 32px rgba(255, 165, 0, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
                  border: '2px solid rgba(255, 215, 0, 0.8)',
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)' }}
                />
                <div className="relative z-10">
                  <h2 className="text-sm font-bold text-white mb-0.5">Current balance</h2>
                  <p className="text-4xl font-black text-white">2,293</p>
                </div>
                <div className="relative w-20 h-20 flex-shrink-0">
                  <WhiteColorRemovalShader
                    imageSrc="/1786855398290.png"
                    className="w-full h-full object-contain"
                    threshold={0.88}
                  />
                </div>
              </div>

              {/* 3 SMALL SQUARE CARDS IN 1 ROW */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { coins: '1,000,000', price: '$ 1.0' },
                  { coins: '2,000,000', price: '$ 2.0' },
                  { coins: '3,000,000', price: '$ 3.0' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl overflow-hidden shadow-sm flex flex-col items-center justify-between p-2"
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      border: '1px solid rgba(255, 165, 0, 0.3)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                      aspectRatio: '1 / 1',
                    }}
                  >
                    <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                      <WhiteColorRemovalShader
                        imageSrc="/1786855398290.png"
                        className="w-full h-full object-contain"
                        threshold={0.88}
                      />
                    </div>
                    <span className="text-gray-700 font-extrabold text-[11px] tracking-tight">{item.coins}</span>
                    <button className="w-full py-1 bg-gradient-to-r from-orange-400 to-orange-600 font-bold text-white active:scale-95 transition-transform text-[11px] rounded-md shadow-xs">
                      {item.price}
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-center pt-0.5">
                <a href="#" className="text-xs text-blue-500 font-medium underline">
                  Coins not received? Click here
                </a>
              </div>
            </div>

            {/* Bottom buttons - fixed at bottom with reduced width */}
            <div className="space-y-3 pt-2 pb-2 px-6">
              <div className="relative">
                <div className="absolute -top-1.5 right-2 z-10 px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-t-md rounded-bl-md">
                  1st Bonus +10% | Then +2%
                </div>
                <button className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-md active:scale-95 transition-transform text-sm">
                  Local payment methods
                </button>
              </div>

              <div className="relative">
                <div className="absolute -top-1.5 right-2 z-10 px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-t-md rounded-bl-md">
                  Biggest Discount 4%-13%
                </div>
                <button className="w-full py-3 rounded-xl font-bold text-orange-600 bg-white border-2 border-orange-400 shadow-sm active:scale-95 transition-transform text-sm">
                  Coin Seller
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DIAMONDS TAB CONTENT */}
        {activeTab === 'diamonds' && (
          <div className="flex flex-col h-full" style={{ animation: mounted ? 'fadeInUp 0.4s ease-out 0.1s' : 'none' }}>
            <div className="space-y-2 flex-1">
              {/* CURRENT DIAMONDS BANNER */}
              <div
                className="rounded-2xl p-4 relative overflow-hidden flex justify-between items-center"
                style={{
                  background: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 50%, #C71585 100%)',
                  boxShadow: '0 8px 32px rgba(255, 20, 147, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
                  border: '2px solid rgba(255, 105, 180, 0.8)',
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)' }}
                />
                <div className="relative z-10">
                  <h2 className="text-sm font-bold text-white mb-0.5">Diamonds balance</h2>
                  <p className="text-4xl font-black text-white">4,719</p>
                </div>
                <div className="relative w-20 h-20 flex-shrink-0">
                  <WhiteColorRemovalShader
                    imageSrc="/1787321690452.png"
                    className="w-full h-full object-contain"
                    threshold={0.88}
                  />
                </div>
              </div>

              {/* Exchange Section - images inside inputs */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255, 182, 193, 0.8)',
                  minHeight: '180px',
                }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">Exchange</h3>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white rounded-lg border border-pink-200 p-2 flex items-center gap-2">
                    <div className="w-6 h-6">
                      <WhiteColorRemovalShader
                        imageSrc="/1787321690452.png"
                        className="w-full h-full object-contain"
                        threshold={0.88}
                      />
                    </div>
                    <input
                      type="number"
                      value={diamonds}
                      onChange={(e) => handleDiamondChange(e.target.value)}
                      className="bg-transparent outline-none w-full font-medium text-gray-700 text-base"
                      placeholder="Diamonds"
                    />
                  </div>
                  <div className="text-gray-400 font-bold text-lg">=</div>
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 p-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={coins}
                      onChange={(e) => handleCoinChange(e.target.value)}
                      className="bg-transparent outline-none w-full font-medium text-gray-700 text-base text-right"
                      placeholder="Coins"
                    />
                    <div className="w-6 h-6">
                      <WhiteColorRemovalShader
                        imageSrc="/1786855398290.png"
                        className="w-full h-full object-contain"
                        threshold={0.88}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom button - fixed at bottom with reduced width */}
            <div className="pt-2 pb-2 px-6">
              <button
                className="w-full py-3 rounded-xl font-bold text-white bg-gray-300 cursor-not-allowed active:scale-95 transition-transform text-sm"
                disabled
              >
                Exchange
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
                }
