"use client";

import React, { useState, useEffect, useRef } from "react";
import { Smile, X } from "lucide-react";

interface StickerItemProps {
  src: string;
  name: string;
  removeColor?: "white" | "black" | "both";
  threshold?: number;
}

// Optimized Sticker Renderer Component
function StickerImage({
  src,
  name,
  removeColor = "both",
  threshold = 230,
}: StickerItemProps) {
  const [processedSrc, setProcessedSrc] = useState<string>(src);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      if (!isMounted) return;

      try {
        const offscreenCanvas = document.createElement("canvas");
        const ctx = offscreenCanvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          setProcessedSrc(src);
          return;
        }

        const width = img.naturalWidth || 128;
        const height = img.naturalHeight || 128;
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const blackThreshold = 255 - threshold;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const isWhite = r >= threshold && g >= threshold && b >= threshold;
          const isBlack = r <= blackThreshold && g <= blackThreshold && b <= blackThreshold;

          if (
            (removeColor === "white" && isWhite) ||
            (removeColor === "black" && isBlack) ||
            (removeColor === "both" && (isWhite || isBlack))
          ) {
            data[i + 3] = 0; // Alpha set to 0 (Transparent)
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const resultDataUrl = offscreenCanvas.toDataURL("image/png");

        if (isMounted) {
          setProcessedSrc(resultDataUrl);
        }
      } catch (err) {
        // Fallback to original image if pixel access is blocked
        if (isMounted) {
          setProcessedSrc(src);
        }
      }
    };

    img.onerror = () => {
      if (isMounted) setIsError(true);
    };

    return () => {
      isMounted = false;
    };
  }, [src, removeColor, threshold]);

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 bg-white/5 rounded-lg">
        Failed
      </div>
    );
  }

  return (
    <img
      src={processedSrc}
      alt={name}
      loading="lazy"
      className="w-full h-full object-contain pointer-events-none transition-transform duration-150"
    />
  );
}

// Main Emoji / Sticker Picker Component
export default function EmojiPicker({
  onClose,
  onSelectEmoji,
}: {
  onClose: () => void;
  onSelectEmoji: (e: any) => void;
}) {
  const [selectedGif, setSelectedGif] = useState<string>("");

  const gifStickers = [
    { id: "laugh", name: "Laugh", src: "/512.png", removeColor: "both" },
    { id: "sad", name: "Sad", src: "/512 (6).png", removeColor: "both" },
    { id: "love", name: "Love", src: "/512 (3).png", removeColor: "both" },
    { id: "thinking", name: "Thinking", src: "/512 (2).png", removeColor: "both" },
    { id: "party", name: "Party", src: "/512 (16).png", removeColor: "both" },
    { id: "loving", name: "Loving", src: "/512 (15).png", removeColor: "both" },
    { id: "smart", name: "Smart", src: "/512 (13).png", removeColor: "both" },
    { id: "irritating", name: "Irritating", src: "/512 (12).png", removeColor: "both" },
    { id: "rolling", name: "Rolling", src: "/512 (10).png", removeColor: "both" },
    { id: "unamused", name: "Unamused", src: "/512 (11).png", removeColor: "both" },
    { id: "pleading", name: "Pleading", src: "/512 (4).png", removeColor: "both" },
    { id: "hug", name: "Hug", src: "/512 (8).png", removeColor: "both" },
    { id: "kiss", name: "Kiss-R", src: "/512 (14).png", removeColor: "both" },
  ];

  const handleGifClick = (gif: any) => {
    setSelectedGif(gif.name);
    if (onSelectEmoji) {
      onSelectEmoji(gif);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Backdrop tap to close */}
      <div className="flex-1 w-full" onClick={onClose} />

      {/* Sheet Container */}
      <div className="h-[42vh] w-full bg-[#141414] text-white flex flex-col justify-between rounded-t-3xl border-t border-white/10 shadow-2xl px-4 pt-3 pb-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white">Stickers & Reactions</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sticker Grid */}
        <div className="flex-1 overflow-y-auto py-3 pr-1 scrollbar-thin scrollbar-thumb-white/10">
          <div className="grid grid-cols-4 gap-2.5 place-items-center">
            {gifStickers.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => handleGifClick(gif)}
                className={`w-full aspect-square rounded-2xl p-2 transition-all duration-150 active:scale-90 flex items-center justify-center border ${
                  selectedGif === gif.name
                    ? "bg-blue-600/20 border-blue-500 scale-105"
                    : "bg-white/[0.03] hover:bg-white/[0.08] border-white/5"
                }`}
              >
                <StickerImage
                  src={gif.src}
                  name={gif.name}
                  removeColor={gif.removeColor as any}
                  threshold={235}
                />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

