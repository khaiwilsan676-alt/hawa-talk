"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ShoppingBag, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-[#f0f8ff] to-[#f8fbff] text-gray-800 pb-10 select-none">
      <div className="max-w-md mx-auto bg-transparent min-h-screen flex flex-col">
        
        {/* Top Header */}
        <div
          className="relative flex items-center justify-between px-4 pb-2 pt-4"
          style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 16px)' }}
        >
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-gray-800 hover:bg-gray-100/50 rounded-full transition-colors z-10"
          >
            <ChevronLeft size={26} strokeWidth={2} />
          </button>
          
          <h1 className="text-lg font-medium text-gray-900 absolute left-1/2 -translate-x-1/2">
            Store
          </h1>

          <button className="flex items-center gap-1.5 bg-[#4dd0e1] text-white px-3.5 py-1.5 rounded-full text-[11px] font-semibold shadow-sm z-10">
            <ShoppingBag size={12} strokeWidth={2.5} />
            Bag
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-7 px-6 py-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative whitespace-nowrap text-[13px] transition-all ${
                  isActive
                    ? "text-gray-900 font-medium"
                    : "text-gray-400 font-normal"
                }`}
              >
                {isActive && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#4dd0e1] rounded-full -z-10 shadow-sm opacity-90"></span>
                )}
                {tab}
              </button>
            );
          })}
        </div>

        {/* Items Grid (3 Columns just like the image) */}
        <div className="grid grid-cols-3 gap-2.5 px-3 py-2 flex-1">
          {storeItems.map((item) => (
            <div
              key={item.id}
              className="bg-white/80 backdrop-blur-sm rounded-[1.25rem] p-2 flex flex-col justify-between shadow-[0_4px_10px_rgba(77,208,225,0.06)] border border-[#e0f7fa]/50"
            >
              {/* Top Bar (3D & Try) */}
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-0.5 text-[#4dd0e1] text-[9px] font-semibold">
                  <CheckCircle2 size={10} strokeWidth={3} className="text-[#4dd0e1]" />
                  <span>{item.duration}</span>
                </div>
                <span className="text-[10px] text-[#4dd0e1] font-medium opacity-80">
                  Try
                </span>
              </div>

              {/* Item Image */}
              <div className="relative w-full h-14 my-1.5 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 33vw, 120px"
                />
              </div>

              {/* Coin and Price */}
              <div className="flex items-center justify-center gap-1 mt-auto mb-1.5">
                <div className="relative w-[13px] h-[13px] flex items-center justify-center">
                  <Image
                    src="/1786855398290.png"
                    alt="Coin Icon"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[10px] font-medium text-gray-800">
                  {item.price}
                </span>
              </div>

              {/* Action Buttons (Send / Buy) */}
              <div className="flex items-center w-full rounded-full border border-[#4dd0e1] overflow-hidden text-[10px] font-medium">
                <button
                  type="button"
                  className="flex-1 py-1 bg-white text-[#4dd0e1] hover:bg-[#f0fbfb] transition-colors"
                >
                  Send
                </button>
                <button
                  type="button"
                  className="flex-1 py-1 bg-[#4dd0e1] text-white hover:bg-[#3bc0d1] transition-colors"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

