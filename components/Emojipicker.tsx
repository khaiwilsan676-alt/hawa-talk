"use client";

import React, { useState, useRef, useEffect } from "react";
import { Smile, X } from "lucide-react";

interface EmojiPickerProps {
  onClose?: () => void;
  onSelectEmoji?: (emoji: { id: string; name: string; src: string }) => void;
}

// Sub-component to keep GIF paused on first frame until hovered/touched
function PausedGifItem({
  src,
  name,
  onClick,
}: {
  src: string;
  name: string;
  onClick: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameDataUrl, setFrameDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = encodeURI(src);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 64;
      canvas.height = img.naturalHeight || 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          setFrameDataUrl(canvas.toDataURL());
        } catch {
          // Fallback if crossOrigin restricts
          setFrameDataUrl(encodeURI(src));
        }
      }
    };
  }, [src]);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsPlaying(true)}
      onMouseLeave={() => setIsPlaying(false)}
      onTouchStart={() => setIsPlaying(true)}
      onTouchEnd={() => setIsPlaying(false)}
      className="w-full flex flex-col items-center justify-center gap-1.5 p-1 transition-transform active:scale-90 bg-transparent border-0 outline-none"
    >
      <div className="w-12 h-12 flex items-center justify-center">
        <img
          src={isPlaying || !frameDataUrl ? encodeURI(src) : frameDataUrl}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain pointer-events-none select-none"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      </div>
      <span className="text-[11px] font-medium text-gray-300 text-center tracking-tight truncate w-full">
        {name}
      </span>
    </button>
  );
}

export default function EmojiPicker({ onClose, onSelectEmoji }: EmojiPickerProps) {
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
    if (onSelectEmoji) {
      onSelectEmoji(gif);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-transparent pointer-events-none">
      {/* Outside click closer */}
      <div 
        className="flex-1 w-full pointer-events-auto" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Bottom Sheet Modal */}
      <div className="h-[42vh] w-full bg-[#121212] text-white flex flex-col justify-between rounded-t-2xl border-t border-white/10 shadow-2xl px-4 pt-3.5 pb-4 pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white">Emojis</h2>
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

        {/* Sticker Grid (Without Card Containers) */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-none">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 place-items-center">
            {gifStickers.map((gif) => (
              <PausedGifItem
                key={gif.id}
                src={gif.src}
                name={gif.name}
                onClick={() => handleGifClick(gif)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
