'use client';

import React, { useState } from 'react';

interface FourgrideProps {
  onClose: () => void;
  onClearChat: () => void;
}

export default function Fourgride({ onClose, onClearChat }: FourgrideProps) {
  // Toggle states
  const [publicMsgOff, setPublicMsgOff] = useState(false);
  const [entryEffect, setEntryEffect] = useState(false);
  const [giftEffect, setGiftEffect] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  // Toggle handlers
  const togglePublicMsg = () => setPublicMsgOff(!publicMsgOff);
  const toggleEntryEffect = () => setEntryEffect(!entryEffect);
  const toggleGiftEffect = () => setGiftEffect(!giftEffect);
  const toggleSpeaker = () => setSpeaker(!speaker);

  // Clear chat handler
  const handleClearChat = () => {
    onClearChat();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Bottom sheet */}
      <div
        className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl px-4 pt-4 pb-6 animate-slide-up max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Tools</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-gray-700 stroke-[2.5]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Row 1 – 4 items */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* 1. Clear Chat */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleClearChat}
              className="transition-transform hover:scale-105"
            >
              <img src="/IMG_20260814_110525.png" alt="Clear Chat" className="w-16 h-16 object-contain" />
            </button>
            <span className="text-[10px] text-gray-700 mt-1 text-center">Clear-Chat</span>
          </div>

          {/* 2. Public msg Off with toggle overlay */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img src="/IMG_20260814_110608.png" alt="Public msg Off" className="w-16 h-16 object-contain" />
              <button
                onClick={togglePublicMsg}
                className={`absolute bottom-0 right-0 w-8 h-4 rounded-full flex items-center transition-colors ${
                  publicMsgOff ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                    publicMsgOff ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <span className="text-[10px] text-gray-700 mt-1 whitespace-nowrap">Public msg</span>
          </div>

          {/* 3. Entry Effect with toggle overlay */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img src="/IMG_20260814_110709.png" alt="Entry Effect" className="w-16 h-16 object-contain" />
              <button
                onClick={toggleEntryEffect}
                className={`absolute bottom-0 right-0 w-8 h-4 rounded-full flex items-center transition-colors ${
                  entryEffect ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                    entryEffect ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <span className="text-[10px] text-gray-700 mt-1 whitespace-nowrap">Entry Effect</span>
          </div>

          {/* 4. Gift Effect with toggle overlay */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img src="/IMG_20260814_110727.png" alt="Gift Effect" className="w-16 h-16 object-contain" />
              <button
                onClick={toggleGiftEffect}
                className={`absolute bottom-0 right-0 w-8 h-4 rounded-full flex items-center transition-colors ${
                  giftEffect ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                    giftEffect ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <span className="text-[10px] text-gray-700 mt-1 whitespace-nowrap">Gift Effect</span>
          </div>
        </div>

        {/* Row 2 – 4 items */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* 5. Music */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => console.log('Music')}
              className="transition-transform hover:scale-105"
            >
              <img src="/IMG_20260814_110437.png" alt="Music" className="w-20 h-18 object-contain" />
            </button>
            <span className="text-[10px] text-gray-700 mt-1">Music</span>
          </div>

          {/* 6. Speaker with toggle (unchanged) */}
          <div className="flex flex-col items-center">
            <img src="/IMG_20260814_110628.png" alt="Speaker" className="w-16 h-16 object-contain" />
            <div className="flex items-center mt-1 space-x-1">
              <span className="text-[10px] text-gray-700 whitespace-nowrap">Speaker</span>
              <button
                onClick={toggleSpeaker}
                className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                  speaker ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                    speaker ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 7. Store */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => console.log('Store')}
              className="transition-transform hover:scale-105"
            >
              <img src="/IMG_20260814_110501.png" alt="Store" className="w-16 h-16 object-contain" />
            </button>
            <span className="text-[10px] text-gray-700 mt-1">Store</span>
          </div>

          {/* 8. My-Iteam */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => console.log('My Item')}
              className="transition-transform hover:scale-105"
            >
              <img src="/IMG_20260814_110545.png" alt="My Item" className="w-16 h-16 object-contain" />
            </button>
            <span className="text-[10px] text-gray-700 mt-1">My-Iteam</span>
          </div>
        </div>

        {/* Games Section */}
        <div className="mt-2">
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Games</h3>
          </div>
          <div className="flex justify-around">
            {/* Games */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => console.log('Games')}
                className="transition-transform hover:scale-105"
              >
                <img src="/IMG_20260814_111008.png" alt="Games" className="w-16 h-16 object-contain" />
              </button>
              <span className="text-[10px] text-gray-700 mt-1">Games</span>
            </div>

            {/* Lucky bag */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => console.log('Lucky Bag')}
                className="transition-transform hover:scale-105"
              >
                <img src="/IMG_20260814_110743.png" alt="Lucky bag" className="w-16 h-16 object-contain" />
              </button>
              <span className="text-[10px] text-gray-700 mt-1">Lucky bag</span>
            </div>

            {/* Pk Battle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => console.log('PK Battle')}
                className="transition-transform hover:scale-105"
              >
                <img src="/IMG_20260814_110802.png" alt="Pk Battle" className="w-16 h-16 object-contain" />
              </button>
              <span className="text-[10px] text-gray-700 mt-1">Pk Battle</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slideUp 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
        }
