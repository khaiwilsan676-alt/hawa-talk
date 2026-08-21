'use client'

import { useState, useEffect } from 'react'

interface WalletProps {
  onBack: () => void
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
        }
        @keyframes slideDown {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        /* REAL WEBSHADER - SVG Filter for removing white background */
        .image-shader {
          filter: url(#removeWhite);
          -webkit-filter: url(#removeWhite);
        }
        
        .image-shader-diamond {
          filter: url(#removeWhiteDiamond);
          -webkit-filter: url(#removeWhiteDiamond);
        }
        
        img {
          transform: scaleY(1) !important;
          -webkit-transform: scaleY(1) !important;
        }
      `}</style>

      {/* SVG FILTERS - Real WebShader */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <filter id="removeWhite">
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 1 0
            "
            in="SourceGraphic"
            result="black"
          />
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 1 0
            "
            in="SourceGraphic"
            result="color"
          />
          <feComposite operator="in" in="color" in2="black" result="extract" />
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 0.8 0
            "
            in="extract"
            result="final"
          />
          <feComponentTransfer in="final" result="enhanced">
            <feFuncA type="linear" slope="1.2" />
          </feComponentTransfer>
        </filter>

        <filter id="removeWhiteDiamond">
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 1 0
            "
            in="SourceGraphic"
            result="black"
          />
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 1 0
            "
            in="SourceGraphic"
            result="color"
          />
          <feComposite operator="in" in="color" in2="black" result="extract" />
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 0.9 0
            "
            in="extract"
            result="final"
          />
          <feComponentTransfer in="final" result="enhanced">
            <feFuncA type="linear" slope="1.3" />
            <feFuncR type="linear" slope="1.1" />
            <feFuncG type="linear" slope="1.1" />
            <feFuncB type="linear" slope="1.1" />
          </feComponentTransfer>
        </filter>
      </svg>

      {/* TOP SECTION - Compact with gradient color only */}
      <div
        className="w-full relative overflow-hidden transition-colors duration-500 flex items-center justify-between px-4"
        style={{
          height: '56px',
          background: activeTab === 'wallet' 
            ? 'linear-gradient(160deg, #FFD700 0%, #FFF8DC 50%, #FFD700 100%)'
            : 'linear-gradient(160deg, #FFB6C1 0%, #FFF0F5 50%, #FFB6C1 100%)',
          animation: mounted ? 'slideDown 0.6s ease-out' : 'none',
        }}
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.3)',
            border: '2px solid rgba(139, 101, 8, 0.4)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
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
            textShadow: '0 2px 4px rgba(255,255,255,0.5), 0 0 20px rgba(255,215,0,0.5)',
          }}
        >
          Wallet
        </h1>

        {/* History Button */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.3)',
            border: '2px solid rgba(139, 101, 8, 0.4)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
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
      <div className="flex justify-center gap-8 py-2 border-b border-gray-100">
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

      {/* BOTTOM SECTION - Content */}
      <div 
        className="w-full h-[calc(100%-110px)] overflow-y-auto p-3"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
        }}
      >
        {/* COINS TAB CONTENT */}
        {activeTab === 'wallet' && (
          <div className="space-y-3" style={{ animation: mounted ? 'fadeInUp 0.4s ease-out 0.1s' : 'none' }}>
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
              <div className="relative w-20 h-20 flex-shrink-0 image-shader">
                <img 
                  src="/1786855398290.png" 
                  alt="Coin" 
                  className="w-full h-full object-contain" 
                  style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                />
              </div>
            </div>

            {/* SMALL CARD - 1 row, 1 column, compact */}
            <div 
              className="rounded-xl overflow-hidden shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex-shrink-0 image-shader">
                    <img 
                      src="/1786855398290.png" 
                      alt="Coin" 
                      className="w-full h-full object-contain"
                      style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                    />
                  </div>
                  <span className="text-gray-600 font-bold text-base">1,000,000</span>
                </div>
                <button className="px-4 py-1.5 bg-gradient-to-r from-yellow-300 to-yellow-500 font-bold text-[#8B6914] active:scale-95 transition-transform text-sm rounded-lg">
                  $ 1.0
                </button>
              </div>
            </div>

            <div className="text-center">
              <a href="#" className="text-xs text-blue-500 font-medium underline">Coins not received? Click here</a>
            </div>

            <div className="relative">
              <div className="absolute -top-1.5 right-2 z-10 px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-t-md rounded-bl-md">1st Bonus +10% | Then +2%</div>
              <button className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-md active:scale-95 transition-transform text-sm">Local payment methods</button>
            </div>

            <div className="relative">
              <div className="absolute -top-1.5 right-2 z-10 px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-t-md rounded-bl-md">Biggest Discount 4%-13%</div>
              <button className="w-full py-3 rounded-xl font-bold text-cyan-600 bg-white border-2 border-cyan-400 shadow-sm active:scale-95 transition-transform text-sm">Coin Seller</button>
            </div>
          </div>
        )}

        {/* DIAMONDS TAB CONTENT */}
        {activeTab === 'diamonds' && (
          <div className="space-y-3" style={{ animation: mounted ? 'fadeInUp 0.4s ease-out 0.1s' : 'none' }}>
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
              <div className="relative w-20 h-20 flex-shrink-0 image-shader-diamond">
                <img 
                  src="/1787321690452.png" 
                  alt="Diamond" 
                  className="w-full h-full object-contain" 
                  style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
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
                  <div className="w-4 h-4 image-shader-diamond">
                    <img 
                      src="/1787321690452.png" 
                      alt="Diamond" 
                      className="w-full h-full object-contain"
                      style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                    />
                  </div>
                  100
                </span>
                <span className="text-gray-400">=</span>
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 image-shader">
                    <img 
                      src="/1786855398290.png" 
                      alt="Coin" 
                      className="w-full h-full object-contain"
                      style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                    />
                  </div>
                  33
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white rounded-lg border border-pink-200 p-1.5 flex items-center gap-1.5">
                  <div className="w-5 h-5 image-shader-diamond">
                    <img 
                      src="/1787321690452.png" 
                      alt="Diamond" 
                      className="w-full h-full object-contain"
                      style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                    />
                  </div>
                  <input type="text" defaultValue="100" className="bg-transparent outline-none w-full font-medium text-gray-700 text-sm" />
                </div>
                <div className="text-gray-400 font-bold text-sm">=</div>
                <div className="flex-1 bg-white rounded-lg border border-gray-200 p-1.5 flex items-center gap-1.5">
                  <div className="w-5 h-5 image-shader">
                    <img 
                      src="/1786855398290.png" 
                      alt="Coin" 
                      className="w-full h-full object-contain"
                      style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                    />
                  </div>
                  <input type="text" readOnly value="33" className="bg-transparent outline-none w-full font-medium text-gray-700 text-sm" />
                </div>
              </div>
            </div>

            <button className="w-full py-3 rounded-xl font-bold text-white bg-gray-300 cursor-not-allowed active:scale-95 transition-transform text-sm" disabled>
              Exchange
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
