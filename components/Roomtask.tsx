'use client';

import React from 'react';

interface RoomtaskProps {
  onBack?: () => void;
}

export default function Roomtask({ onBack }: RoomtaskProps) {
  return (
    <div className="relative w-full h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#120a1f] scrollbar-none">
      <div className="relative w-full min-h-full flex flex-col">
        {/* ================= TOP BACKGROUND (Neeche se fade hoga) ================= */}
        <div 
          className="absolute top-0 left-0 w-full h-[55vh] z-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/file_00000000cb748211bf0120855b80f449.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, black 98%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 98%, transparent 100%)',
          }}
        />

        
                   {/* BOTTOM BACKGROUND */}
        <div 
          className="absolute top-[50vh] left-0 w-full h-[160vh] z-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/file_0000000077748211a3cf580b616ab31b.png)',
            backgroundSize: '100% 100%', // <-- Yahan 'cover' ki jagah '100% 100%' kar de
            backgroundPosition: 'top center',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 2%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 2%, black 100%)',
          }}
        />

        {/* BACK ICON */}
        <button 
          onClick={onBack} 
          className="absolute z-50 p-2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
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

        {/* FOREGROUND CONTENT */}
        <div className="relative z-10 w-full flex flex-col items-center">
          
          <div className="w-full" style={{ height: 'calc(45vh - 45px)' }}></div>

          <div className="w-full flex justify-center px-4">
            <img 
              src="/file_00000000f2908208a7b6a2b73c3bbf36.png" 
              alt="Middle Decoration" 
              className="w-[90%] max-w-[340px] object-contain drop-shadow-2xl"
              draggable={false}
            />
          </div>

          {/* 12 IMAGES (Scroll area ke sath) */}
          <div className="w-full flex flex-col items-center -space-y-[160px] mt-6 pb-0 px-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <img 
                key={index}
                src="/file_000000004fd0821198ed4e26d5008b16.png"
                alt={`Task Item ${index + 1}`}
                className="relative z-10 w-[100%] max-w-[310px] h-[130px] object-fill cursor-pointer transition-transform hover:scale-105 active:scale-95"
                draggable={false}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

