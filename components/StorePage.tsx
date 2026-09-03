"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react"; // Left arrow icon use kiya hai

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

// Store ke sabhi items
const storeItems: StoreItem[] = [
  { id: "1", name: "Moon Light", image: "/1784533036732~2.jpg", stars: 5, price: "4,000,000", duration: "3D", hasDiscount: true },
  { id: "2", name: "Golden Chariot", image: "/1784533036732~2.jpg", stars: 5, price: "800,000,000", duration: "1D", hasDiscount: true },
  { id: "3", name: "Flame Tiger", image: "/1784533036732~2.jpg", stars: 5, price: "24,000,000,000", duration: "3D", hasDiscount: true },
  { id: "4", name: "Pegasus Carriage", image: "/1784533036732~2.jpg", stars: 4, price: "400,000,000", duration: "1D", hasDiscount: true },
  { id: "5", name: "Royal Carriage", image: "/1784533036732~2.jpg", stars: 5, price: "240,000,000", duration: "1D", hasDiscount: true },
  { id: "6", name: "Neon Bike", image: "/1784533036732~2.jpg", stars: 5, price: "2,400,000", duration: "3D", hasDiscount: true },
];

// Bag me sirf kharide hue items (Demo ke liye 3 items show kar rahe)
const bagItems: StoreItem[] = [
  { id: "1", name: "Moon Light", image: "/1784533036732~2.jpg", stars: 5, price: "4,000,000", duration: "3D" },
  { id: "3", name: "Flame Tiger", image: "/1784533036732~2.jpg", stars: 5, price: "24,000,000,000", duration: "3D" },
];

export default function StorePage({ onBack }: StorePageProps) {
  // Page view state: 'store' ya 'bag'
  const [currentView, setCurrentView] = useState<"store" | "bag">("store");
  const [activeTab, setActiveTab] = useState("Vehicle");
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`text-[15px] ${i < count ? 'text-yellow-400' : 'text-gray-200'}`}>
        ★
      </span>
    ));
  };

  // Decide which items to show based on the current view
  const currentItems = currentView === "store" ? storeItems : bagItems;

  return (
    <div className="min-h-screen bg-[#f3f8fe] text-gray-800 pb-10 select-none font-sans relative">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        
        {/* Top Header - Store aur Bag ke hisaab se dynamically change hoga */}
        <div
          className="relative flex items-center justify-between px-4 pb-3 pt-4 bg-transparent"
          style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 16px)' }}
        >
          {/* Back Icon (Left Arrow) */}
          <button
            type="button"
            onClick={() => {
              if (currentView === "bag") {
                setCurrentView("store"); // Bag se wapasi Store
              } else {
                onBack(); // Store se main app me wapasi
              }
            }}
            className="p-1 -ml-2 text-black hover:bg-black/5 rounded-full transition-colors z-10"
          >
            <ArrowLeft size={28} strokeWidth={2} />
          </button>
          
          {/* Heading */}
          <h1 className="text-[18px] font-bold text-black absolute left-1/2 -translate-x-1/2">
            {currentView === "store" ? "Store" : "Bag"}
          </h1>

          {/* Top Right Icon */}
          {currentView === "store" ? (
            <button 
              type="button"
              onClick={() => setCurrentView("bag")}
              className="relative w-[50px] h-[50px] z-10 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/file_0000000050008211a231ccb3937eab0a.png"
                alt="Bag Icon"
                fill
                className="object-contain"
              />
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => setCurrentView("store")}
              className="relative w-[50px] h-[50px] z-10 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/file_00000000d634821189c7f69b4e3786e8.png"
                alt="Store Icon"
                fill
                className="object-contain"
              />
            </button>
          )}
        </div>

        {/* Category Tabs - Exact Circle shape peeche */}
        <div className="flex items-center gap-6 px-4 mt-2 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <div key={tab} className="relative flex items-center justify-center h-[54px] w-[54px]">
                
                {/* STRICT CIRCLE Background behind text */}
                {isActive && (
                  <div className="absolute w-[50px] h-[50px] bg-[#1d4ed8] rounded-full shadow-sm"></div>
                )}
                
                <button
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 whitespace-nowrap text-[14px] transition-colors ${
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

        {/* Items Grid - Card height kam (h-[220px]) & Tight Corners (rounded-xl) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-2 mt-4 flex-1 content-start">
          {currentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)} 
              className="bg-white rounded-xl p-3 flex flex-col items-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-pointer active:scale-95 transition-transform h-[220px]"
            >
              {/* Top Bar (Check & Try) */}
              <div className="flex items-center justify-between w-full mb-1">
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
              <div className="relative w-full h-[95px] mt-1 mb-2 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 150px"
                />
              </div>

              {/* Details: Stars, Name, Coins */}
              <div className="flex flex-col items-center justify-end flex-1 w-full gap-1">
                <div className="flex items-center space-x-[1px]">
                  {renderStars(item.stars)}
                </div>
                <span className="text-[14px] font-bold text-gray-800 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                  {item.name}
                </span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
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
          {/* Agar bag khali ho */}
          {currentItems.length === 0 && (
            <div className="col-span-2 text-center text-gray-400 mt-10 font-medium">
              Bag is empty
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SHEET - Wear/Unwear (Bag view) OR Send/Buy (Store view) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Background Overlay */}
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={() => setSelectedItem(null)} 
          ></div>
          
          {/* Sheet Body */}
          <div className="relative w-full max-w-md mx-auto h-[50vh] bg-white rounded-t-2xl flex flex-col shadow-2xl">
            
            {/* Main Content inside Sheet */}
            <div className="flex-1 w-full flex flex-col items-center justify-center p-6 mt-2">
              <div className="relative w-40 h-40 mb-5">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
              
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center space-x-[2px]">
                  {renderStars(selectedItem.stars)}
                </div>
                <h2 className="text-[24px] font-bold text-gray-900 tracking-wide">
                  {selectedItem.name}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <Image
                      src="/1786855398290.png"
                      alt="Coin Icon"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[18px] font-bold text-black">
                    {selectedItem.price}
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

              {/* ACTION BUTTONS */}
              <div className="flex items-center w-[150px] rounded-full border border-[#1d4ed8] overflow-hidden h-[34px]">
                {currentView === "bag" ? (
                  <>
                    <button
                      type="button"
                      className="flex-1 h-full bg-white text-[#1d4ed8] text-[13px] font-bold flex items-center justify-center hover:bg-[#eff6ff]"
                    >
                      Wear
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-full bg-[#1d4ed8] text-white text-[13px] font-bold flex items-center justify-center hover:bg-[#1e40af]"
                    >
                      Unwear
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

