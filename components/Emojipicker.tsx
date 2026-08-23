"use client";

import React, { useState } from "react";
import { Smile, X } from "lucide-react";

interface EmojiPickerProps {
  onClose?: () => void;
  onSelectEmoji?: (emoji: { id: string; name: string; src: string }) => void;
}

export default function EmojiPicker({ onClose, onSelectEmoji }: EmojiPickerProps) {
  const [selectedGif, setSelectedGif] = useState<string>("");

  const gifStickers = [
    { id: "laugh", name: "Laugh", src: "/512.gif" },
    { id: "sad", name: "Sad", src: "/512 (6).gif" },
    { id: "love", name: "Love", src: "/512 (3).gif" },
    { id: "thinking", name: "Thinking", src: "/512 (2).gif" },
    { id: "party", name: "Party", src: "/512 (16).gif" },
    { id: "loving", name: "Loving", src: "/512 (15).gif" },
    { id: "smart", name: "Smart", src: "/512 (13).gif" },
    { id: "irritating", name: "Irritating", src: "/512 (12).gif" },
    { id: "rolling", name: "Rolling", src: "/512 (10).gif" },
    { id: "unamused", name: "Unamused", src: "/512 (11).gif" },
    { id: "pleading", name: "Pleading", src: "/512 (4).gif" },
    { id: "hug", name: "Hug", src: "/512 (8).gif" },
    { id: "kiss", name: "Kiss-R", src: "/512 (14).gif" },
  ];

  const handleGifClick = (gif: { id: string; name: string; src: string }) => {
    setSelectedGif(gif.name);
    if (onSelectEmoji) {
      onSelectEmoji(gif);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-transparent pointer-events-none">
      {/* Tap outside area to close (No blur, No black tint) */}
      <div 
        className="flex-1 w-full pointer-events-auto" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Bottom Sheet Modal */}
      <div className="h-[42vh] w-full bg-[#121212] text-white flex flex-col justify-between rounded-t-3xl border-t border-white/10 shadow-2xl px-4 pt-3.5 pb-4 pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white">Stickers & Reactions</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sticker Grid */}
        <div className="flex-1 overflow-y-auto py-3 pr-0.5 scrollbar-none">
          <div className="grid grid-cols-4 gap-2.5 place-items-center">
            {gifStickers.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => handleGifClick(gif)}
                className={`w-full aspect-square rounded-2xl p-2.5 transition-all duration-150 active:scale-90 flex items-center justify-center border ${
                  selectedGif === gif.name
                    ? "bg-blue-600/25 border-blue-500 scale-105"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/5"
                }`}
              >
                <img
                  src={encodeURI(gif.src)}
                  alt={gif.name}
                  loading="lazy"
                  className="w-full h-full object-contain pointer-events-none select-none"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

