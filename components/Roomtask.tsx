'use client';

import React from 'react';

interface RoomtaskProps {
  onBack?: () => void;
}

export default function Roomtask({ onBack }: RoomtaskProps) {
  return (
    /* Yahan 'fixed inset-0 h-[100dvh]' lagaya hai taaki page 100% scroll ho */
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#120a1f] overflow-x-hidden overflow-y-auto scrollbar-none z-[11000]">
      
      {/* ================= 1. BACKGROUNDS ================= */}
      
      {/* BOTTOM BACKGROUND (Thoda niche shift kiya: top-[60vh] kar diya) */}
      <div 
        className="fixed top-[60vh] left-0 w-full h-[100vh] z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/file_0000000077748211a3cf580b616ab31b.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
        }}
      />

      {/* TOP BACKGROUND */}
      <div 
        className="fixed top-0 left-0 w-full h-[55vh] z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/file_00000000cb748211bf0120855b80f449.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
        }}
      />

      {/* ================= 2. FOREGROUND (Scrollable Content) ================= */}
      
      {/* BACK ICON */}
      <button 
        onClick={onBack} 
        className="fixed z-50 p-2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
        style={{
          top: 'max(12px, env(safe-area-inset-top))',
          left: '12px'
        }}
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round drop-shadow-lg">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Spacer: Middle image ko niche lane ke liye */}
        <div className="w-full" style={{ height: 'calc(55vh - 45px)' }}></div>

        {/* MIDDLE IMAGE */}
        <div className="w-full flex justify-center px-4">
          <img 
            src="/file_00000000f2908208a7b6a2b73c3bbf36.png" 
            alt="Middle Decoration" 
            className="w-[90%] max-w-[340px] object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>

        {/* 12 IMAGES (gap-0.5 ke saath ek ke niche ek) */}
        <div className="w-full flex flex-col items-center gap-0.5 mt-4 pb-24 px-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <img 
              key={index}
              src="/file_000000004fd0821198ed4e26d5008b16.png"
              alt={`Task Item ${index + 1}`}
              className="w-full max-w-[340px] object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
              draggable={false}
            />
          ))}
        </div>

      </div>

    </div>
  );
}

