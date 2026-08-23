"use client";

import React, { useState, useEffect, useRef } from "react";
import { Smile } from "lucide-react";

interface StickerImageProps {
  imageSrc: string;
  threshold?: number;
  removeColor?: "white" | "black" | "both";
  className?: string;
  style?: React.CSSProperties;
}

// Lightweight 2D Canvas Processor (No WebGL overload/white-out crash)
function TransparentImage({
  imageSrc,
  threshold = 220,
  removeColor = "both",
  className = "",
  style = {},
}: StickerImageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      if (!isMounted || !canvas) return;

      canvas.width = img.naturalWidth || 128;
      canvas.height = img.naturalHeight || 128;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const blackThresh = 255 - threshold;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const isWhite = r >= threshold && g >= threshold && b >= threshold;
          const isBlack = r <= blackThresh && g <= blackThresh && b <= blackThresh;

          if (
            (removeColor === "white" && isWhite) ||
            (removeColor === "black" && isBlack) ||
            (removeColor === "both" && (isWhite || isBlack))
          ) {
            data[i + 3] = 0; // Alpha 0 (Transparent)
          }
        }

        ctx.putImageData(imgData, 0, 0);
      } catch (e) {
        // Fallback to normal draw if CORS blocks getImageData
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [imageSrc, threshold, removeColor]);

  return <canvas ref={canvasRef} className={className} style={style} />;
}

export default function EmojiPicker({
  onClose,
  onSelectEmoji,
}: {
  onClose: () => void;
  onSelectEmoji: (e: any) => void;
}) {
  const [selectedGif, setSelectedGif] = useState("");

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
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div className="h-[40vh] w-full bg-[#121212] text-white flex flex-col justify-between rounded-t-3xl border-t border-white/10 shadow-2xl px-4 pt-3 pb-3">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base font-bold tracking-wide text-white">Stickers</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-none">
          <div className="grid grid-cols-4 gap-3 place-items-center">
            {gifStickers.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleGifClick(gif)}
                className={`w-full aspect-square rounded-xl p-2 transition-all active:scale-90 flex items-center justify-center overflow-hidden border ${
                  selectedGif === gif.name
                    ? "bg-blue-600/30 border-blue-500 scale-105"
                    : "hover:bg-white/5 border-transparent bg-white/[0.02]"
                }`}
              >
                <TransparentImage
                  imageSrc={gif.src}
                  threshold={230}
                  removeColor={gif.removeColor as any}
                  className="w-full h-full object-contain pointer-events-none"
                />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

