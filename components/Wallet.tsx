'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
interface WhiteColorRemovalShaderProps {
  imageSrc: string
  threshold?: number
  className?: string
  style?: React.CSSProperties
}

interface WalletItem {
  id: number
  amount: string
  numericValue: number
  price: string
  rawPrice: number
  bonus?: string
  tag?: string
}

// ==========================================
// 2. STRICT WEBGL WHITE REMOVAL SHADER
// ==========================================
export function WhiteColorRemovalShader({
  imageSrc,
  threshold = 0.82,
  className = '',
  style = {}
}: WhiteColorRemovalShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { 
      premultipliedAlpha: false, 
      alpha: true,
      antialias: true 
    })

    if (!gl) {
      console.warn('WebGL not supported on this device/browser.')
      return
    }

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `

    // Strictly detect and discard pure & near-white shades
    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec2 v_texCoord;
      uniform sampler2D u_texture;
      uniform float u_threshold;
      
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        
        float maxVal = max(color.r, max(color.g, color.b));
        float minVal = min(color.r, min(color.g, color.b));
        float saturation = maxVal - minVal;
        float luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
        
        // Strict transparent cut-off
        if (luminance >= u_threshold && saturation < 0.18) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
          gl_FragColor = color;
        }
      }
    `

    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Setup Quad Geometry
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    )

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Texture Coords (Correct orientation fix: Image seedhi aayegi)
    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
      ]),
      gl.STATIC_DRAW
    )

    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      const thresholdLocation = gl.getUniformLocation(program, 'u_threshold')
      gl.uniform1f(thresholdLocation, threshold)

      canvas.width = image.width
      canvas.height = image.height
      gl.viewport(0, 0, canvas.width, canvas.height)

      gl.clearColor(0.0, 0.0, 0.0, 0.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      setIsLoaded(true)
    }

    image.onerror = () => {
      console.error('Image load failed for WebGL processing:', imageSrc)
    }

    image.src = imageSrc

    return () => {
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(texCoordBuffer)
      gl.deleteTexture(texture)
    }
  }, [imageSrc, threshold])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.25s ease-in-out'
      }}
    />
  )
}

// ==========================================
// 3. MAIN WALLET PAGE COMPONENT
// ==========================================
export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<'coins' | 'diamonds'>('coins')
  const [coinBalance, setCoinBalance] = useState<number>(24500)
  const [diamondBalance, setDiamondBalance] = useState<number>(1250)
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)

  // Coins Cards Dataset (Including 10000 Square Card)
  const coinCards: WalletItem[] = useMemo(() => [
    { id: 1, amount: '100', numericValue: 100, price: '₹10', rawPrice: 10, bonus: '+0' },
    { id: 2, amount: '500', numericValue: 500, price: '₹45', rawPrice: 45, bonus: '+50' },
    { id: 3, amount: '1,000', numericValue: 1000, price: '₹90', rawPrice: 90, bonus: '+150' },
    { id: 4, amount: '5,000', numericValue: 5000, price: '₹450', rawPrice: 450, bonus: '+800' },
    { id: 5, amount: '10,000', numericValue: 10000, price: '₹890', rawPrice: 890, bonus: '+2,000', tag: 'POPULAR' },
    { id: 6, amount: '50,000', numericValue: 50000, price: '₹4,400', rawPrice: 4400, bonus: '+12,000', tag: 'BEST VALUE' }
  ], [])

  // Diamonds Cards Dataset
  const diamondCards: WalletItem[] = useMemo(() => [
    { id: 101, amount: '50', numericValue: 50, price: '₹20', rawPrice: 20 },
    { id: 102, amount: '200', numericValue: 200, price: '₹75', rawPrice: 75 },
    { id: 103, amount: '500', numericValue: 500, price: '₹180', rawPrice: 180 },
    { id: 104, amount: '1,000', numericValue: 1000, price: '₹350', rawPrice: 350 },
    { id: 105, amount: '10,000', numericValue: 10000, price: '₹3,200', rawPrice: 3200, tag: 'HOT' },
    { id: 106, amount: '25,000', numericValue: 25000, price: '₹7,500', rawPrice: 7500, tag: 'VIP' }
  ], [])

  // Purchase Handler Logic
  const handlePurchase = useCallback((card: WalletItem) => {
    setSelectedCardId(card.id)
    setProcessingId(card.id)

    setTimeout(() => {
      if (activeTab === 'coins') {
        const bonusAmount = card.bonus ? parseInt(card.bonus.replace(/[^0-9]/g, ''), 10) || 0 : 0
        setCoinBalance((prev) => prev + card.numericValue + bonusAmount)
      } else {
        setDiamondBalance((prev) => prev + card.numericValue)
      }
      setProcessingId(null)
    }, 600)
  }, [activeTab])

  const activeTheme = useMemo(() => {
    return activeTab === 'coins'
      ? {
          name: 'coins',
          gradient: 'linear-gradient(180deg, #F59E0B 0%, #FDE68A 55%, #FFFFFF 100%)',
          accentColor: 'bg-amber-500 hover:bg-amber-600',
          accentText: 'text-amber-600',
          badgeBg: 'bg-amber-100 text-amber-800',
          activeTabClass: 'bg-amber-500 text-white shadow-md',
          imageSrc: '/images/coin.png',
          currentBalance: coinBalance.toLocaleString('en-IN')
        }
      : {
          name: 'diamonds',
          gradient: 'linear-gradient(180deg, #0284C7 0%, #BAE6FD 55%, #FFFFFF 100%)',
          accentColor: 'bg-sky-600 hover:bg-sky-700',
          accentText: 'text-sky-600',
          badgeBg: 'bg-sky-100 text-sky-800',
          activeTabClass: 'bg-sky-600 text-white shadow-md',
          imageSrc: '/images/diamond.png',
          currentBalance: diamondBalance.toLocaleString('en-IN')
        }
  }, [activeTab, coinBalance, diamondBalance])

  const currentCards = activeTab === 'coins' ? coinCards : diamondCards

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased">
      {/* ==========================================
          TOP 30VH COLOR + WHITE MIX SECTION
          ========================================== */}
      <div
        className="w-full relative flex flex-col justify-between p-5 transition-all duration-500 ease-in-out border-b border-gray-100"
        style={{
          height: '30vh',
          background: activeTheme.gradient
        }}
      >
        {/* Header Bar & Tab Switcher */}
        <div className="flex justify-between items-center w-full z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900 drop-shadow-sm">
              My Wallet
            </span>
          </div>

          <div className="flex items-center bg-white/80 backdrop-blur-md p-1 rounded-full border border-white/60 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('coins')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === 'coins' ? activeTheme.activeTabClass : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Coins
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('diamonds')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === 'diamonds' ? activeTheme.activeTabClass : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diamonds
            </button>
          </div>
        </div>

        {/* Current Balance Display with WebGL Shader */}
        <div className="flex items-center gap-3.5 mb-1 z-10">
          <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center filter drop-shadow-sm">
            <WhiteColorRemovalShader
              key={activeTheme.name}
              imageSrc={activeTheme.imageSrc}
              threshold={0.84}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Total {activeTab === 'coins' ? 'Coins' : 'Diamonds'}
            </span>
            <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {activeTheme.currentBalance}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          CARDS SECTION: 1 ROW = 3 CARDS (SQUARE)
          ========================================== */}
      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">
            Top Up Options
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Instant Delivery
          </span>
        </div>

        {/* Strict 3-Column Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {currentCards.map((card) => {
            const isProcessing = processingId === card.id
            const isSelected = selectedCardId === card.id

            return (
              <div
                key={card.id}
                onClick={() => handlePurchase(card)}
                className={`relative aspect-square bg-white rounded-2xl p-2 flex flex-col justify-between items-center text-center border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-slate-800 shadow-md scale-[1.02]'
                    : 'border-slate-200/90 shadow-sm hover:shadow hover:border-slate-300'
                }`}
              >
                {/* Optional Tag badge */}
                {card.tag && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter whitespace-nowrap shadow-sm">
                    {card.tag}
                  </span>
                )}

                {/* Shader Card Icon */}
                <div className="w-8 h-8 mt-1 flex-shrink-0 flex items-center justify-center">
                  <WhiteColorRemovalShader
                    imageSrc={activeTheme.imageSrc}
                    threshold={0.84}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Amount & Bonus */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <span className="text-xs font-black text-slate-900 leading-tight">
                    {card.amount}
                  </span>
                  {card.bonus && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-1 py-0.2 rounded mt-0.5">
                      {card.bonus}
                    </span>
                  )}
                </div>

                {/* Price CTA Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  className={`w-full py-1 rounded-lg text-[11px] font-bold text-white shadow-sm transition-transform active:scale-95 ${
                    activeTheme.accentColor
                  }`}
                >
                  {isProcessing ? '...' : card.price}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
