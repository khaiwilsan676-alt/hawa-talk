"use client";

import React, { useState } from "react";
import { Smile, Send } from "lucide-react";

export default function EmojiPicker({ onClose, onSelectEmoji }) {
  const [selectedEmoji, setSelectedEmoji] = useState("😊");

  // Frequently used emojis
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "🥹", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍",
    "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝",
    "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩",
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁",
    "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭",
    "😮‍💨", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵",
    "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔"
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
      {/* 40vh Black Sheet Container */}
      <div className="h-[40vh] w-full bg-black text-white flex flex-col justify-between rounded-t-3xl border-t border-white/10 shadow-2xl px-4 pt-3 pb-3">
        
        {/* 1. TOP HEADING */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base font-bold tracking-wide text-white">Emojis</h2>
          </div>
          {/* Close button (optional) */}
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-md bg-white/5"
            >
              ✕
            </button>
          )}
        </div>

        {/* 2. EMOJI GRID AREA */}
        <div className="flex-1 overflow-y-auto py-3 grid grid-cols-8 gap-2 place-items-center scrollbar-none">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedEmoji(emoji);
                if (onSelectEmoji) onSelectEmoji(emoji);
              }}
              className={`text-2xl p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center ${
                selectedEmoji === emoji
                  ? "bg-blue-600/30 border border-blue-500 scale-110"
                  : "hover:bg-white/10 border border-transparent"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* 3. BOTTOM SEND BAR */}
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <span className="text-xs text-gray-400">Selected:</span>
            <span className="text-lg">{selectedEmoji}</span>
          </div>

          {/* Send Button */}
          <button
            onClick={() => console.log("Sent Emoji:", selectedEmoji)}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs px-5 py-2 rounded-full shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

