'use client';

import React from 'react';

interface RoomtaskProps {
  onBack?: () => void;
}

export default function Roomtask({ onBack }: RoomtaskProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#120a1f] overflow-x-hidden overflow-y-auto scrollbar-none">
      
      {/* ======================= BACKGROUNDS ======================= */}
      
      {/* 1. Bottom Background Image (Starts from top but covers full scrollable height) */}
      <div 
        className="absolute top-0 left-0 w-full h-full min-h-[150dvh]"
        style={{
          backgroundImage: 'url(/file_0000000077748211a3cf580b616ab31b.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'repeat-y',
          zIndex: 0,
        }}
      />

      {/* 2. Top Background Image (40vh) with Bottom Fade Mixing */}
      <div 
        className="absolute top-0 left-0 w-full h-[45vh]"
        style={{
          backgroundImage: 'url(/file_00000000cb748211bf0120855b80f449.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
          /* Yeh dono line Top image ko niche se transparent karke Bottom image mein mix kar dengi */
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        }}
      />


      {/* ======================= FOREGROUND CONTENT ======================= */}
      
      <div className="relative z-10 w-full min-h-screen flex flex-col pb-12">
        
        {/* Top Left Arrow Icon (No Background) */}
        <div className="pt-12 px-4 sticky top-0 z-50">
          <button 
            onClick={onBack} 
            className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round drop-shadow-md"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        </div>

        {/* Spacer to push middle image down to the 40vh mixing point */}
        <div className="h-[20vh] sm:h-[25vh]"></div>

        {/* Middle Image (Overlapping Top & Bottom Backgrounds) */}
        <div className="w-full flex justify-center -mb-6 relative z-20">
          <img 
            src="/file_00000000f2908208a7b6a2b73c3bbf36.png" 
            alt="Middle Decorative Elements" 
            className="w-[85%] max-w-[320px] object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>

        {/* 12 Cards Container (On top of Bottom Image) */}
        <div className="px-4 mt-10 w-full relative z-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            {/* Array of 12 Cards */}
            {Array.from({ length: 12 }).map((_, index) => (
              <div 
                key={index}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-lg flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer border border-white/10"
                style={{
                  backgroundImage: 'url(/file_000000004fd0821198ed4e26d5008b16.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Agar Cards ke andar koi text ya icon likhna ho toh yahan add kar sakte ho */}
                <span className="text-white/80 font-bold text-sm tracking-wider drop-shadow-md">
                  TASK {index + 1}
                </span>
              </div>
            ))}

          </div>
        </div>

      </div>

    </div>
  );
}

