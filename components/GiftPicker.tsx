"use client";

import React, { useState } from "react";
import { Mic, Coins, ChevronUp } from "lucide-react";

export default function GiftPicker({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("Hot");
  const [selectedMultiplier, setSelectedMultiplier] = useState("1×");
  const [showMultipliers, setShowMultipliers] = useState(false);
  const [selectedGift, setSelectedGift] = useState<number | null>(null);

  const tabs = ["Hot", "Lucky", "Luxury", "Event"];
  const multipliers = ["1×", "10×", "299×", "599×", "999×"];

  // Sample Gifts Data
  const sampleGifts = [
    { id: 1, name: "Rose", coins: 10, icon: "🌹" },
    { id: 2, name: "Heart", coins: 99, icon: "❤️" },
    { id: 3, name: "Car", coins: 500, icon: "🏎️" },
    { id: 4, name: "Crown", coins: 1000, icon: "👑" },
    { id: 5, name: "Rocket", coins: 2000, icon: "🚀" },
    { id: 6, name: "Castle", coins: 5000, icon: "🏰" },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
      {/* 40vh Black Sheet Container */}
      <div className="h-[40vh] w-full bg-black text-white flex flex-col justify-between rounded-t-3xl border-t border-white/10 shadow-2xl relative px-4 pt-3 pb-2">
        
        {/* 1. TOP SECTION: Tabs & Mic Icon */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-semibold transition-all relative ${
                  activeTab === tab
                    ? "text-white font-bold scale-105"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab}
                {/* Active Indicator Bar */}
                {activeTab === tab && (
                  <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right Side Mic Icon */}
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-gray-300">
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* 2. MIDDLE SECTION: Gift Items Grid */}
        <div className="flex-1 overflow-y-auto py-3 grid grid-cols-4 gap-3 scrollbar-none">
          {sampleGifts.map((gift) => (
            <div
              key={gift.id}
              onClick={() => setSelectedGift(gift.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border transition cursor-pointer active:scale-95 ${
                selectedGift === gift.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-transparent hover:border-white/20"
              }`}
            >
              <span className="text-2xl mb-1">{gift.icon}</span>
              <span className="text-xs text-gray-300 font-medium">{gift.name}</span>
              <span className="text-[10px] text-yellow-400 flex items-center gap-0.5 mt-0.5">
                <Coins className="w-2.5 h-2.5" /> {gift.coins}
              </span>
            </div>
          ))}
        </div>

        {/* 3. BOTTOM BAR */}
        <div className="flex items-center justify-between border-t border-white/10 pt-2 relative">
          {/* Left Side: Coin Balance */}
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-300 tracking-wide">66457</span>
          </div>

          {/* Right Side: Multiplier Bar & Send Button */}
          <div className="flex items-center gap-2 relative">
            
            {/* Multiplier Dropdown Popup */}
            {showMultipliers && (
              <div className="absolute bottom-12 right-16 bg-zinc-900 border border-white/20 rounded-xl p-1 shadow-xl flex flex-col gap-1 z-50">
                {multipliers.map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setSelectedMultiplier(num);
                      setShowMultipliers(false);
                    }}
                    className={`px-3 py-1 text-xs rounded-lg text-center font-medium transition ${
                      selectedMultiplier === num
                        ? "bg-blue-600 text-white"
                        : "hover:bg-white/10 text-gray-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}

            {/* Multiplier Option Bar Button */}
            <button
              onClick={() => setShowMultipliers(!showMultipliers)}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-200 border border-white/10 transition"
            >
              <span>{selectedMultiplier}</span>
              <ChevronUp className={`w-3.5 h-3.5 transition-transform ${showMultipliers ? "rotate-180" : ""}`} />
            </button>

            {/* Blue Send Button */}
            <button
              onClick={() => console.log(`Sent Gift ID: ${selectedGift} with ${selectedMultiplier}`)}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs px-5 py-2 rounded-full shadow-lg shadow-blue-600/30 transition-all"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

