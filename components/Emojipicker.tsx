"use client";

import React, { useState } from "react";
import { Smile } from "lucide-react";
import WhiteColorRemovalShader from "./WhiteColorRemovalShader";

export default function EmojiPicker({ onClose, onSelectEmoji }: { onClose: () => void, onSelectEmoji: (e: any) => void }) {
  const [selectedGif, setSelectedGif] = useState("");

  // PNG stickers data - with WebShader background removal
  const gifStickers = [
    { id: 'laugh', name: 'Laugh', src: '/512.png', removeColor: 'white' },
    { id: 'sad', name: 'Sad', src: '/512 (6).png', removeColor: 'white' },
    { id: 'love', name: 'Love', src: '/512 (3).png', removeColor: 'white' },
    { id: 'thinking', name: 'Thinking', src: '/512 (2).png', removeColor: 'white' },
    { id: 'party', name: 'Party', src: '/512 (16).png', removeColor: 'white' },
    { id: 'loving', name: 'Loving', src: '/512 (15).png', removeColor: 'white' },
    { id: 'smart', name: 'Smart', src: '/512 (13).png', removeColor: 'white' },
    { id: 'irritating', name: 'Irritating', src: '/512 (12).png', removeColor: 'white' },
    { id: 'rolling', name: 'Rolling', src: '/512 (10).png', removeColor: 'white' },
    { id: 'unamused', name: 'Unamused', src: '/512 (11).png', removeColor: 'white' },
    { id: 'pleading', name: 'Pleading', src: '/512 (4).png', removeColor: 'white' },
    { id: 'hug', name: 'Hug', src: '/512 (8).png', removeColor: 'white' },
    { id: 'kiss', name: 'Kiss-R', src: '/512 (14).png', removeColor: 'white' },
  ];

  const handleGifClick = (gif: any) => {
    setSelectedGif(gif.name);
    if (onSelectEmoji) {
      onSelectEmoji(gif);
    }
    // Auto close after selection
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
      {/* 40vh Black Sheet Container */}
      <div className="h-[40vh] w-full bg-black text-white flex flex-col justify-between rounded-t-3xl border-t border-white/10 shadow-2xl px-4 pt-3 pb-3">
        
        {/* TOP HEADING */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base font-bold tracking-wide text-white">Stickers</h2>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-md bg-white/5 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* PNG STICKERS GRID - 4 per row, WebShader for background removal */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-none">
          <div className="grid grid-cols-4 gap-2 place-items-center">
            {gifStickers.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleGifClick(gif)}
                className={`w-full aspect-square rounded-xl transition-all active:scale-90 flex items-center justify-center overflow-hidden border ${
                  selectedGif === gif.name
                    ? "bg-blue-600/30 border-blue-500 scale-105"
                    : "hover:bg-white/10 border-transparent"
                }`}
              >
                {/* WebShader - STRICT background removal for PNG */}
                <WhiteColorRemovalShader
                  imageSrc={gif.src}
                  threshold={0.85}
                  removeColor={gif.removeColor || 'white'}
                  className="w-full h-full"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    pointerEvents: 'none',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* NO BOTTOM BAR - Removed */}
      </div>
    </div>
  );
}
