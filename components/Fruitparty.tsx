'use client';

import React, { useState, useEffect } from 'react';

interface FruitpartyProps {
  onClose: () => void;
}

// -------------------------------------------------------------
// Fruit Positions & Sizes (Strictly 3x3 Grid, Zero/Minimal Gap, Curved Corners)
// Layout:
// [1] [2] [3]
// [8] [T] [4]  <-- T is the 30s Timer at (33.33%, 33.33%)
// [7] [6] [5]
// -------------------------------------------------------------
const FRUITS_CONFIG = [
  { id: 1, img: '/IMG-20260823-WA0003.jpg', x: 0,  y: 0,  w: 24, h: 24 }, // Mango
  { id: 2, img: '/IMG-20260823-WA0004.jpg', x: 33.33, y: 0,  w: 24, h: 24 }, // Banana
  { id: 3, img: '/IMG-20260823-WA0005.jpg', x: 66.66, y: 0,  w: 24, h: 24 }, // Watermelon
  { id: 4, img: '/IMG-20260823-WA0006.jpg', x: 66.66, y: 33.33, w: 24, h: 24 }, // Kiwi
  { id: 5, img: '/IMG-20260823-WA0007.jpg', x: 66.66, y: 66.66, w: 24, h: 24 }, // Grapes
  { id: 6, img: '/IMG-20260823-WA0008.jpg', x: 33.33, y: 66.66, w: 24, h: 24 }, // Apple
  { id: 7, img: '/IMG-20260823-WA0009.jpg', x: 0,  y: 66.66, w: 24, h: 24 }, // Strawberry
  { id: 8, img: '/IMG-20260822-WA0124.jpg', x: 0,  y: 33.33, w: 24, h: 24 }, // Cherry
];

export default function Fruitparty({ onClose }: FruitpartyProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(30);

  // Loading Progress Bar Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 200);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // 30s Countdown Timer Effect (Runs after loading completes and repeats)
  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30; // Reset back to 30s
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 60vh Bottom Sheet (No rounded corners at top) */}
      <div
        className="relative bg-[#330c36] w-full max-w-md shadow-2xl overflow-hidden animate-slide-up flex flex-col rounded-none"
        style={{ height: '60vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition-colors backdrop-blur-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2.5]">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {loading ? (
          /* ---------- Loading State ---------- */
          <div className="w-full h-full bg-gradient-to-b from-[#4A154B] via-[#330c36] to-[#1e0520] flex flex-col items-center justify-center px-6">
            <div className="w-32 h-32 flex items-center justify-center mb-6">
              <img
                src="/IMG_20260824_232321.png"
                alt="Fruit Party Logo"
                className="w-full h-full object-contain [mix-blend-mode:screen]"
              />
            </div>

            <div className="w-48 bg-black/40 rounded-full h-3 p-0.5 border border-yellow-300/40 shadow-inner">
              <div
                className="bg-gradient-to-r from-yellow-400 to-amber-300 h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-yellow-300 text-xs font-semibold mt-2 tracking-wider">
              LOADING {progress}%
            </span>
          </div>
        ) : (
          /* ---------- Game Screen: Full 60vh Main Image + Fruits + Center 30s Countdown ---------- */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Main Background Image */}
            <img
              src="/1787413631876~2.jpg"
              alt="Fruit Party Background"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />

            {/* Grid Container */}
            <div className="relative z-10 w-[88%] max-w-[340px] aspect-square p-[1px]">
              {/* 8 Fruits */}
              {FRUITS_CONFIG.map((fruit) => (
                <div
                  key={fruit.id}
                  style={{
                    position: 'absolute',
                    left: `${fruit.x}%`,
                    top: `${fruit.y}%`,
                    width: `${fruit.w}%`,
                    height: `${fruit.h}%`,
                  }}
                  className="p-[0.5px]"
                >
                  <div className="w-full h-full overflow-hidden rounded-xl bg-black/20">
                    <img
                      src={fruit.img}
                      alt="Fruit"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
              ))}

              {/* Center Box: 30s Countdown */}
              <div
                style={{
                  position: 'absolute',
                  left: '33.33%',
                  top: '33.33%',
                  width: '33.33%',
                  height: '33.33%',
                }}
                className="p-[0.5px]"
              >
                <div className="w-full h-full flex flex-col items-center justify-center rounded-xl bg-black/50 backdrop-blur-[2px] border border-amber-400/40 shadow-inner">
                  <span className="text-amber-400 font-extrabold text-2xl tracking-wider drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]">
                    {countdown}s
                  </span>
                  <span className="text-[10px] text-amber-200/90 font-medium tracking-wide uppercase mt-0.5">
                    Waiting
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

