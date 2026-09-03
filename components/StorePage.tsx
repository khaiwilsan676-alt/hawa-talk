"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  image: string;
  tab: string;
  stars: number;
  price: string;
  duration: string;
  isOwned?: boolean;
}

const tabs = ["Vehicle", "Avatar Frame", "Theme", "Chat Bubble", "ID"];

// Saare items ko unke tabs ke hisaab से divide kiya hai
const allStoreItems: StoreItem[] = [
  // Vehicle
  { id: "v1", name: "Gold Fish", image: "/1784533036732~2.jpg", tab: "Vehicle", stars: 5, price: "2,500,000", duration: "3D" },
  { id: "v2", name: "Scooter Fox", image: "/1784533036732~2.jpg", tab: "Vehicle", stars: 5, price: "4,500,000", duration: "3D" },
  { id: "v3", name: "Luxury Yacht", image: "/1784533036732~2.jpg", tab: "Vehicle", stars: 5, price: "7,000,000", duration: "3D" },
  { id: "v4", name: "Magic Swan", image: "/1784533036732~2.jpg", tab: "Vehicle", stars: 4, price: "5,000,000", duration: "3D" },
  { id: "v5", name: "Submarine", image: "/1784533036732~2.jpg", tab: "Vehicle", stars: 4, price: "2,500,000", duration: "3D" },
  { id: "v6", name: "Sports Car", image: "/1784533036732~2.jpg", tab: "Vehicle", stars: 5, price: "5,000,000", duration: "3D" },
  { id: "v7", name: "Golden Cycle", image: "/1784533036732~2.jpg", tab: "Vehicle", stars: 3, price: "1,000,000", duration: "3D" },

  // Avatar Frame
  { id: "a1", name: "Crystal Crown", image: "/1784533036732~2.jpg", tab: "Avatar Frame", stars: 5, price: "8,000,000", duration: "3D" },
  { id: "a2", name: "Jellyfish Ring", image: "/1784533036732~2.jpg", tab: "Avatar Frame", stars: 4, price: "500,000", duration: "3D" },
  { id: "a3", name: "Neon Beats", image: "/1784533036732~2.jpg", tab: "Avatar Frame", stars: 5, price: "150,000", duration: "3D" },

  // Theme
  { id: "t1", name: "Summer Beach", image: "/1784533036732~2.jpg", tab: "Theme", stars: 5, price: "2,700,000", duration: "30D" },
  { id: "t2", name: "Night Sky", image: "/1784533036732~2.jpg", tab: "Theme", stars: 5, price: "2,400,000", duration: "30D" },

  // Chat Bubble
  { id: "c1", name: "Blue Bubble", image: "/1784533036732~2.jpg", tab: "Chat Bubble", stars: 4, price: "500,000", duration: "3D" },

  // ID
  { id: "i1", name: "ID Badge 8", image: "/1784533036732~2.jpg", tab: "ID", stars: 5, price: "10,000,000", duration: "3D", isOwned: true },
];

export default function StorePage({ onBack }: { onBack: () => void }) {
  const [currentView, setCurrentView] = useState<"store" | "bag">("store");
  const [activeTab, setActiveTab] = useState("Vehicle");
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  const displayedItems = allStoreItems.filter(item => {
    if (currentView === "bag") {
      return item.isOwned && item.tab === activeTab;
    }
    return item.tab === activeTab;
  });

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
            onClick={() => {
              if (currentView === "bag") {
                setCurrentView("store");
              } else {
                onBack();
              }
            }}
            className="p-1 -ml-2 text-black hover:bg-black/5 rounded-full transition-colors z-10"
          >
            <ArrowLeft size={26} strokeWidth={2} />
          </button>
          
          <h1 className="text-[18px] font-bold text-black absolute left-1/2 -translate-x-1/2">
            {currentView === "store" ? "Store" : "Bag"}
          </h1>

          {/* Top Right Images (Wapas original images laga di hain) */}
          {currentView === "store" ? (
            <button 
              type="button"
              onClick={() => setCurrentView("bag")}
              className="relative w-[36px] h-[36px] z-10 flex items-center justify-center hover:opacity-80 transition-opacity"
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
              className="relative w-[36px] h-[36px] z-10 flex items-center justify-center hover:opacity-80 transition-opacity"
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

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-4 mt-2 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 rounded-full whitespace-nowrap text-[14px] transition-all ${
                  isActive
                    ? "bg-[#cffafe] text-black font-bold shadow-sm"
                    : "text-gray-400 font-normal hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Items Grid (3 Columns) */}
        <div className="grid grid-cols-3 gap-2 px-3 py-3 mt-2 flex-1 content-start">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-xl p-2 flex flex-col items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
            >
              <div className="flex items-center justify-between w-full text-[10px]">
                <div className="flex items-center gap-0.5 text-[#1d4ed8]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8] flex items-center justify-center">
                    <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-bold">{item.duration}</span>
                </div>
                <span className="font-bold text-[#1d4ed8]">Try</span>
              </div>

              <div className="relative w-full h-[52px] my-1.5 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="33vw"
                />
              </div>

              <div className="flex items-center justify-center gap-1 mb-1.5 w-full">
                <div className="relative w-3 h-3 flex items-center justify-center shrink-0">
                  <Image
                    src="/1786855398290.png"
                    alt="Coin"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-900 tracking-tight truncate">
                  {item.price}
                </span>
              </div>

              <div className="flex items-center w-full rounded-full border border-[#1d4ed8] overflow-hidden h-[22px]">
                {currentView === "bag" ? (
                  <>
                    <button
                      type="button"
                      className="flex-1 h-full bg-white text-[#1d4ed8] text-[9px] font-bold flex items-center justify-center"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-full bg-[#1d4ed8] text-white text-[9px] font-bold flex items-center justify-center"
                    >
                      Equip
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex-1 h-full bg-white text-[#1d4ed8] text-[9px] font-bold flex items-center justify-center"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-full bg-[#1d4ed8] text-white text-[9px] font-bold flex items-center justify-center"
                    >
                      Buy
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {displayedItems.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 mt-12 text-sm font-medium">
              {currentView === "bag" ? "No items in Bag for this category" : "No items found"}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SHEET 50vh */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={() => setSelectedItem(null)} 
          ></div>
          
          <div className="relative w-full max-w-md mx-auto h-[50vh] bg-white rounded-t-2xl flex flex-col shadow-2xl">
            <div className="flex-1 w-full flex flex-col items-center justify-center p-6">
              <div className="relative w-36 h-36 mb-4">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <h2 className="text-[20px] font-bold text-gray-900">
                  {selectedItem.name}
                </h2>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <Image
                      src="/1786855398290.png"
                      alt="Coin"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[16px] font-bold text-black">
                    {selectedItem.price}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-t-xl flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <Image
                    src="/1786855398290.png"
                    alt="Coin"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[16px] font-bold text-black">
                  79282
                </span>
              </div>

              <div className="flex items-center w-[150px] rounded-full border border-[#1d4ed8] overflow-hidden h-[34px]">
                {currentView === "bag" ? (
                  <>
                    <button
                      type="button"
                      className="flex-1 h-full bg-white text-[#1d4ed8] text-[13px] font-bold flex items-center justify-center"
                    >
                      Wear
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-full bg-[#1d4ed8] text-white text-[13px] font-bold flex items-center justify-center"
                    >
                      Unwear
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex-1 h-full bg-white text-[#1d4ed8] text-[13px] font-bold flex items-center justify-center"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-full bg-[#1d4ed8] text-white text-[13px] font-bold flex items-center justify-center"
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
