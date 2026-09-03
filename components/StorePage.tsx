"use client";

import React, { useState, useEffect, useRef } from "react";
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
  { id: "t1", name: "Seafood", image: "/1784533036732~2.jpg", tab: "Theme", stars: 4, price: "2,700,000", duration: "30D" },
  { id: "t2", name: "Night Sky", image: "/1784533036732~2.jpg", tab: "Theme", stars: 5, price: "2,400,000", duration: "30D" },

  // Chat Bubble
  { id: "c1", name: "Blue Bubble", image: "/1784533036732~2.jpg", tab: "Chat Bubble", stars: 4, price: "500,000", duration: "3D" },

  // ID
  { id: "i1", name: "ID Badge 8", image: "/1784533036732~2.jpg", tab: "ID", stars: 5, price: "10,000,000", duration: "3D", isOwned: true },
];

function WebGLCoinIcon({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, alpha: true });
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        if (lum > 0.85 && color.r > 0.8 && color.g > 0.8 && color.b > 0.8) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
          gl_FragColor = color;
        }
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 1,  1, 1,  0, 0,
      0, 0,  1, 1,  1, 0,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
  }, [src]);

  return <canvas ref={canvasRef} width={64} height={64} className="w-full h-full object-contain" />;
}

export default function StorePage({ onBack }: { onBack: () => void }) {
  const [currentView, setCurrentView] = useState<"store" | "bag">("store");
  const [activeTab, setActiveTab] = useState("Vehicle");
  const [tryThemeItem, setTryThemeItem] = useState<StoreItem | null>(null);

  const displayedItems = allStoreItems.filter(item => {
    if (currentView === "bag") {
      return item.isOwned && item.tab === activeTab;
    }
    return item.tab === activeTab;
  });

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`text-[20px] ${i < count ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-[#f3f8fe] text-gray-800 pb-10 select-none font-sans relative">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        
        {/* Top Header */}
        <div
          className="relative flex items-center justify-between px-4 pb-2 pt-2 bg-transparent"
          style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 8px)' }}
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

          {/* Top Right Icon Images strictly set to 70px */}
          {currentView === "store" ? (
            <button 
              type="button"
              onClick={() => setCurrentView("bag")}
              className="relative w-[70px] h-[70px] z-10 flex items-center justify-center hover:opacity-80 transition-opacity"
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
              className="relative w-[70px] h-[70px] z-10 flex items-center justify-center hover:opacity-80 transition-opacity"
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

        {/* Category Tabs - Gap reduced to 2 */}
        <div className="flex items-center gap-2 px-4 mt-2 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <div key={tab} className="relative flex items-center justify-center h-[46px]">
                {isActive && (
                  <div className="absolute w-[44px] h-[44px] bg-[#1d4ed8] rounded-full shadow-sm"></div>
                )}
                
                <button
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 whitespace-nowrap text-[14px] px-2.5 transition-colors ${
                    isActive
                      ? "text-black font-bold"
                      : "text-gray-400 font-normal hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              </div>
            );
          })}
        </div>

        {/* Items Grid - Gap reduced to 2 */}
        <div className="grid grid-cols-3 gap-2 px-3 py-2 mt-2 flex-1 content-start">
          {displayedItems.map((item) => {
            const isTheme = item.tab === "Theme";

            return (
              <div
                key={item.id}
                className={`relative bg-white rounded-xl p-2 flex flex-col items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden ${
                  isTheme ? "h-[160px]" : ""
                }`}
              >
                {isTheme && (
                  <div className="absolute inset-0 w-full h-full z-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>
                )}

                {/* Top Bar inside Card */}
                <div className={`flex items-center justify-between w-full text-[10px] z-10 ${isTheme ? "text-white" : ""}`}>
                  <div className={`flex items-center gap-0.5 ${isTheme ? "text-white" : "text-[#1d4ed8]"}`}>
                    <div className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${isTheme ? "bg-white/30 backdrop-blur-sm text-white" : "bg-[#1d4ed8] text-white"}`}>
                      <svg className="w-1.5 h-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-bold">{item.duration}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTheme) {
                        setTryThemeItem(item);
                      }
                    }}
                    className={`font-bold z-20 no-underline ${isTheme ? "text-white" : "text-[#1d4ed8]"}`}
                  >
                    Try
                  </button>
                </div>

                {!isTheme && (
                  <div className="relative w-full h-[52px] my-1.5 flex items-center justify-center z-10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="33vw"
                    />
                  </div>
                )}

                {isTheme && <div className="flex-1"></div>}

                {/* Price Row using WebGL Shader */}
                <div className="flex items-center justify-center gap-1 mb-1.5 w-full z-10">
                  <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    <WebGLCoinIcon src="/1786855398290.png" />
                  </div>
                  <span className={`text-[10px] font-bold tracking-tight truncate ${isTheme ? "text-white drop-shadow" : "text-gray-900"}`}>
                    {item.price}
                  </span>
                </div>

                {/* Bottom Buttons inside Card */}
                <div className="flex items-center w-full rounded-full border border-[#1d4ed8] overflow-hidden h-[22px] z-10 bg-white">
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
            );
          })}

          {displayedItems.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 mt-12 text-sm font-medium">
              {currentView === "bag" ? "No items in Bag for this category" : "No items found"}
            </div>
          )}
        </div>
      </div>

      {/* STRICT THEME TRY OVERLAY MODAL (Tall height, narrow width, no 30d/coins/send button, clean stars at bottom) */}
      {tryThemeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-[260px] flex flex-col items-center">
            
            {/* Close Button top-right */}
            <button
              type="button"
              onClick={() => setTryThemeItem(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-lg font-bold hover:bg-white/40 z-20"
            >
              ✕
            </button>

            {/* Tall & Narrow Preview Card with Yellow Border */}
            <div className="relative w-[230px] h-[480px] rounded-3xl border-[4px] border-yellow-300 overflow-hidden shadow-2xl bg-black">
              <Image
                src={tryThemeItem.image}
                alt={tryThemeItem.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Stars at bottom */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {renderStars(tryThemeItem.stars)}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

