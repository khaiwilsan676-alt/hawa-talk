"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, Clock, Star } from "lucide-react";

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
    <div className="min-h-screen bg-[#f4f7f9] text-gray-800 pb-10 select-none">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm flex flex-col">
        {/* Top Header */}
        <div
          className="relative flex items-center justify-center px-4 pb-3.5 bg-white border-b border-gray-100"
          style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 12px)' }}
        >
          <button
            type="button"
            onClick={onBack}
            className="absolute left-3 p-1 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Store</h1>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar border-b border-gray-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-3 p-3.5 flex-1 bg-[#f7f9fa]">
          {storeItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-2.5 flex flex-col justify-between border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] relative"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#2563eb] border border-[#2563eb] rounded-full px-2 py-0.5 leading-none">
                    Try
                  </span>
                  <div className="flex items-center gap-0.5 text-gray-400 text-[11px] font-medium">
                    <Clock size={12} className="stroke-[2.2]" />
                    <span>{item.duration}</span>
                  </div>
                </div>

                {item.hasDiscount && (
                  <div className="mt-1 flex items-center">
                    <div className="relative inline-block bg-gradient-to-r from-[#e3a033] to-[#c78018] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      Discounts
                    </div>
                  </div>
                )}
              </div>

              <div className="relative w-full h-24 my-1 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 200px"
                />
              </div>

              <div className="text-center mt-1">
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className="fill-[#ffb703] text-[#ffb703]"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <Image
                      src="/1786855398290.png"
                      alt="Coin Icon"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    {item.price}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center w-full rounded-full border border-[#2563eb] overflow-hidden text-xs font-semibold">
                <button
                  type="button"
                  className="flex-1 py-1.5 bg-white text-[#2563eb] hover:bg-[#eff6ff] transition-colors border-r border-[#2563eb]"
                >
                  Send
                </button>
                <button
                  type="button"
                  className="flex-1 py-1.5 bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
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
