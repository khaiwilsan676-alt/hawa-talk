'use client';

import React from 'react';

interface RoomtaskProps {
  onBack?: () => void;
}

export default function Roomtask({ onBack }: RoomtaskProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#120a1f] overflow-x-hidden overflow-y-auto scrollbar-none">
      
      {/* ================= 1. BACKGROUNDS (50vh / 50vh) ================= */}
      
      {/* BOTTOM BACKGROUND (Exactly 50vh, starts exactly from middle) */}
      <div 
        className="fixed top-[50vh] left-0 w-full h-[100vh] z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/file_0000000077748211a3cf580b616ab31b.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
        }}
      />

      {/* TOP BACKGROUND (55vh rakha hai taaki bottom wale ke upar 5vh ka smooth mix/fade aa sake) */}
      <div 
        className="fixed top-0 left-0 w-full h-[55vh] z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/file_00000000cb748211bf0120855b80f449.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          /* Yeh mask niche se black ko transparent karke fade banayega */
          maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
        }}
      />

      {/* ================= 2. FOREGROUND (Scrollable Content) ================= */}
      
      {/* BACK ICON (Top Left Corner Ekdam) */}
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

      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Spacer: Yeh space isliye hai taaki "Middle Image" exact 50vh line par pahuche */}
        <div className="w-full" style={{ height: 'calc(50vh - 45px)' }}></div>

        {/* MIDDLE IMAGE (Dono background ke ekdum beech mein) */}
        <div className="w-full flex justify-center px-4">
          <img 
            src="/file_00000000f2908208a7b6a2b73c3bbf36.png" 
            alt="Middle Decoration" 
            className="w-[90%] max-w-[340px] object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>

        {/* 12 IMAGES (Bina kisi Card ke, 1 Row = 1 Image) */}
        <div className="w-full flex flex-col items-center gap-0.5 mt-6 pb-12 px-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <img 
              key={index}
              src="/file_000000004fd0821198ed4e26d5008b16.png"
              alt={`Task Item ${index + 1}`}
              className="w-[100%] max-w-[340px] object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
              draggable={false}
            />
          ))}
        </div>

      </div>

    </div>
  );
}

