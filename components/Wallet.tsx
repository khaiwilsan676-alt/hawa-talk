'use client'

import { useState, useEffect, useRef } from 'react'

interface WalletProps {
  onBack: () => void
}

// WebGL Shader Component for White Background Removal
const WebShaderImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { 
      premultipliedAlpha: true,
      alpha: true 
    })
    
    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    // WebGL Shader Programs
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `

    const fragmentShaderSource = `
      precision mediump float;
      
      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        
        // White background removal shader
        float whiteness = (color.r + color.g + color.b) / 3.0;
        
        // If pixel is white (close to white), make it transparent
        if (color.r > 0.95 && color.g > 0.95 && color.b > 0.95) {
          color.a = 0.0;
        }
        // Edge softening for anti-aliasing
        else if (whiteness > 0.85) {
          color.a = (1.0 - whiteness) * 5.0;
        }
        // Enhance non-white colors
        else {
          color.rgb = color.rgb * 1.1;
          color.a = 1.0;
        }
        
        gl_FragColor = color;
      }
    `

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const createProgram = (vertexSrc: string, fragmentSrc: string) => {
      const vertexShader = createShader(gl.VERTEX_SHADER, vertexSrc)
      const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSrc)
      
      if (!vertexShader || !fragmentShader) return null
      
      const program = gl.createProgram()!
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program))
        return null
      }
      
      return program
    }

    // Create shader program
    const program = createProgram(vertexShaderSource, fragmentShaderSource)
    if (!program) return

    // Set up geometry
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW)

    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]), gl.STATIC_DRAW)

    // Load and process image
    const image = new Image()
    image.crossOrigin = 'anonymous'
    
    image.onload = () => {
      canvas.width = image.width
      canvas.height = image.height
      
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      
      // Create texture
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      
      // Use shader program
      gl.useProgram(program)
      
      // Set up attributes
      const positionLocation = gl.getAttribLocation(program, 'a_position')
      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')
      const textureLocation = gl.getUniformLocation(program, 'u_image')
      
      // Position attribute
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
      
      // Texture coordinate attribute
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.enableVertexAttribArray(texCoordLocation)
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)
      
      // Set texture uniform
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(textureLocation, 0)
      
      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      
      setLoaded(true)
    }
    
    image.src = src
    
    return () => {
      gl.deleteProgram(program)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(texCoordBuffer)
    }
  }, [src])

  return (
    <canvas 
      ref={canvasRef}
      className={className}
      style={{ 
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
      aria-label={alt}
    />
  )
}

export default function Wallet({ onBack }: WalletProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'wallet' | 'diamonds'>('wallet')

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(id)
  }, [])

  return (
    <div
      className="fixed inset-0 bg-white overflow-hidden flex flex-col"
      style={{
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none'
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

      {/* TOP SECTION - White background with subtle gold tint */}
      <div
        className="w-full relative overflow-hidden transition-colors duration-500 flex items-center justify-between px-4"
        style={{
          height: '56px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF9E6 100%)',
          animation: mounted ? 'slideDown 0.6s ease-out' : 'none',
          borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
        }}
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: '2px solid rgba(139, 101, 8, 0.3)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.5)',
          }}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Title */}
        <h1 
          className="text-xl font-extrabold tracking-wide"
          style={{
            color: '#8B6914',
            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
          }}
        >
          Wallet
        </h1>

        {/* History Button */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: '2px solid rgba(139, 101, 8, 0.3)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.5)',
          }}
          aria-label="History"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        </button>
      </div>

      {/* TAB BUTTONS */}
      <div className="flex justify-center gap-8 py-2 border-b border-gray-100 bg-white">
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`relative pb-1 text-sm font-bold transition-all ${activeTab === 'wallet' ? 'text-[#8B6914] scale-105' : 'text-gray-400'}`}
        >
          Wallet
          {activeTab === 'wallet' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#8B6914] rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('diamonds')}
          className={`relative pb-1 text-sm font-bold transition-all ${activeTab === 'diamonds' ? 'text-pink-500 scale-105' : 'text-gray-400'}`}
        >
          Diamonds
          {activeTab === 'diamonds' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-pink-500 rounded-full" />}
        </button>
      </div>

      {/* BOTTOM SECTION - Content with flex-grow */}
      <div 
        className="flex-1 overflow-y-auto p-3 relative"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F8F8 100%)',
        }}
      >
        {/* COINS TAB CONTENT */}
        {activeTab === 'wallet' && (
          <div className="flex flex-col h-full" style={{ animation: mounted ? 'fadeInUp 0.4s ease-out 0.1s' : 'none' }}>
            <div className="space-y-3 flex-1">
              <div 
                className="rounded-2xl p-4 relative overflow-hidden flex justify-between items-center"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
                  border: '2px solid rgba(255, 215, 0, 0.8)',
                }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)' }} />
                <div className="relative z-10">
                  <h2 className="text-sm font-bold text-[#8B6914] mb-0.5">Current balance</h2>
                  <p className="text-4xl font-black text-[#8B6914]">2,293</p>
                </div>
                <div className="relative w-20 h-20 flex-shrink-0">
                  <WebShaderImage 
                    src="/1786855398290.png" 
                    alt="Coin" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* SQUARE CARD - Changed to square layout */}
              <div 
                className="rounded-xl overflow-hidden shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div className="flex flex-col items-center gap-3 p-4">
                  <div className="w-16 h-16 flex-shrink-0">
                    <WebShaderImage 
                      src="/1786855398290.png" 
                      alt="Coin" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-gray-600 font-bold text-xl">1,000,000</span>
                  <button className="px-6 py-2 bg-gradient-to-r from-yellow-300 to-yellow-500 font-bold text-[#8B6914] active:scale-95 transition-transform text-sm rounded-lg">
                    $ 1.0
                  </button>
                </div>
              </div>

              <div className="text-center">
                <a href="#" className="text-xs text-blue-500 font-medium underline">Coins not received? Click here</a>
              </div>
            </div>

            {/* Bottom buttons - fixed at bottom */}
            <div className="space-y-3 pt-3 pb-2">
              <div className="relative">
                <div className="absolute -top-1.5 right-2 z-10 px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-t-md rounded-bl-md">1st Bonus +10% | Then +2%</div>
                <button className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-md active:scale-95 transition-transform text-sm">
                  Local payment methods
                </button>
              </div>

              <div className="relative">
                <div className="absolute -top-1.5 right-2 z-10 px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-t-md rounded-bl-md">Biggest Discount 4%-13%</div>
                <button className="w-full py-3 rounded-xl font-bold text-cyan-600 bg-white border-2 border-cyan-400 shadow-sm active:scale-95 transition-transform text-sm">
                  Coin Seller
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DIAMONDS TAB CONTENT */}
        {activeTab === 'diamonds' && (
          <div className="flex flex-col h-full" style={{ animation: mounted ? 'fadeInUp 0.4s ease-out 0.1s' : 'none' }}>
            <div className="space-y-3 flex-1">
              <div 
                className="rounded-2xl p-4 relative overflow-hidden flex justify-between items-center"
                style={{
                  background: 'linear-gradient(135deg, #FF69B4 0%, #FFB6C1 50%, #FF69B4 100%)',
                  boxShadow: '0 8px 32px rgba(255, 105, 180, 0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
                  border: '2px solid rgba(255, 105, 180, 0.8)',
                }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)' }} />
                <div className="relative z-10">
                  <h2 className="text-sm font-bold text-pink-700 mb-0.5">Diamonds balance</h2>
                  <p className="text-4xl font-black text-pink-700">4,719</p>
                </div>
                <div className="relative w-20 h-20 flex-shrink-0">
                  <WebShaderImage 
                    src="/1787321690452.png" 
                    alt="Diamond" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Exchange Section */}
              <div 
                className="rounded-2xl p-4"
                style={{
                  background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)',
                  border: '1px solid rgba(255, 182, 193, 0.8)',
                }}
              >
                <h3 className="text-base font-bold text-gray-800 mb-2">Exchange</h3>
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4">
                      <WebShaderImage 
                        src="/1787321690452.png" 
                        alt="Diamond" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    100
                  </span>
                  <span className="text-gray-400">=</span>
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4">
                      <WebShaderImage 
                        src="/1786855398290.png" 
                        alt="Coin" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    33
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-lg border border-pink-200 p-1.5 flex items-center gap-1.5">
                    <div className="w-5 h-5">
                      <WebShaderImage 
                        src="/1787321690452.png" 
                        alt="Diamond" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <input type="text" defaultValue="100" className="bg-transparent outline-none w-full font-medium text-gray-700 text-sm" />
                  </div>
                  <div className="text-gray-400 font-bold text-sm">=</div>
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 p-1.5 flex items-center gap-1.5">
                    <div className="w-5 h-5">
                      <WebShaderImage 
                        src="/1786855398290.png" 
                        alt="Coin" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <input type="text" readOnly value="33" className="bg-transparent outline-none w-full font-medium text-gray-700 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom button - fixed at bottom */}
            <div className="pt-3 pb-2">
              <button className="w-full py-3 rounded-xl font-bold text-white bg-gray-300 cursor-not-allowed active:scale-95 transition-transform text-sm" disabled>
                Exchange
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
        }
