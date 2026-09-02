'use client';

import React from 'react';

interface RoomtaskProps {
  onBack?: () => void;
}

export default function Roomtask({ onBack }: RoomtaskProps) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto scrollbar-none">
      
      {/* 1. BOTTOM BACKGROUND (Fixed in background so it never disappears) */}
      <div 
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/file_0000000077748211a3cf580b616ab31b.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 2. TOP BACKGROUND (Exact 50vh with fade mixing at bottom) */}
      <div 
        className="absolute top-0 left-0 w-full h-[50vh] z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/file_00000000cb748211bf0120855b80f449.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
        }}
      />

      {/* TOP LEFT BACK ICON (Exact Corner) */}
      <button 
        onClick={onBack} 
        className="absolute z-50 p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
        style={{
          top: 'max(12px, env(safe-area-inset-top))',
          left: '12px'
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          className="w-8 h-8 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round drop-shadow-md"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>


      {/* ================= CONTENT CONTAINER ================= */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Spacer to push middle image down near the 50vh mark */}
        <div className="h-[38vh] w-full"></div>

        {/* 3. MIDDLE OVERLAP IMAGE (Between top and bottom) */}
        <div className="w-full flex justify-center px-4 -mb-2">
          <img 
            src="/file_00000000f2908208a7b6a2b73c3bbf36.png" 
            alt="Middle Decoration" 
            className="w-[90%] max-w-[340px] object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>

        {/* 4. 12 IMAGES (1 ROW = 1 IMAGE, Ek ke niche ek) */}
        <div className="w-full flex flex-col items-center gap-3 mt-4 pb-12 px-4">
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

