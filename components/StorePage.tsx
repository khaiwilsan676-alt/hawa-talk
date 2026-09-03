"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

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
    name: "Moon Light",
    image: "/1784533036732~2.jpg",
    stars: 5,
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
    stars: 5,
    price: "240,000,000",
    duration: "1D",
    hasDiscount: true,
  },
  {
    id: "6",
    name: "Neon Bike",
    image: "/1784533036732~2.jpg",
    stars: 5,
    price: "2,400,000",
    duration: "3D",
    hasDiscount: true,
  },
];

export default function StorePage({ onBack }: StorePageProps) {
  const [activeTab, setActiveTab] = useState("Vehicle");
  // Store item click ke liye state
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  // Bag icon click ke liye alag state
  const [isBagOpen, setIsBagOpen] = useState(false);

  // Helper to render stars
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`text-[15px] ${i < count ? 'text-yellow-400' : 'text-gray-200'}`}>
        ★
      </span>
    ));
  };

  // Close dono sheet (bag wali aur normal item wali)
  const closeSheet = () => {
    setSelectedItem(null);
    setIsBagOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f8fe] text-gray-800 pb-10 select-none font-sans relative">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        
        {/* Top Header */}
        <div
          className="relative flex items-center justify-between px-4 pb-3 pt-4 bg-transparent"
          style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 16px)' }}
        >
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-2 text-black hover:bg-black/5 rounded-full transition-colors z-10"
          >
            <ChevronLeft size={28} strokeWidth={1.5} />
          </button>
          
          <h1 className="text-[17px] font-medium text-black absolute left-1/2 -translate-x-1/2">
            Store
          </h1>

          {/* NEW BAG ICON IMAGE (Top Right) */}
          <button 
            type="button"
            onClick={() => setIsBagOpen(true)}
            className="relative w-[32px] h-[32px] z-10 flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/file_0000000050008211a231ccb3937eab0a.png"
              alt="Bag Icon"
              fill
              className="object-contain"
            />
          </button>
        </div>

        {/* Category Tabs - Circle/Pill shape */}
        <div className="flex items-center gap-3 px-4 mt-2 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <div key={tab} className="relative flex items-center justify-center h-[54px]">
                {/* Background shape that covers the full text */}
                {isActive && (
                  <div className="absolute inset-0 my-1 bg-[#1d4ed8] rounded-full shadow-sm"></div>
                )}
                
                <button
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 whitespace-nowrap text-[15px] px-5 py-2 transition-colors ${
                    isActive
                      ? "text-white font-bold" 
                      : "text-gray-400 font-normal"
                  }`}
                >
                  {tab}
                </button>
              </div>
            );
          })}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 px-4 py-2 mt-3 flex-1 content-start">
          {storeItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)} 
              className="bg-white rounded-[18px] p-3 flex flex-col items-center shadow-[0_2px_12px_rgba(0,0,0,0.05)] cursor-pointer active:scale-95 transition-transform h-[260px]"
            >
              {/* Top Bar (Check & Try) */}
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-1 text-[#1d4ed8]">
                  <div className="w-4 h-4 rounded-full bg-[#1d4ed8] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[12px] font-bold">{item.duration}</span>
                </div>
                <span className="text-[13px] font-bold text-[#1d4ed8]">
                  Try
                </span>
              </div>

              {/* Item Image */}
              <div className="relative w-full h-[110px] mt-2 mb-4 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 150px"
                />
              </div>

              {/* Details: Stars, Name, Coins */}
              <div className="flex flex-col items-center justify-end flex-1 w-full gap-1.5">
                <div className="flex items-center space-x-[1px]">
                  {renderStars(item.stars)}
                </div>
                <span className="text-[15px] font-bold text-gray-800 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                  {item.name}
                </span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <Image
                      src="/1786855398290.png"
                      alt="Coin Icon"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[13px] font-bold text-black tracking-tight">
                    {item.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SHEET (Shared for both Store Item & Bag Item) */}
      {(selectedItem || isBagOpen) && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Background Overlay */}
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={closeSheet} 
          ></div>
          
          {/* Sheet Body */}
          <div className="relative w-full max-w-md mx-auto h-[50vh] bg-white rounded-t-2xl flex flex-col shadow-2xl">
            
            {/* Main Content inside Sheet */}
            <div className="flex-1 w-full flex flex-col items-center justify-center p-6 mt-2">
              <div className="relative w-40 h-40 mb-6">
                <Image
                  // Agar bag open hai to apko di hui 2nd image lag jayegi, warna store item ki image
                  src={isBagOpen ? "/file_00000000d634821189c7f69b4e3786e8.png" : selectedItem?.image || ""}
                  alt={isBagOpen ? "Bag Item" : selectedItem?.name || ""}
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
              
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center space-x-[2px]">
                  {renderStars(isBagOpen ? 5 : selectedItem?.stars || 5)}
                </div>
                <h2 className="text-[24px] font-bold text-gray-900 tracking-wide">
                  {isBagOpen ? "My Item" : selectedItem?.name}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <Image
                      src="/1786855398290.png"
                      alt="Coin Icon"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[18px] font-bold text-black">
                    {/* Bag me item already owned hota hai toh Owned likh diya (ya purana logic bhi chalega) */}
                    {isBagOpen ? "Owned" : selectedItem?.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar inside Sheet */}
            <div className="bg-white rounded-t-xl flex items-center justify-between px-6 py-4 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] border-t border-gray-100">
              
              {/* Fixed 79282 Coins */}
              <div className="flex items-center gap-1.5">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <Image
                    src="/1786855398290.png"
                    alt="Coin Icon"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[16px] font-bold text-black tracking-tight">
                  79282
                </span>
              </div>

              {/* ACTION BUTTONS (Send/Buy OR Equip/Unequip based on what's open) */}
              <div className="flex items-center w-[150px] rounded-full border border-[#1d4ed8] overflow-hidden h-[34px]">
                {isBagOpen ? (
                  <>
                    <button
                      type="button"
                      className="flex-1 h-full bg-white text-[#1d4ed8] text-[13px] font-bold flex items-center justify-center hover:bg-[#eff6ff]"
                    >
                      Equip
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-full bg-[#1d4ed8] text-white text-[13px] font-bold flex items-center justify-center hover:bg-[#1e40af]"
                    >
                      Unequip
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex-1 h-full bg-white text-[#1d4ed8] text-[13px] font-bold flex items-center justify-center hover:bg-[#eff6ff]"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-full bg-[#1d4ed8] text-white text-[13px] font-bold flex items-center justify-center hover:bg-[#1e40af]"
                    >
                      Buy
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
