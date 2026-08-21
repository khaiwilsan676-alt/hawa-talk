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
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.2); }
          50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3); }
        }
        /* Fix for image orientation */
        img {
          transform: scaleY(1) !important;
          -webkit-transform: scaleY(1) !important;
        }
      `}</style>

      {/* TOP SECTION - Dynamic Gradient based on tab */}
      <div
        className="w-full relative overflow-hidden transition-colors duration-500"
        style={{
          height: '30vh',
          background: activeTab === 'wallet' 
            ? 'linear-gradient(160deg, #FFD700 0%, #FFF8DC 50%, #FFD700 100%)'
            : 'linear-gradient(160deg, #FFB6C1 0%, #FFF0F5 50%, #FFB6C1 100%)',
          animation: mounted ? 'slideDown 0.6s ease-out' : 'none',
        }}
      >
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

        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <h1 
            className="text-3xl font-extrabold tracking-wide"
            style={{
              color: '#8B6914',
              textShadow: '0 2px 4px rgba(255,255,255,0.5), 0 0 20px rgba(255,215,0,0.5)',
            }}
          >
            Wallet
          </h1>
        </div>

        <button
          className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-all z-20"
          style={{
            background: 'rgba(255,255,255,0.3)',
            border: '2px solid rgba(139, 101, 8, 0.4)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
          }}
          aria-label="History"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        </button>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-12 pb-3">
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`relative pb-1 text-lg font-bold transition-all ${activeTab === 'wallet' ? 'text-[#8B6914] scale-105' : 'text-gray-400'}`}
          >
            Wallet
            {activeTab === 'wallet' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-[#8B6914] rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('diamonds')}
            className={`relative pb-1 text-lg font-bold transition-all ${activeTab === 'diamonds' ? 'text-pink-500 scale-105' : 'text-gray-400'}`}
          >
            Diamonds
            {activeTab === 'diamonds' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-pink-500 rounded-full" />}
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div 
        className="w-full relative overflow-hidden"
        style={{
          height: '70vh',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
        }}
      >
        {/* COINS TAB CONTENT */}
        {activeTab === 'wallet' && (
          <div className="p-4 space-y-4" style={{ animation: mounted ? 'fadeInUp 0.6s ease-out 0.2s' : 'none' }}>
            <div 
              className="rounded-2xl p-5 relative overflow-hidden flex justify-between items-center"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
                border: '2px solid rgba(255, 215, 0, 0.8)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)' }} />
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-[#8B6914] mb-1">Current balance</h2>
                <p className="text-5xl font-black text-[#8B6914]">2,293</p>
              </div>
              <div className="relative w-28 h-28 flex-shrink-0">
                <img 
                  src="/1786855398290.png" 
                  alt="Coin" 
                  className="w-full h-full object-contain" 
                  style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                />
              </div>
            </div>

            <div 
              className="rounded-xl overflow-hidden text-center shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div className="p-4">
                <img 
                  src="/1786855398290.png" 
                  alt="Coin" 
                  className="w-14 h-14 mx-auto object-contain" 
                  style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                />
                <p className="text-gray-600 font-bold text-xl mt-2">1,000,000</p>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-yellow-300 to-yellow-500 font-bold text-[#8B6914] active:scale-95 transition-transform">
                $ 1.0
              </button>
            </div>

            <div className="text-center">
              <a href="#" className="text-sm text-blue-500 font-medium underline">Coins not received? Click here</a>
            </div>

            <div className="relative">
              <div className="absolute -top-2 right-2 z-10 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-t-md rounded-bl-md">1st Bonus +10% | Then +2%</div>
              <button className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-md active:scale-95 transition-transform">Local payment methods</button>
            </div>

            <div className="relative">
              <div className="absolute -top-2 right-2 z-10 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-t-md rounded-bl-md">Biggest Discount 4%-13%</div>
              <button className="w-full py-4 rounded-xl font-bold text-cyan-600 text-lg bg-white border-2 border-cyan-400 shadow-sm active:scale-95 transition-transform">Coin Seller</button>
            </div>
          </div>
        )}

        {/* DIAMONDS TAB CONTENT */}
        {activeTab === 'diamonds' && (
          <div className="p-4 space-y-4" style={{ animation: mounted ? 'fadeInUp 0.6s ease-out 0.2s' : 'none' }}>
            <div 
              className="rounded-2xl p-5 relative overflow-hidden flex justify-between items-center"
              style={{
                background: 'linear-gradient(135deg, #FF69B4 0%, #FFB6C1 50%, #FF69B4 100%)',
                boxShadow: '0 8px 32px rgba(255, 105, 180, 0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
                border: '2px solid rgba(255, 105, 180, 0.8)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)' }} />
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-pink-700 mb-1">Diamonds balance</h2>
                <p className="text-5xl font-black text-pink-700">4,719</p>
              </div>
              <div className="relative w-28 h-28 flex-shrink-0">
                <img 
                  src="/1787321690452.png" 
                  alt="Diamond" 
                  className="w-full h-full object-contain" 
                  style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                />
              </div>
            </div>

            {/* Exchange Section - Emojis replaced with Images */}
            <div 
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)',
                border: '1px solid rgba(255, 182, 193, 0.8)',
              }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3">Exchange</h3>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <img 
                    src="/1787321690452.png" 
                    alt="Diamond" 
                    className="w-5 h-5 object-contain" 
                    style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                  /> 100
                </span>
                <span className="text-gray-400">=</span>
                <span className="flex items-center gap-1">
                  <img 
                    src="/1786855398290.png" 
                    alt="Coin" 
                    className="w-5 h-5 object-contain" 
                    style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                  /> 33
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white rounded-lg border border-pink-200 p-2 flex items-center gap-2">
                  <img 
                    src="/1787321690452.png" 
                    alt="Diamond" 
                    className="w-6 h-6 object-contain" 
                    style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                  />
                  <input type="text" defaultValue="100" className="bg-transparent outline-none w-full font-medium text-gray-700" />
                </div>
                <div className="text-gray-400 font-bold">=</div>
                <div className="flex-1 bg-white rounded-lg border border-gray-200 p-2 flex items-center gap-2">
                  <img 
                    src="/1786855398290.png" 
                    alt="Coin" 
                    className="w-6 h-6 object-contain" 
                    style={{ transform: 'scaleY(1)', WebkitTransform: 'scaleY(1)' }}
                  />
                  <input type="text" readOnly value="33" className="bg-transparent outline-none w-full font-medium text-gray-700" />
                </div>
              </div>
            </div>

            <button className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gray-300 cursor-not-allowed active:scale-95 transition-transform" disabled>
              Exchange
            </button>
          </div>
        )}
      </div>
    </div>
  )
                                           }
