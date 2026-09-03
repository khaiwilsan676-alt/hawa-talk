"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingBag, Play } from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  image: string;
  stars: number;
  price: string;
  duration: string;
  hasDiscount?: boolean;
}

interface StorePageProps {
  onBack: () => void;
}

// Logic and data untouched
const tabs = ["Vehicle", "Avatar Frame", "Theme", "Chat Bubble", "ID"];

const storeItems: StoreItem[] = [
  {
    id: "1",
    name: "Love Car",
    image: "/1784533036732~2.jpg",
    stars: 4,
    price: "4,000,000",
    duration: "7 day",
    hasDiscount: true,
  },
  {
    id: "2",
    name: "Golden Chariot",
    image: "/1784533036732~2.jpg",
    stars: 5,
    price: "800,000,000",
    duration: "7 day",
    hasDiscount: true,
  },
  {
    id: "3",
    name: "Flame Tiger",
    image: "/1784533036732~2.jpg",
    stars: 5,
    price: "24,000,000,000",
    duration: "7 day",
    hasDiscount: true,
  },
  {
    id: "4",
    name: "Pegasus Carriage",
    image: "/1784533036732~2.jpg",
    stars: 4,
    price: "400,000,000",
    duration: "7 day",
    hasDiscount: true,
  },
  {
    id: "5",
    name: "Royal Carriage",
    image: "/1784533036732~2.jpg",
    stars: 3,
    price: "240,000,000",
    duration: "7 day",
    hasDiscount: true,
  },
  {
    id: "6",
    name: "Neon Bike",
    image: "/1784533036732~2.jpg",
    stars: 2,
    price: "2,400,000",
    duration: "7 day",
    hasDiscount: true,
  },
];

export default function StorePage({ onBack }: StorePageProps) {
  const [activeTab, setActiveTab] = useState("Vehicle");

  return (
    // Dark Blue Royal Background
    <div className="min-h-screen bg-gradient-to-b from-[#0a1128] via-[#101b3b] to-[#070b19] text-white select-none font-sans flex flex-col">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col relative overflow-hidden h-screen">
        
        {/* Top Header */}
        <div
          className="relative flex items-center justify-between px-4 pb-3 pt-5 shrink-0 z-20"
          style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 16px)' }}
        >
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <ChevronLeft size={28} strokeWidth={2} />
          </button>
          
          <h1 className="text-[19px] font-semibold text-white absolute left-1/2 -translate-x-1/2 tracking-wide">
            Shop
          </h1>

          {/* Golden 'Mine' Button */}
          <button className="flex items-center gap-1.5 bg-gradient-to-r from-[#fcd34d] to-[#d97706] text-[#0a1128] px-4 py-1.5 rounded-full text-[13px] font-bold z-10 shadow-[0_2px_10px_rgba(217,119,6,0.3)]">
            <ShoppingBag size={14} strokeWidth={2.5} />
            Mine
          </button>
        </div>

        {/* Main Content Area (Sidebar on Left, Grid on Right) */}
        <div className="flex flex-1 overflow-hidden mt-1 z-10">
          
          {/* Vertical Tabs Sidebar (Left Side) */}
          <div className="w-[90px] shrink-0 overflow-y-auto no-scrollbar flex flex-col items-center gap-5 py-4 border-r border-blue-900/40">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <div key={tab} className="relative flex flex-col items-center justify-center w-full group cursor-pointer" onClick={() => setActiveTab(tab)}>
                  
                  {/* Golden Circle Frame for Tab */}
                  <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-b from-[#fcd34d] to-[#b45309] shadow-[0_0_15px_rgba(252,211,77,0.5)] p-[2px]" 
                      : "bg-blue-900/50 p-[2px] border border-blue-700/50"
                  }`}>
                    <div className="w-full h-full bg-[#0a1128] rounded-full flex items-center justify-center overflow-hidden">
                      {/* Using generic icon/image inside the golden ring to mimic the image exactly */}
                      <Image
                        src="/1784533036732~2.jpg"
                        alt={tab}
                        width={30}
                        height={30}
                        className={`object-contain ${isActive ? 'opacity-100' : 'opacity-60'}`}
                      />
                    </div>
                  </div>
                  
                  <span
                    className={`mt-2 text-[10px] leading-tight px-1 transition-colors w-full text-center ${
                      isActive
                        ? "text-[#fcd34d] font-bold"
                        : "text-blue-200/70 font-medium"
                    }`}
                  >
                    {tab}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Items Grid Area (Right Side - 2 Columns) */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3">
            <div className="grid grid-cols-2 gap-3 content-start pb-24">
              {storeItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#13234d]/60 backdrop-blur-md rounded-xl p-2 pb-2.5 flex flex-col shadow-[0_4px_15px_rgba(0,0,0,0.2)] border border-blue-800/50 relative overflow-hidden"
                >
                  {/* Top Bar ("7 day" & Play Icon like the image) */}
                  <div className="flex items-center justify-between w-full px-1">
                    <span className="text-[10px] text-blue-200 font-medium">{item.duration}</span>
                    <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                      <Play size={8} fill="white" className="text-white ml-[1px]" />
                    </div>
                  </div>

                  {/* Item Image */}
                  <div className="relative w-full h-[65px] mt-2 mb-3 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 150px"
                    />
                  </div>

                  {/* Coin and Price Tag (Golden/Dark Bottom style) */}
                  <div className="w-full bg-[#0a1128]/80 rounded-md py-1.5 flex items-center justify-center gap-1.5 border border-blue-900/50 mt-auto">
                    <div className="relative w-[14px] h-[14px] flex items-center justify-center">
                      <Image
                        src="/1786855398290.png"
                        alt="Coin Icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[12px] font-bold text-[#fcd34d] tracking-tight">
                      {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar (Exact Send / Purchase Buttons) */}
        <div className="absolute bottom-0 w-full bg-[#070b19] border-t border-blue-900/50 px-4 py-3 pb-6 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-30">
          
          {/* User Balance Area (Left) */}
          <div className="flex items-center gap-1.5 cursor-pointer">
            <div className="relative w-[20px] h-[20px] flex items-center justify-center">
              <Image
                src="/1786855398290.png"
                alt="Coin Icon"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[15px] font-bold text-white tracking-wide">17885</span>
            <ChevronRight size={18} strokeWidth={2.5} className="text-blue-400 mt-0.5" />
          </div>

          {/* Action Buttons (Right - Exact Golden Theme) */}
          <div className="flex items-center gap-3">
            {/* Send Button - Hollow Golden Outline */}
            <button className="px-6 py-2 rounded-full border border-[#fcd34d] text-[#fcd34d] text-[14px] font-bold hover:bg-[#fcd34d]/10 transition-colors">
              Send
            </button>
            {/* Purchase Button - Solid Golden Fill */}
            <button className="px-5 py-2 rounded-full bg-gradient-to-r from-[#fcd34d] to-[#d97706] text-[#0a1128] text-[14px] font-bold shadow-[0_2px_10px_rgba(217,119,6,0.3)] hover:brightness-110 transition-all">
              purchase
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

