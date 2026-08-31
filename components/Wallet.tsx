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
  const [selectedPercentage, setSelectedPercentage] = useState('100%')

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(id)
  }, [])

  const handleDiamondChange = (value: string) => {
    setDiamonds(value)
    const diamondNum = parseFloat(value) || 0
    const coinValue = (diamondNum * 33 / 100).toFixed(0)
    setCoins(coinValue)
  }

  const handleCoinChange = (value: string) => {
    setCoins(value)
    const coinNum = parseFloat(value) || 0
    const diamondValue = (coinNum * 100 / 33).toFixed(0)
    setDiamonds(diamondValue)
  }

  const handlePercentageSelect = (pct: string) => {
    setSelectedPercentage(pct)
    const numPct = parseInt(pct)
    // Example logic for percentage selection on diamonds balance (assuming max 4719 or general input)
    const baseVal = 1000 * (numPct / 100)
    setDiamonds(baseVal.toString())
    handleDiamondChange(baseVal.toString())
  }

  return (
    <div
      className="fixed inset-0 h-[100dvh] w-full overflow-hidden flex flex-col pt-[env(safe-area-inset-top,12px)] pb-[env(safe-area-inset-bottom,12px)] bg-white transition-all duration-500"
      style={{
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        background: activeTab === 'wallet' 
          ? 'linear-gradient(180deg, #FFE4B5 0%, #FFF5EE 20%, #FFFFFF 35%, #FFFFFF 100%)'
          : 'linear-gradient(180deg, #FFC0CB 0%, #FFE4E1 20%, #FFFFFF 35%, #FFFFFF 100%)',
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

      {/* TOP HEADER */}
      <div
        className="w-full relative flex-shrink-0 flex items-center justify-between px-4 z-20"
        style={{
          height: '56px',
          animation: mounted ? 'slideDown 0.4s ease-out' : 'none',
        }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all flex-shrink-0 bg-transparent text-gray-800"
          aria-label="Back"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h1 className="text-lg font-bold text-gray-900">
          Wallet
        </h1>

        <button
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all flex-shrink-0 bg-transparent text-gray-800"
          aria-label="History"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </button>
      </div>

      {/* TAB BUTTONS */}
      <div className="flex justify-center gap-12 py-1 flex-shrink-0 z-20">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`relative pb-2 text-sm font-semibold transition-all ${
            activeTab === 'wallet' ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          Coins
          {activeTab === 'wallet' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-gray-900 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('diamonds')}
          className={`relative pb-2 text-sm font-semibold transition-all ${
            activeTab === 'diamonds' ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          Diamonds
          {activeTab === 'diamonds' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-gray-900 rounded-full" />
          )}
        </button>
      </div>

      {/* SCROLLABLE BODY */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-3 pb-6 relative"
        style={{
          background: 'transparent',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* COINS TAB CONTENT */}
        {activeTab === 'wallet' && (
          <div className="flex flex-col min-h-full justify-between space-y-4" style={{ animation: mounted ? 'fadeInUp 0.4s ease-out 0.1s' : 'none' }}>
            <div className="space-y-4">
              {/* CURRENT BALANCE BANNER WITH OVERFLOW IMAGE */}
              <div
                className="rounded-2xl p-4 relative mt-6 flex flex-col justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FFE4B5 0%, #FFD700 100%)',
                  boxShadow: '0 4px 20px rgba(255, 165, 0, 0.15)',
                  minHeight: '90px',
                }}
              >
                {/* Overflow Coin Image matching 1000183565.jpg */}
                <div className="absolute -top-7 right-4 w-24 h-24 pointer-events-none z-20 drop-shadow-lg">
                  <WhiteColorRemovalShader
                    imageSrc="/1786855398290.png"
                    className="w-full h-full object-contain"
                    threshold={0.88}
                  />
                </div>
                <h2 className="text-xs font-semibold text-amber-900/70 uppercase tracking-wider mb-1">current balance</h2>
                <p className="text-3xl font-black text-amber-950">1,077,472</p>
              </div>

              {/* COIN ITEM CARD */}
              <div className="relative pt-2">
                <div
                  className="rounded-2xl p-4 relative flex flex-col items-center justify-between"
                  style={{
                    background: '#FFFDF5',
                    border: '1px solid #FDF0D5',
                    width: '140px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div className="absolute -top-2.5 left-3 z-10 px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-md shadow-xs">
                    +20,000 
                  </div>
                  
                  <div className="w-14 h-14 my-2 flex items-center justify-center">
                    <WhiteColorRemovalShader
                      imageSrc="/1786855398290.png"
                      className="w-full h-full object-contain"
                      threshold={0.88}
                    />
                  </div>

                  <span className="px-2 py-0.5 bg-red-400 text-white text-[9px] font-bold rounded-full mb-2">
                    First Recharge
                  </span>

                  <span className="text-gray-900 font-extrabold text-sm mb-3">1,000,000</span>

                  <button className="w-full py-2 bg-amber-300 hover:bg-amber-400 font-bold text-amber-950 active:scale-95 transition-transform text-xs rounded-xl shadow-xs">
                    USD 1
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DIAMONDS TAB CONTENT */}
        {activeTab === 'diamonds' && (
          <div className="flex flex-col min-h-full justify-between space-y-4" style={{ animation: mounted ? 'fadeInUp 0.4s ease-out 0.1s' : 'none' }}>
            <div className="space-y-4">
              {/* CURRENT DIAMONDS BANNER WITH OVERFLOW IMAGE */}
              <div
                className="rounded-2xl p-4 relative mt-6 flex flex-col justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FFC0CB 0%, #FF69B4 100%)',
                  boxShadow: '0 4px 20px rgba(255, 105, 180, 0.15)',
                  minHeight: '90px',
                }}
              >
                {/* Overflow Diamond Image matching 1000183569.jpg */}
                <div className="absolute -top-8 right-2 w-24 h-24 pointer-events-none z-20 drop-shadow-lg">
                  <WhiteColorRemovalShader
                    imageSrc="/1787321690452.png"
                    className="w-full h-full object-contain"
                    threshold={0.88}
                  />
                </div>
                <h2 className="text-xs font-semibold text-pink-950/70 uppercase tracking-wider mb-1">current diamonds</h2>
                <p className="text-3xl font-black text-pink-950">0</p>
              </div>

              {/* EXCHANGE BOX */}
              <div
                className="rounded-2xl p-4 bg-white/80 backdrop-blur-sm"
                style={{
                  border: '1px solid #FFE4E1',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-800">Exchange</h3>
                  <div className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <span>100 =</span>
                    <div className="w-4 h-4 inline-block align-middle">
                      <WhiteColorRemovalShader
                        imageSrc="/1786855398290.png"
                        className="w-full h-full object-contain"
                        threshold={0.88}
                      />
                    </div>
                    <span>33</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0">
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
                      className="bg-transparent outline-none w-full font-medium text-gray-700 text-xs"
                      placeholder="Input multiple"
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-400">x100</span>
                  <div className="text-gray-300 font-bold">=</div>
                  <div className="w-16 flex items-center justify-end gap-1">
                    <input
                      type="number"
                      value={coins}
                      onChange={(e) => handleCoinChange(e.target.value)}
                      className="bg-transparent outline-none w-full font-medium text-gray-700 text-xs text-right"
                      placeholder="Coins"
                    />
                    <div className="w-4 h-4 flex-shrink-0">
                      <WhiteColorRemovalShader
                        imageSrc="/1786855398290.png"
                        className="w-full h-full object-contain"
                        threshold={0.88}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* EXCHANGE RATE PERCENTAGE BUTTONS */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-600">exchange rate</h4>
                <div className="grid grid-cols-3 gap-2.5">
                  {['20%', '40%', '60%', '80%', '100%'].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handlePercentageSelect(pct)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedPercentage === pct
                          ? 'bg-cyan-400 text-white border-cyan-400 shadow-sm'
                          : 'bg-white text-cyan-500 border-cyan-200'
                      }`}
                    >
                      {pct}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM EXCHANGE BUTTON */}
            <div className="pt-4">
              <button
                className="w-full py-3 rounded-xl font-bold text-white bg-pink-300 active:scale-95 transition-transform text-sm shadow-xs"
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

