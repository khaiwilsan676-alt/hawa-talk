"use client";

import React, { useState, useEffect, useRef } from "react";
import { Home, ChevronUp } from "lucide-react";
import Image from "next/image";

export default function GiftPicker({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("Hot");
  const [selectedMultiplier, setSelectedMultiplier] = useState("1×");
  const [showMultipliers, setShowMultipliers] = useState(false);
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const tabs = ["Hot", "Lucky", "Luxury", "Event"];
  const multipliers = ["1×", "10×", "299×", "599×", "999×"];

  // Sample Gifts Data with gift icon - 12 gifts total (8 visible, 4 scroll)
  const sampleGifts = [
    { id: 1, name: "Rose", coins: 10, image: "/IMG_20260815_103351.jpg" },
    { id: 2, name: "Heart", coins: 99, image: "/IMG_20260815_103351.jpg" },
    { id: 3, name: "Car", coins: 500, image: "/IMG_20260815_103351.jpg" },
    { id: 4, name: "Crown", coins: 1000, image: "/IMG_20260815_103351.jpg" },
    { id: 5, name: "Rocket", coins: 2000, image: "/IMG_20260815_103351.jpg" },
    { id: 6, name: "Castle", coins: 5000, image: "/IMG_20260815_103351.jpg" },
    { id: 7, name: "Diamond", coins: 10000, image: "/IMG_20260815_103351.jpg" },
    { id: 8, name: "Yacht", coins: 20000, image: "/IMG_20260815_103351.jpg" },
    { id: 9, name: "Plane", coins: 50000, image: "/IMG_20260815_103351.jpg" },
    { id: 10, name: "Island", coins: 100000, image: "/IMG_20260815_103351.jpg" },
    { id: 11, name: "Star", coins: 500000, image: "/IMG_20260815_103351.jpg" },
    { id: 12, name: "Galaxy", coins: 1000000, image: "/IMG_20260815_103351.jpg" },
  ];

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 50vh Black Sheet Container - Very minimal rounded corners */}
      <div 
        ref={sheetRef}
        className="h-[50vh] w-full max-w-md mx-auto bg-black text-white flex flex-col justify-between rounded-t-md border-t border-white/10 shadow-2xl relative px-4 pt-3 pb-2"
      >
        
        {/* 1. TOP SECTION: House Icon Only */}
        <div className="flex items-center justify-end border-b border-white/10 pb-1">
          {/* Right Side House Icon */}
          <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition text-gray-300">
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. CATEGORY TABS - Inside Sheet */}
        <div className="flex items-center gap-5 py-1.5 border-b border-white/10">
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
                <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* 3. MIDDLE SECTION: Gift Items Grid - 4 Columns, 2 Rows Visible (8 gifts) */}
        <div className="flex-1 overflow-y-auto py-2 grid grid-cols-4 gap-2 scrollbar-none">
          {sampleGifts.map((gift) => (
            <div
              key={gift.id}
              onClick={() => setSelectedGift(gift.id)}
              className={`flex flex-col items-center justify-center p-1.5 bg-black border transition cursor-pointer active:scale-95 rounded-md ${
                selectedGift === gift.id
                  ? "border-blue-500"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="relative w-12 h-12 mb-0.5">
                <Image
                  src={gift.image}
                  alt={gift.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <span className="text-[10px] text-gray-300 font-medium">{gift.name}</span>
              <span className="text-[9px] text-yellow-400 flex items-center gap-0.5 mt-0.5">
                <div className="w-3 h-2 relative overflow-hidden rounded-full">
                  <Image
                    src="/1786768926590.png"
                    alt="Coins"
                    fill
                    className="object-cover"
                    sizes="10px"
                  />
                </div>
                {gift.coins}
              </span>
            </div>
          ))}
        </div>

        {/* 4. BOTTOM BAR */}
        <div className="flex items-center justify-between border-t border-white/10 pt-1.5 relative">
          {/* Left Side: Coin Balance */}
          <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
            <div className="w-5 h-5 relative overflow-hidden rounded-full">
              <Image
                src="/1786768926590.png"
                alt="Coins"
                fill
                className="object-cover"
                sizes="20px"
              />
            </div>
            <span className="text-[10px] font-bold text-yellow-300 tracking-wide">66457</span>
          </div>

          {/* Right Side: Multiplier Bar & Send Button */}
          <div className="flex items-center gap-1.5 relative">
            
            {/* Multiplier Dropdown Popup */}
            {showMultipliers && (
              <div className="absolute bottom-10 right-14 bg-zinc-900 border border-white/20 rounded-md p-1 shadow-xl flex flex-col gap-1 z-50">
                {multipliers.map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setSelectedMultiplier(num);
                      setShowMultipliers(false);
                    }}
                    className={`px-2.5 py-0.5 text-xs rounded-md text-center font-medium transition ${
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
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-xs font-semibold text-gray-200 border border-white/10 transition"
            >
              <span>{selectedMultiplier}</span>
              <ChevronUp className={`w-3 h-3 transition-transform ${showMultipliers ? "rotate-180" : ""}`} />
            </button>

            {/* Blue Send Button */}
            <button
              onClick={() => console.log(`Sent Gift ID: ${selectedGift} with ${selectedMultiplier}`)}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/30 transition-all"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
        }
