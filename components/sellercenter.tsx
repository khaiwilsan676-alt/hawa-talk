'use client';

import React, { useEffect, useState } from 'react';

interface SellerCenterProps {
  onBack?: () => void;
}

// Custom Hook jo WebGL Shader se image ka white background strictly remove karta hai (PURE ORIGINAL)
function useProcessedShaderImage(src: string) {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false });
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
        if (color.r > 0.9 && color.g > 0.9 && color.b > 0.9) {
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

    const vertShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]), gl.STATIC_DRAW);

    const posAttrLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttrLocation);
    gl.vertexAttribPointer(posAttrLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 1,  1, 1,  0, 0,
      0, 0,  1, 1,  1, 0,
    ]), gl.STATIC_DRAW);

    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = src;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const dataUrl = canvas.toDataURL('image/png');
      setProcessedSrc(dataUrl);
    };
  }, [src]);

  return processedSrc;
}

export default function SellerCenter({ onBack }: SellerCenterProps) {
  // State to toggle between 'seller' and 'record' pages inside the same file
  const [currentView, setCurrentView] = useState<'seller' | 'record'>('seller');

  // WebGL Shader se white background hataya hua coin image
  const cleanedCoinIcon = useProcessedShaderImage('/1786855398290.png');

  // Dummy transactions for Record View
  const transactions = [
    {
      id: 1,
      transferTo: "💫FAKE SMILE🦅",
      nameColor: "text-yellow-500",
      date: "09/04/2026 19:16",
      amount: "-6,450,000",
      balance: "2,204,251,179"
    },
    {
      id: 2,
      transferTo: "🇮🇳Indian_Tiger🇮🇳",
      nameColor: "text-green-500",
      date: "09/04/2026 19:10",
      amount: "-2,150,000",
      balance: "2,210,701,179"
    },
    {
      id: 3,
      transferTo: "🖤KING—⭐",
      nameColor: "text-yellow-400",
      date: "09/04/2026 19:06",
      amount: "-2,150,000",
      balance: "2,212,851,179"
    },
    {
      id: 4,
      transferTo: "Asael🖤",
      nameColor: "text-yellow-500",
      date: "09/04/2026 18:52",
      amount: "-2,150,000",
      balance: "2,215,001,179"
    }
  ];

  // 1. RECORD VIEW
  if (currentView === 'record') {
    return (
      <div className="w-full min-h-screen bg-white font-sans text-gray-800 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-50">
          <button onClick={() => setCurrentView('seller')} className="p-1 cursor-pointer">
            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-black fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <h1 className="text-[17px] font-medium text-gray-800 tracking-wide flex-1 text-center pr-6">
            Record
          </h1>
        </div>

        <div className="flex flex-col pb-8">
          <div className="flex items-center justify-between px-4 py-2 space-x-2">
            <div className="flex-1 flex items-center justify-between border border-gray-500 rounded-md px-3 py-2 bg-white">
              <span className="text-[13px] text-gray-800">09/04/2026</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-gray-600 fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            
            <span className="text-gray-400 font-medium">-</span>
            
            <div className="flex-1 flex items-center justify-between border border-gray-500 rounded-md px-3 py-2 bg-white">
              <span className="text-[13px] text-gray-800">09/04/2026</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-gray-600 fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>

          <div className="px-4 mt-4">
            <h2 className="text-[15px] font-bold text-gray-800 mb-3">summary</h2>
            <div className="grid grid-cols-2 gap-y-5 gap-x-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-yellow-400 fill-none stroke-[2]">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 7v10M10 9h4M10 15h4"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400 leading-tight">total sold coins</span>
                  <span className="text-[14px] font-bold text-gray-800">6,709,065,000</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-indigo-400 fill-none stroke-[2]">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <path d="M20 8v6M17 11h6"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400 leading-tight">total sold times</span>
                  <span className="text-[14px] font-bold text-gray-800">615</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-blue-400 fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400 leading-tight">total purchased coins</span>
                  <span className="text-[14px] font-bold text-gray-800">7,505,000,000</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-green-400 fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400 leading-tight">team members</span>
                  <span className="text-[14px] font-bold text-gray-800">1</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-blue-500 fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400 leading-tight">my sold coins</span>
                  <span className="text-[14px] font-bold text-gray-800">6,673,315,000</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-orange-400 fill-none stroke-[2]">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <rect x="16" y="8" width="6" height="4" rx="1"></rect>
                    <path d="M22 10l2-1.5v5L22 12"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400 leading-tight">member sold coins</span>
                  <span className="text-[14px] font-bold text-gray-800">35,750,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 my-6"></div>

          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold text-gray-800">coin details</h2>
              <div className="relative border border-gray-400 rounded-md px-2 py-1 bg-white flex items-center cursor-pointer">
                <span className="text-[12px] text-gray-700 pr-2">transfer out</span>
                <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-black fill-none stroke-[2]">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-[12px] font-semibold text-gray-400 flex-1">action</span>
              <span className="text-[12px] font-semibold text-gray-400 flex-1 text-center pl-2">int</span>
              <span className="text-[12px] font-semibold text-gray-400 flex-1 text-right">detail</span>
            </div>

            <div className="flex flex-col space-y-5">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-start border-b border-gray-50 pb-4">
                  <div className="flex flex-col flex-1">
                    <span className="text-[13px] font-bold text-gray-800 mb-0.5">transfer to:</span>
                    <span className={`text-[14px] font-extrabold ${tx.nameColor} drop-shadow-sm`}>{tx.transferTo}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{tx.date}</span>
                  </div>

                  <div className="flex flex-col items-center flex-1 pt-1">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-purple-500">
                         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.1-.96-2.17-1.92H8.01c.06 1.81 1.25 3.1 2.89 3.49V20h2.34v-1.7c1.47-.31 2.72-1.36 2.72-2.86 0-1.81-1.33-2.71-3.65-3.3z"/>
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">user purchase</span>
                  </div>

                  <div className="flex flex-col flex-1 items-end pt-1">
                    <span className="text-[14.5px] font-bold text-[#1ca3ff] mb-0.5">{tx.amount}</span>
                    <span className="text-[10px] text-gray-600">account balance</span>
                    <span className="text-[11px] text-gray-800 font-medium mt-0.5">{tx.balance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. SELLER CENTER VIEW (Default)
  return (
    <div className="w-full min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      
      <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-50">
        <button onClick={onBack} className="p-1 cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-black fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <h1 className="text-[17px] font-semibold tracking-wide">Coins seller</h1>
        
        {/* Record Tab Click to Switch View */}
        <button 
          onClick={() => setCurrentView('record')} 
          className="text-[14px] font-medium text-gray-700 hover:text-blue-500 cursor-pointer"
        >
          Record
        </button>
      </div>

      <div className="px-4 pb-8 space-y-6">
        
        <div className="w-full bg-[#f0f9ff] rounded-2xl p-4 flex flex-col space-y-4 shadow-sm border border-blue-50">
          <div className="flex items-center space-x-3 pb-3 border-b border-blue-100">
            <div className="w-14 h-14 rounded-full bg-blue-200 overflow-hidden border border-gray-200 flex-shrink-0">
              <img src="https://i.pravatar.cc/150?u=nawab" alt="Profile" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] text-white font-bold">C</div>
                <span className="text-[15px] font-bold italic tracking-wide">NAWAB MERCHANT</span>
                <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] text-white font-bold">C</div>
              </div>
              
              <div className="flex items-center space-x-1 mt-1">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-blue-500">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span className="text-[13px] font-medium text-gray-600">+918532872219</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[14px] text-gray-600 font-medium">account balance</span>
            <div className="flex items-center space-x-1.5 text-blue-500">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.1-.96-2.17-1.92H8.01c.06 1.81 1.25 3.1 2.89 3.49V20h2.34v-1.7c1.47-.31 2.72-1.36 2.72-2.86 0-1.81-1.33-2.71-3.65-3.3z"/>
              </svg>
              <span className="text-[17px] font-bold">2,210,701,179</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[14px] font-semibold text-gray-700">transfer to</label>
          <div className="w-full flex items-center border-2 border-blue-400 rounded-xl overflow-hidden">
            <div className="pl-3 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-blue-500 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Enter User's ID"
              className="flex-1 px-3 py-3 text-[14px] outline-none text-gray-800 placeholder-gray-400"
            />
            <button className="bg-blue-500 px-4 py-3 flex items-center justify-center cursor-pointer">
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-white fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[14px] font-semibold text-gray-700">transfer amount</label>
          <div className="w-full flex items-center border-2 border-blue-400 rounded-xl px-3 py-3 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center">
              <img 
                src={cleanedCoinIcon} 
                alt="Coin" 
                className="w-6 h-6 object-contain select-none" 
              />
            </div>
            <input 
              type="number" 
              placeholder="Enter amount"
              className="flex-1 px-3 text-[14px] outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="pt-2">
          <button className="w-full bg-blue-500 text-white font-bold text-[16px] py-3.5 rounded-full shadow-md hover:bg-blue-600 active:scale-[0.98] transition-transform cursor-pointer">
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
