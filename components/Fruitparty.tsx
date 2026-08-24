'use client';

import React, { useState, useEffect } from 'react';

interface FruitpartyProps {
  onClose: () => void;
}

// -------------------------------------------------------------
// Fruit Configuration: Image size, and Positions (X, Y in %)
// -------------------------------------------------------------
const FRUITS_CONFIG = [
  { id: 1, img: '/IMG-20260823-WA0003.jpg', x: 5,  y: 5,  w: 26, h: 26, imgSize: 'w-12 h-12' },
  { id: 2, img: '/IMG-20260823-WA0004.jpg', x: 37, y: 5,  w: 26, h: 26, imgSize: 'w-12 h-12' },
  { id: 3, img: '/IMG-20260823-WA0005.jpg', x: 69, y: 5,  w: 26, h: 26, imgSize: 'w-12 h-12' },
  { id: 4, img: '/IMG-20260823-WA0006.jpg', x: 69, y: 37, w: 26, h: 26, imgSize: 'w-12 h-12' },
  { id: 5, img: '/IMG-20260823-WA0007.jpg', x: 69, y: 69, w: 26, h: 26, imgSize: 'w-12 h-12' },
  { id: 6, img: '/IMG-20260823-WA0008.jpg', x: 37, y: 69, w: 26, h: 26, imgSize: 'w-12 h-12' },
  { id: 7, img: '/IMG-20260823-WA0009.jpg', x: 5,  y: 69, w: 26, h: 26, imgSize: 'w-12 h-12' },
  { id: 8, img: '/IMG-20260822-WA0124.jpg', x: 5,  y: 37, w: 26, h: 26, imgSize: 'w-12 h-12' },
];

// Center Box Configuration
const CENTER_BOX_CONFIG = {
  x: 37,
  y: 37,
  w: 26,
  h: 26,
};

export default function Fruitparty({ onClose }: FruitpartyProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 60vh Bottom Sheet */}
      <div
        className="relative bg-black w-full max-w-md rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col"
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
          /* ---------- Loading State (Purple Screen) ---------- */
          <div className="w-full h-full bg-gradient-to-b from-[#4A154B] via-[#330c36] to-[#1e0520] flex flex-col items-center justify-center px-6">
            {/* Center Logo */}
            <div className="relative mb-6">
              <img
                src="/IMG_20260824_232321.png"
                alt="Fruit Party Logo"
                className="w-24 h-24 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] animate-bounce"
              />
            </div>

            {/* Loading Strip Bar (Yellow) */}
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
          /* ---------- Game Screen ---------- */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* 60vh Background Image */}
            <img
              src="/1787413631876~2.jpg"
              alt="Fruit Party Background"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Square Container with Absolute X/Y Positions */}
            <div className="relative z-10 w-[85%] max-w-[330px] aspect-square rounded-2xl bg-black/25 backdrop-blur-[2px] border border-white/20 shadow-xl">
              {/* 8 Fruit Square Items */}
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
                  className="flex items-center justify-center bg-white/90 rounded-xl shadow-md border border-amber-300/60 hover:scale-105 transition-transform p-1"
                >
                  <img
                    src={fruit.img}
                    alt="Fruit item"
                    className={`${fruit.imgSize} object-contain rounded-md`}
                  />
                </div>
              ))}

              {/* Center Box */}
              <div
                style={{
                  position: 'absolute',
                  left: `${CENTER_BOX_CONFIG.x}%`,
                  top: `${CENTER_BOX_CONFIG.y}%`,
                  width: `${CENTER_BOX_CONFIG.w}%`,
                  height: `${CENTER_BOX_CONFIG.h}%`,
                }}
                className="flex flex-col items-center justify-center bg-black/50 rounded-xl border border-yellow-400/40 p-1"
              >
                <span className="text-yellow-300 text-[10px] font-extrabold tracking-widest text-center leading-tight">
                  FRUIT<br />PARTY
                </span>
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
