'use client'

import { useState, useEffect } from 'react'

interface WalletProps {
  onBack: () => void
}

export default function Wallet({ onBack }: WalletProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(id)
  }, [])

  return (
    <div
      className="fixed inset-0 bg-white overflow-hidden"
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
          margin: 0;
          padding: 0;
        }
        button, div, span {
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
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.2); }
          50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3); }
        }
      `}</style>

      {/* TOP SECTION - 30VH Yellow-White Gradient */}
      <div
        className="w-full relative overflow-hidden"
        style={{
          height: '30vh',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFF8DC 50%, #FFD700 100%)',
          animation: mounted ? 'slideDown 0.6s ease-out' : 'none',
        }}
      >
        {/* Top Left - Back Arrow */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-all z-20"
          style={{
            background: 'rgba(255,255,255,0.3)',
            border: '2px solid rgba(139, 101, 8, 0.4)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
          }}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Top Middle - Wallet Heading */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <h1 
            className="text-3xl font-extrabold tracking-wide"
            style={{
              color: '#8B6914',
              textShadow: '0 2px 4px rgba(255,255,255,0.5), 0 0 20px rgba(255,215,0,0.5)',
              animation: mounted ? 'fadeInUp 0.6s ease-out 0.2s' : 'none',
            }}
          >
            Wallet
          </h1>
        </div>

        {/* Top Right - Clock Icon */}
        <button
          className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-all z-20"
          style={{
            background: 'rgba(255,255,255,0.3)',
            border: '2px solid rgba(139, 101, 8, 0.4)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
          }}
          aria-label="Clock"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>

      {/* BOTTOM SECTION - 70VH White Background */}
      <div 
        className="w-full relative overflow-hidden"
        style={{
          height: '70vh',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
          animation: mounted ? 'fadeInUp 0.6s ease-out 0.3s' : 'none',
        }}
      >
        {/* Text Bar Row - Coins, Diamond */}
        <div className="flex items-center justify-center gap-8 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-600 font-bold text-lg tracking-wide">Coins</span>
          </div>
          <div className="w-px h-6 bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <span className="text-cyan-600 font-bold text-lg tracking-wide">Diamond</span>
          </div>
        </div>

        {/* Yellow Card */}
        <div 
          className="mx-4 rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
            boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
            border: '2px solid rgba(255, 215, 0, 0.8)',
            animation: mounted ? 'fadeInUp 0.6s ease-out 0.4s' : 'none',
          }}
        >
          {/* Glossy overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)'
            }}
          />
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            {/* Text Content */}
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-[#8B6914] mb-1">
                Your Balance
              </h2>
              <p className="text-4xl font-black text-[#8B6914]">
                1,250
              </p>
              <p className="text-sm font-semibold text-[#8B6914]/70 mt-1">
                Gold Coins
              </p>
            </div>

            {/* Image with WebGL Shader for white removal */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <canvas
                ref={(canvas) => {
                  if (canvas) {
                    const gl = canvas.getContext('webgl')
                    if (gl) {
                      // WebGL Shader for white background removal
                      const vertexShaderSource = `
                        attribute vec2 a_position;
                        varying vec2 v_texCoord;
                        void main() {
                          v_texCoord = vec2((a_position.x + 1.0) / 2.0, (a_position.y + 1.0) / 2.0);
                          gl_Position = vec4(a_position, 0.0, 1.0);
                        }
                      `
                      
                      const fragmentShaderSource = `
                        precision mediump float;
                        uniform sampler2D u_image;
                        varying vec2 v_texCoord;
                        
                        void main() {
                          vec4 pixel = texture2D(u_image, v_texCoord);
                          
                          // White removal shader
                          float whiteThreshold = 0.9;
                          float brightness = (pixel.r + pixel.g + pixel.b) / 3.0;
                          float whiteness = max(max(pixel.r, pixel.g), pixel.b);
                          float minChannel = min(min(pixel.r, pixel.g), pixel.b);
                          
                          // If pixel is white, make it transparent
                          if (whiteness > whiteThreshold && (whiteness - minChannel) < 0.1) {
                            pixel.a = 0.0;
                          }
                          
                          gl_FragColor = pixel;
                        }
                      `
                      
                      const vertexShader = gl.createShader(gl.VERTEX_SHADER)
                      gl.shaderSource(vertexShader, vertexShaderSource)
                      gl.compileShader(vertexShader)
                      
                      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
                      gl.shaderSource(fragmentShader, fragmentShaderSource)
                      gl.compileShader(fragmentShader)
                      
                      const program = gl.createProgram()
                      gl.attachShader(program, vertexShader)
                      gl.attachShader(program, fragmentShader)
                      gl.linkProgram(program)
                      gl.useProgram(program)
                      
                      // Create buffer
                      const positionBuffer = gl.createBuffer()
                      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
                      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                        -1, -1,
                         1, -1,
                        -1,  1,
                         1,  1,
                      ]), gl.STATIC_DRAW)
                      
                      const positionLocation = gl.getAttribLocation(program, 'a_position')
                      gl.enableVertexAttribArray(positionLocation)
                      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
                      
                      // Load image
                      const image = new Image()
                      image.src = '/1786855398290.png'
                      image.onload = () => {
                        canvas.width = image.width
                        canvas.height = image.height
                        gl.viewport(0, 0, canvas.width, canvas.height)
                        
                        const texture = gl.createTexture()
                        gl.bindTexture(gl.TEXTURE_2D, texture)
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
                        
                        gl.clearColor(0.0, 0.0, 0.0, 0.0)
                        gl.clear(gl.COLOR_BUFFER_BIT)
                        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
                      }
                    }
                  }
                }}
                className="w-full h-full"
                style={{
                  filter: 'brightness(1.1) contrast(1.1)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Small Card Below - Row 1 Column 1 */}
        <div 
          className="mx-4 mt-4 rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
            border: '1px solid rgba(255, 215, 0, 0.4)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
            animation: mounted ? 'fadeInUp 0.6s ease-out 0.5s' : 'none',
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
                animation: 'glowPulse 2s ease-in-out infinite'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <div>
              <p className="text-gray-800 font-bold text-lg">Add Funds</p>
              <p className="text-gray-500 text-sm">Tap to add more coins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
