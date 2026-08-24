'use client';

import React, { useState, useEffect } from 'react';

interface FruitpartyProps {
  onClose: () => void;
}

// -------------------------------------------------------------
// Fruit Positions & Sizes (Adjust X, Y, W, H % according to the main background square)
// -------------------------------------------------------------
const FRUITS_CONFIG = [
  { id: 1, img: '/IMG-20260823-WA0003.jpg', x: 8,  y: 8,  w: 24, h: 24 }, // Mango
  { id: 2, img: '/IMG-20260823-WA0004.jpg', x: 38, y: 8,  w: 24, h: 24 }, // Banana
  { id: 3, img: '/IMG-20260823-WA0005.jpg', x: 68, y: 8,  w: 24, h: 24 }, // Watermelon
  { id: 4, img: '/IMG-20260823-WA0006.jpg', x: 68, y: 38, w: 24, h: 24 }, // Kiwi
  { id: 5, img: '/IMG-20260823-WA0007.jpg', x: 68, y: 68, w: 24, h: 24 }, // Grapes
  { id: 6, img: '/IMG-20260823-WA0008.jpg', x: 38, y: 68, w: 24, h: 24 }, // Apple
  { id: 7, img: '/IMG-20260823-WA0009.jpg', x: 8,  y: 68, w: 24, h: 24 }, // Strawberry
  { id: 8, img: '/IMG-20260822-WA0124.jpg', x: 8,  y: 38, w: 24, h: 24 }, // Cherry
];

export default function Fruitparty({ onClose }: FruitpartyProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

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

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 60vh Bottom Sheet (No rounded corners) */}
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
          /* ---------- Loading State (Purple Screen with White Color Removal Shader/Filter) ---------- */
          <div className="w-full h-full bg-gradient-to-b from-[#4A154B] via-[#330c36] to-[#1e0520] flex flex-col items-center justify-center px-6">
            {/* Center Logo with white background blend (mix-blend-multiply removes solid white) */}
            <div className="w-28 h-28 flex items-center justify-center mb-6">
              <img
                src="/IMG_20260824_232321.png"
                alt="Fruit Party Logo"
                className="w-full h-full object-contain mix-blend-multiply filter contrast-125"
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
          /* ---------- Game Screen: Full 60vh Main Image + Pure Raw Fruits Overlay ---------- */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Puri Main Image strictly fitted inside 60vh */}
            <img
              src="/1787413631876~2.jpg"
              alt="Fruit Party Background"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />

            {/* Fruits Overlay (Original images placed directly on top, no cards, no borders) */}
            <div className="relative z-10 w-full h-full">
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
                  className="flex items-center justify-center"
                >
                  <img
                    src={fruit.img}
                    alt="Fruit"
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
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
