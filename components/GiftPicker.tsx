"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronUp } from "lucide-react";
import Image from "next/image";

export default function GiftPicker({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("Hot");
  const [selectedMultiplier, setSelectedMultiplier] = useState("1×");
  const [showMultipliers, setShowMultipliers] = useState(false);
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const tabs = ["Hot", "Lucky", "Luxury", "Event"];
  const multipliers = ["1×", "10×", "299×", "599×", "999×"];

  // Hot Tab Gifts
  const hotGifts = [
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

  // Lucky Tab Gifts
  const luckyGifts = [
    { id: 101, name: "Kiss", coins: 1999, image: "/IMG_20260906_000443.png" },
    { id: 102, name: "Nut", coins: 3999, image: "/IMG_20260906_000508.png" },
    { id: 103, name: "Mahjong", coins: 5999, image: "/IMG_20260906_000521.png" },
    { id: 104, name: "Lucky Clover", coins: 4250, image: "/IMG_20260906_000541.png" },
    { id: 105, name: "Lucky Charm", coins: 7000, image: "/IMG_20260906_000624.png" },
    { id: 106, name: "Rose Bouquet", coins: 10999, image: "/IMG_20260906_000643.png" },
    { id: 107, name: "Autumn Leaves", coins: 6799, image: "/IMG_20260906_000713.png" },
    { id: 108, name: "Ice Crystal", coins: 2999, image: "/IMG_20260906_000756.png" },
    { id: 109, name: "Candy", coins: 15499, image: "/IMG_20260906_000814.png" },
    { id: 110, name: "Pop", coins: 4000, image: "/IMG_20260906_000832.png" },
    { id: 111, name: "Scarecrow", coins: 7500, image: "/IMG_20260906_000850.png" },
  ];

  // Get current gifts based on active tab
  const getCurrentGifts = () => {
    if (activeTab === "Lucky") return luckyGifts;
    return hotGifts;
  };

  const currentGifts = getCurrentGifts();

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
      {/* PURE WEB SHADER - ONLY FOR COINS ICON */}
      <style jsx>{`
        /* Main container */
        .main-container {
          background: rgba(0, 0, 0, 0.95);
        }
        
        /* Gift item - NO SHADER on images */
        .gift-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.2s ease;
        }
        
        .gift-item:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .gift-item.selected {
          background: rgba(59, 130, 246, 0.12);
          border-color: #3b82f6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
        }

        /* Gift images - NO EFFECTS, pure original */
        .gift-image {
          /* NO FILTERS - pure original image */
        }

        /* PURE WEB SHADER FOR COINS ONLY - removes white bg */
        .coin-wrapper {
          backdrop-filter: blur(0px) saturate(0%) contrast(3);
          -webkit-backdrop-filter: blur(0px) saturate(0%) contrast(3);
          background: transparent;
          filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.2));
        }

        .coin-image {
          filter: brightness(1.3) contrast(1.8) saturate(2.0) drop-shadow(0 0 2px rgba(255, 215, 0, 0.3));
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
        }

        /* Bottom bar */
        .bottom-bar {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Balance container */
        .balance-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px) saturate(150%);
          -webkit-backdrop-filter: blur(10px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Multiplier button */
        .multiplier-btn {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(8px) saturate(150%);
          -webkit-backdrop-filter: blur(8px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .multiplier-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
        }

        /* Send button */
        .send-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 2px 15px rgba(59, 130, 246, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .send-btn:hover {
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 25px rgba(59, 130, 246, 0.35);
        }

        /* Multiplier dropdown */
        .multiplier-dropdown {
          background: rgba(24, 24, 27, 0.92);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        /* Tab active */
        .tab-active {
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.05);
        }

        /* Scrollbar hide */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 50vh Black Sheet Container */}
      <div 
        ref={sheetRef}
        className="main-container h-[50vh] w-full max-w-md mx-auto text-white flex flex-col justify-between rounded-md border-t border-white/10 shadow-2xl relative px-4 pt-3 pb-2"
      >
        
        {/* 1. TOP SECTION: "All" Text Only */}
        <div className="flex items-center justify-end border-b border-white/10 pb-1">
          <span className="text-sm font-semibold text-gray-300">All</span>
        </div>

        {/* 2. CATEGORY TABS - No bottom line */}
        <div className="flex items-center gap-5 py-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold transition-all relative ${
                activeTab === tab
                  ? "text-white font-bold scale-105 tab-active"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 3. MIDDLE SECTION: Gift Items Grid - 4 Columns */}
        <div className="flex-1 overflow-y-auto py-2 grid grid-cols-4 gap-2.5 scrollbar-none">
          {currentGifts.map((gift) => (
            <div
              key={gift.id}
              onClick={() => setSelectedGift(gift.id)}
              className={`gift-item flex flex-col items-center justify-center p-2.5 transition cursor-pointer active:scale-95 rounded-md ${
                selectedGift === gift.id ? "selected" : ""
              }`}
            >
              <div className="relative w-14 h-14 mb-1">
                <Image
                  src={gift.image}
                  alt={gift.name}
                  fill
                  className="gift-image object-cover"
                  sizes="56px"
                />
              </div>
              <span className="text-[10px] text-gray-300 font-medium">{gift.name}</span>
              <span className="text-[9px] text-yellow-400 flex items-center gap-0.5 mt-0.5">
                <div className="coin-wrapper w-2.5 h-2.5 relative overflow-hidden rounded-full">
                  <Image
                    src="/1786855398290.png"
                    alt="Coins"
                    fill
                    className="coin-image object-cover"
                    sizes="10px"
                  />
                </div>
                {gift.coins}
              </span>
            </div>
          ))}
        </div>

        {/* 4. BOTTOM BAR */}
        <div className="bottom-bar flex items-center justify-between pt-1.5 relative rounded-b-md">
          {/* Left Side: Coin Balance */}
          <div className="balance-container flex items-center gap-1 px-2.5 py-1 rounded-full">
            <div className="coin-wrapper w-5 h-5 relative overflow-hidden rounded-full">
              <Image
                src="/1786855398290.png"
                alt="Coins"
                fill
                className="coin-image object-cover"
                sizes="20px"
              />
            </div>
            <span className="text-[10px] font-bold text-yellow-300 tracking-wide">66457</span>
          </div>

          {/* Right Side: Multiplier Bar & Send Button */}
          <div className="flex items-center gap-1.5 relative">
            
            {/* Multiplier Dropdown Popup */}
            {showMultipliers && (
              <div className="multiplier-dropdown absolute bottom-10 right-14 rounded-md p-1 shadow-xl flex flex-col gap-1 z-50">
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
              className="multiplier-btn flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-gray-200 transition"
            >
              <span>{selectedMultiplier}</span>
              <ChevronUp className={`w-3 h-3 transition-transform ${showMultipliers ? "rotate-180" : ""}`} />
            </button>

            {/* Blue Send Button */}
            <button
              onClick={() => console.log(`Sent Gift ID: ${selectedGift} with ${selectedMultiplier}`)}
              className="send-btn text-white font-bold text-xs px-4 py-1.5 rounded-full transition-all active:scale-95"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
        }
