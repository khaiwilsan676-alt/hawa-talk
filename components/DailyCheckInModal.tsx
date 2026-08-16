import React, { useEffect, useState } from 'react';

// Rewards data – different images and custom text
const SIGN_IN_REWARDS = [
  { day: 1, reward: '+5000', image: '1786855398290.png', color: '#FF6B6B' },
  { day: 2, reward: '+5000', image: '1786855398290.png', color: '#FFA726' },
  { day: 3, reward: '×2 Days', image: '1786857172378.png', color: '#66BB6A' },
  { day: 4, reward: '+10,000', image: '1786855398290.png', color: '#42A5F5' },
  { day: 5, reward: '+10,000', image: '1786855398290.png', color: '#AB47BC' },
  { day: 6, reward: 'Special', image: '1786855398290.png', color: '#EF5350', special: true },
  { day: 7, reward: '500 Coins + Special Frame', image: '1786855398290.png', color: '#FFD700' },
];

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  onSignIn: () => void; // parent handles increment and localStorage
}

export default function DailyCheckInModal({
  isOpen,
  onClose,
  currentDay,
  onSignIn,
}: DailyCheckInModalProps) {
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setViewportHeight(window.innerHeight);
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    window.addEventListener('orientationchange', setHeight);
    return () => {
      window.removeEventListener('resize', setHeight);
      window.removeEventListener('orientationchange', setHeight);
    };
  }, []);

  if (!isOpen) return null;

  // Render the image icon with specific image for each day
  const renderIcon = (imageSrc: string, size: string = 'w-8 h-8') => {
    return (
      <img 
        src={imageSrc} 
        alt="reward" 
        className={`${size} mx-auto object-contain`} 
      />
    );
  };

  // Special render for Day 6 with two rewards
  const renderDay6Special = () => {
    return (
      <div className="flex items-center justify-center gap-2">
        {/* Left side - Coins */}
        <div className="flex flex-col items-center">
          {renderIcon('1786855398290.png', 'w-7 h-7')}
          <span className="text-[9px] font-bold text-gray-700 mt-0.5 whitespace-nowrap">+10,000</span>
        </div>
        
        {/* Divider */}
        <div className="w-px h-10 bg-gray-300"></div>
        
        {/* Right side - Special image */}
        <div className="flex flex-col items-center">
          {renderIcon('/1784875884052~2.jpg', 'w-7 h-7')}
          <span className="text-[9px] font-bold text-gray-700 mt-0.5 whitespace-nowrap">×3 Days</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4"
      style={{
        animation: 'modalOverlayIn 0.3s ease-out',
        height: viewportHeight ? `calc(var(--vh, 1vh) * 100)` : '100vh',
        paddingTop: '60px',
      }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden mb-4"
        style={{
          animation: 'modalFadeIn 0.3s ease-out',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div
          className="relative px-6 pt-6 pb-4 text-center"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full" />
          </div>
          <h2 className="text-xl font-bold text-white relative z-10">Daily Sign-in</h2>
          <p className="text-blue-100 text-sm mt-1 relative z-10">
            Day {currentDay} of 7
          </p>
        </div>

        {/* Rewards grid */}
        <div className="px-5 pt-5 pb-4">
          {/* Days 1-4 */}
          <div className="grid grid-cols-4 gap-1 mb-1">
            {SIGN_IN_REWARDS.slice(0, 4).map((item, index) => (
              <div
                key={item.day}
                className={`relative rounded-xl p-2.5 text-center transition-all bg-white ${
                  index + 1 < currentDay
                    ? 'border-2 border-green-400'
                    : index + 1 === currentDay
                    ? 'border-2 border-blue-500 animate-pulse'
                    : 'border-2 border-gray-200'
                }`}
                style={{ minHeight: '75px' }}
              >
                {/* Day number - half circle inside top-left */}
                <span className="absolute top-0 left-0 w-7 h-5 bg-blue-500 rounded-tl-xl rounded-br-xl flex items-center justify-center text-white text-[10px] font-bold">
                  {item.day}
                </span>
                <div className="mb-0.5 mt-1">{renderIcon(item.image)}</div>
                <div className="text-[10px] font-semibold text-gray-700 whitespace-nowrap">{item.reward}</div>
                {index + 1 < currentDay && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Days 5-6 */}
          <div className="grid grid-cols-2 gap-1 mb-1">
            {/* Day 5 */}
            <div
              className={`relative rounded-xl p-3 text-center transition-all bg-white ${
                5 < currentDay
                  ? 'border-2 border-green-400'
                  : 5 === currentDay
                  ? 'border-2 border-blue-500 animate-pulse'
                  : 'border-2 border-gray-200'
              }`}
              style={{ minHeight: '70px' }}
            >
              <span className="absolute top-0 left-0 w-7 h-5 bg-blue-500 rounded-tl-xl rounded-br-xl flex items-center justify-center text-white text-[10px] font-bold">
                5
              </span>
              <div className="mb-0.5 mt-1">{renderIcon(SIGN_IN_REWARDS[4].image)}</div>
              <div className="text-[10px] font-semibold text-gray-700 whitespace-nowrap">{SIGN_IN_REWARDS[4].reward}</div>
              {5 < currentDay && (
                <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>

            {/* Day 6 - Special with two rewards */}
            <div
              className={`relative rounded-xl p-3 text-center transition-all bg-white ${
                6 < currentDay
                  ? 'border-2 border-green-400'
                  : 6 === currentDay
                  ? 'border-2 border-blue-500 animate-pulse'
                  : 'border-2 border-gray-200'
              }`}
              style={{ minHeight: '70px' }}
            >
              <span className="absolute top-0 left-0 w-7 h-5 bg-blue-500 rounded-tl-xl rounded-br-xl flex items-center justify-center text-white text-[10px] font-bold">
                6
              </span>
              <div className="mt-1">{renderDay6Special()}</div>
              {6 < currentDay && (
                <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Day 7 - Special with Big Rewards badge */}
          <div className="mb-4">
            <div
              className={`relative rounded-xl p-3 text-center transition-all bg-white ${
                7 < currentDay
                  ? 'border-2 border-green-400'
                  : 7 === currentDay
                  ? 'border-2 border-blue-500 animate-pulse'
                  : 'border-2 border-gray-200'
              }`}
              style={{ minHeight: '85px' }}
            >
              <span className="absolute top-0 left-0 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-tl-xl rounded-br-xl text-white text-[10px] font-bold whitespace-nowrap">
                Big Rewards
              </span>
              <div className="mb-1 mt-1">{renderIcon(SIGN_IN_REWARDS[6].image, 'w-9 h-9')}</div>
              <div className="text-xs font-bold text-gray-800 whitespace-nowrap">{SIGN_IN_REWARDS[6].reward}</div>
              {7 < currentDay && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Sign-in button */}
          <button
            onClick={onSignIn}
            disabled={currentDay > 7}
            className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all transform active:scale-95 ${
              currentDay > 7
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
            }`}
          >
            {currentDay > 7 ? 'All Rewards Claimed!' : 'Sign In'}
          </button>
        </div>
      </div>

      {/* Close button - below card */}
      <button
        onClick={onClose}
        className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
        style={{
          animation: 'modalFadeIn 0.3s ease-out',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Global keyframes */}
      <style>{`
        @keyframes modalOverlayIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
