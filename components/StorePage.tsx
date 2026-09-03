"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ShoppingBag } from "lucide-react";

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

const tabs = ["Vehicle", "Avatar Frame", "Theme", "Chat Bubble", "ID"];

const storeItems: StoreItem[] = [
  {
    id: "1",
    name: "Love Car",
    image: "/1784533036732~2.jpg",
    stars: 4,
    price: "4,000,000",
    duration: "3D",
    hasDiscount: true,
  },
  {
    id: "2",
    name: "Golden Chariot",
    image: "/1784533036732~2.jpg",
    stars: 5,
    price: "800,000,000",
    duration: "1D",
    hasDiscount: true,
  },
  {
    id: "3",
    name: "Flame Tiger",
    image: "/1784533036732~2.jpg",
    stars: 5,
    price: "24,000,000,000",
    duration: "3D",
    hasDiscount: true,
  },
  {
    id: "4",
    name: "Pegasus Carriage",
    image: "/1784533036732~2.jpg",
    stars: 4,
    price: "400,000,000",
    duration: "1D",
    hasDiscount: true,
  },
  {
    id: "5",
    name: "Royal Carriage",
    image: "/1784533036732~2.jpg",
    stars: 3,
    price: "240,000,000",
    duration: "1D",
    hasDiscount: true,
  },
  {
    id: "6",
    name: "Neon Bike",
    image: "/1784533036732~2.jpg",
    stars: 2,
    price: "2,400,000",
    duration: "3D",
    hasDiscount: true,
  },
];

export default function StorePage({ onBack }: StorePageProps) {
  const [activeTab, setActiveTab] = useState("Vehicle");

  return (
    <div className="min-h-screen bg-[#f3f8fe] text-gray-800 pb-10 select-none font-sans flex flex-col">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col bg-[#f3f8fe] shadow-sm overflow-hidden h-screen">
        
        {/* Top Header */}
        <div
          className="relative flex items-center justify-between px-4 pb-2 pt-4 shrink-0"
          style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 16px)' }}
        >
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-2 text-black hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <ChevronLeft size={28} strokeWidth={1.5} />
          </button>
          
          <h1 className="text-[17px] font-medium text-black absolute left-1/2 -translate-x-1/2">
            Store
          </h1>

          <button className="flex items-center gap-1.5 bg-[#1d4ed8] text-white px-3.5 py-1.5 rounded-full text-[13px] font-medium z-10 shadow-sm">
            <ShoppingBag size={14} strokeWidth={2.5} />
            Bag
          </button>
        </div>

        {/* Main Content Area (Sidebar on Left, Grid on Right) */}
        <div className="flex flex-1 overflow-hidden mt-2">
          
          {/* Vertical Tabs Sidebar (Left Side) */}
          <div className="w-[85px] shrink-0 overflow-y-auto no-scrollbar flex flex-col items-center gap-4 py-2 border-r border-gray-200/50">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <div key={tab} className="relative flex items-center justify-center w-full min-h-[64px]">
                  {/* Dark Blue Circle behind active tab */}
                  {isActive && (
                    <div className="absolute w-[56px] h-[56px] bg-[#1d4ed8] rounded-full shadow-sm"></div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative z-10 text-[11px] leading-tight px-1 transition-colors w-full text-center ${
                      isActive
                        ? "text-white font-medium"
                        : "text-gray-400 font-medium"
                    }`}
                  >
                    {tab}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Items Grid Area (Right Side - 2 Columns) */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2">
            <div className="grid grid-cols-2 gap-3 content-start">
              {storeItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[14px] p-2 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                >
                  {/* Top Bar (Solid Dark Blue Check & Try) */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1 text-[#1d4ed8]">
                      <div className="w-3 h-3 rounded-full bg-[#1d4ed8] flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-medium">{item.duration}</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#1d4ed8] opacity-90">
                      Try
                    </span>
                  </div>

                  {/* Item Image (Compact Height) */}
                  <div className="relative w-full h-[60px] mt-2 mb-2 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 150px"
                    />
                  </div>

                  {/* Coin and Price */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <div className="relative w-[13px] h-[13px] flex items-center justify-center">
                      <Image
                        src="/1786855398290.png"
                        alt="Coin Icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[12px] font-medium text-black tracking-tight">
                      {item.price}
                    </span>
                  </div>

                  {/* Action Buttons (Send / Buy - Perfect Pill Shape in Dark Blue) */}
                  <div className="flex items-center w-full rounded-full border border-[#1d4ed8] overflow-hidden h-[26px]">
                    <button
                      type="button"
                      className="flex-1 h-full bg-white text-[#1d4ed8] text-[11px] font-medium flex items-center justify-center hover:bg-[#eff6ff]"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-full bg-[#1d4ed8] text-white text-[11px] font-medium flex items-center justify-center hover:bg-[#1e40af]"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

