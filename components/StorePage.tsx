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
  // Bottom sheet ke liye state
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  return (
    <div className="min-h-screen bg-[#f3f8fe] text-gray-800 pb-10 select-none font-sans relative">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        
        {/* Top Header - Sky blue gradient mix kiya hai top pe */}
        <div
          className="relative flex items-center justify-between px-4 pb-3 pt-4 bg-gradient-to-r from-sky-200 to-blue-200 rounded-b-2xl shadow-sm"
          style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 16px)' }}
        >
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-2 text-black hover:bg-white/50 rounded-full transition-colors z-10"
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

        {/* Category Tabs (Fixed Perfect Circle) */}
        <div className="flex items-center gap-6 px-5 mt-3 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <div key={tab} className="relative flex items-center justify-center h-[70px]">
                {/* Perfect Circle Behind Active Text */}
                {isActive && (
                  <div className="absolute w-[58px] h-[58px] bg-[#1d4ed8] rounded-full shadow-sm"></div>
                )}
                
                <button
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 whitespace-nowrap text-[15px] transition-colors ${
                    isActive
                      ? "text-white font-medium"
                      : "text-gray-400 font-normal"
                  }`}
                >
                  {tab}
                </button>
              </div>
            );
          })}
        </div>

        {/* Items Grid (Edge-to-edge feel ke liye padding tight rakhi hai) */}
        <div className="grid grid-cols-2 gap-2 px-2 py-2 mt-2 flex-1 content-start">
          {storeItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)} // Click karne par sheet open hoga
              className="bg-white rounded-[14px] p-2 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.03)] cursor-pointer active:scale-95 transition-transform"
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

              {/* Item Image (Thoda height badha diya kyunki buttons hata diye) */}
              <div className="relative w-full h-[90px] mt-2 mb-2 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 150px"
                />
              </div>

              {/* Coin and Price (Buttons hata diye, sirf yehi bacha hai bottom pe) */}
              <div className="flex items-center justify-center gap-1 mt-auto pb-1">
                <div className="relative w-[13px] h-[13px] flex items-center justify-center">
                  <Image
                    src="/1786855398290.png"
                    alt="Coin Icon"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[11px] font-medium text-black tracking-tight">
                  {item.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SHEET - 50vh, No Blur, Tight Curve */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Overlay - Original background dikhega (no backdrop-blur), click to close */}
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={() => setSelectedItem(null)} 
          ></div>
          
          {/* Bottom Sheet Content (50vh Height & Tight rounded corners) */}
          <div className="relative w-full max-w-md mx-auto h-[50vh] bg-white rounded-t-lg flex flex-col shadow-2xl">
            
            {/* Image (Card wali exact image yahan show hogi) */}
            <div className="flex-1 relative w-full flex items-center justify-center p-6">
              <Image
                src={selectedItem.image}
                alt={selectedItem.name}
                fill
                className="object-contain p-6"
              />
            </div>

            {/* Bottom Bar inside Sheet */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              
              {/* Left Side: Coins & Value */}
              <div className="flex items-center gap-1.5">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <Image
                    src="/1786855398290.png"
                    alt="Coin Icon"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[15px] font-bold text-black tracking-tight">
                  79282
                </span>
              </div>

              {/* Right Side: Send & Buy Buttons (Same pill shape & colors) */}
              <div className="flex items-center w-[130px] rounded-full border border-[#1d4ed8] overflow-hidden h-[32px]">
                <button
                  type="button"
                  className="flex-1 h-full bg-white text-[#1d4ed8] text-[12px] font-medium flex items-center justify-center hover:bg-[#eff6ff]"
                >
                  Send
                </button>
                <button
                  type="button"
                  className="flex-1 h-full bg-[#1d4ed8] text-white text-[12px] font-medium flex items-center justify-center hover:bg-[#1e40af]"
                >
                  Buy
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

