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
  const renderIcon = (imageSrc: string, size: string = 'w-10 h-10') => {
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
      <div className="flex items-center justify-center gap-4">
        {/* Left side - Coins */}
        <div className="flex flex-col items-center">
          {renderIcon('1786855398290.png', 'w-8 h-8')}
          <span className="text-xs font-bold text-gray-700 mt-1">+10,000</span>
        </div>
        
        {/* Divider */}
        <div className="w-px h-12 bg-gray-300"></div>
        
        {/* Right side - Special image */}
        <div className="flex flex-col items-center">
          {renderIcon('/1784875884052~2.jpg', 'w-8 h-8')}
          <span className="text-xs font-bold text-gray-700 mt-1">×3 Days</span>
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
        className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden mb-4"
        style={{
          animation: 'modalFadeIn 0.3s ease-out',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div
          className="relative px-6 pt-8 pb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-white relative z-10">Daily Sign-in</h2>
          <p className="text-blue-100 text-sm mt-1 relative z-10">
            Day {currentDay} of 7
          </p>
        </div>

        {/* Rewards grid */}
        <div className="px-6 pt-6 pb-4">
          {/* Days 1-4 */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            {SIGN_IN_REWARDS.slice(0, 4).map((item, index) => (
              <div
                key={item.day}
                className={`relative rounded-xl p-3 text-center transition-all bg-white ${
                  index + 1 < currentDay
                    ? 'border-2 border-green-400'
                    : index + 1 === currentDay
                    ? 'border-2 border-blue-500 animate-pulse'
                    : 'border-2 border-gray-200 opacity-60'
                }`}
                style={{ minHeight: '90px' }}
              >
                {/* Day number with blue circular background */}
                <span className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {item.day}
                </span>
                <div className="mb-1">{renderIcon(item.image)}</div>
                <div className="text-xs font-semibold text-gray-700">{item.reward}</div>
                {index + 1 < currentDay && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Days 5-6 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Day 5 */}
            <div
              className={`relative rounded-xl p-4 text-center transition-all bg-white ${
                5 < currentDay
                  ? 'border-2 border-green-400'
                  : 5 === currentDay
                  ? 'border-2 border-blue-500 animate-pulse'
                  : 'border-2 border-gray-200 opacity-60'
              }`}
              style={{ minHeight: '80px' }}
            >
              <span className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                5
              </span>
              <div className="mb-1">{renderIcon(SIGN_IN_REWARDS[4].image)}</div>
              <div className="text-xs font-semibold text-gray-700">{SIGN_IN_REWARDS[4].reward}</div>
              {5 < currentDay && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>

            {/* Day 6 - Special with two rewards */}
            <div
              className={`relative rounded-xl p-4 text-center transition-all bg-white ${
                6 < currentDay
                  ? 'border-2 border-green-400'
                  : 6 === currentDay
                  ? 'border-2 border-blue-500 animate-pulse'
                  : 'border-2 border-gray-200 opacity-60'
              }`}
              style={{ minHeight: '80px' }}
            >
              <span className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                6
              </span>
              {renderDay6Special()}
              {6 < currentDay && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Day 7 - Special with Big Rewards badge */}
          <div className="mb-4">
            <div
              className={`relative rounded-xl p-4 text-center transition-all bg-white ${
                7 < currentDay
                  ? 'border-2 border-green-400'
                  : 7 === currentDay
                  ? 'border-2 border-blue-500 animate-pulse'
                  : 'border-2 border-gray-200 opacity-60'
              }`}
              style={{ minHeight: '100px' }}
            >
              <span className="absolute -top-3 -left-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-xs font-bold shadow-lg">
                Big Rewards
              </span>
              <div className="mb-2">{renderIcon(SIGN_IN_REWARDS[6].image)}</div>
              <div className="text-sm font-bold text-gray-800">{SIGN_IN_REWARDS[6].reward}</div>
              {7 < currentDay && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
            className={`w-full py-3.5 rounded-xl font-bold text-white text-base transition-all transform active:scale-95 ${
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
