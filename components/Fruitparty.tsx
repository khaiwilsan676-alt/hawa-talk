'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FruitpartyProps {
  onClose: () => void;
}

// -------------------------------------------------------------
// Perfect 3x3 Grid Layout (Strict Fixed Sizes for Cards)
// Har Fruit ka apna alag size hai (imgW aur imgH ke roop mein).
// Tum in values ko badal kar kisi bhi particular fruit ka size adjust kar sakte ho!
// -------------------------------------------------------------
const GRID_ITEMS = [
  { id: 1, type: 'fruit', img: '/IMG_20260908_192143.png', multi: '×5',  move: 'translate-x-[5px] translate-y-[5px]', imgW: 36, imgH: 36 },  // Lemon
  { id: 2, type: 'fruit', img: '/IMG_20260908_192050.png', multi: '×10', move: 'translate-y-[5px]',                   imgW: 36, imgH: 36 },  // Apple
  { id: 3, type: 'fruit', img: '/IMG_20260908_191941.png', multi: '×5',  move: '-translate-x-[5px] translate-y-[5px]', imgW: 41, imgH: 41 },  // Mango
  { id: 8, type: 'fruit', img: '/IMG_20260908_192013.png', multi: '×15', move: 'translate-x-[5px]',                   imgW: 36, imgH: 36 },  // Cherry
  { id: 9, type: 'timer', move: 'z-20 scale-[1.10]' },                                                                                        // CENTER (Timer)
  { id: 4, type: 'fruit', img: '/IMG_20260908_191906.png', multi: '×45', move: '-translate-x-[5px]',                   imgW: 36, imgH: 36 },// Strawberry
  { id: 7, type: 'fruit', img: '/IMG_20260908_191930.png', multi: '×5',  move: 'translate-x-[5px] -translate-y-[5px]', imgW: 36, imgH: 36 },  // Guava
  { id: 6, type: 'fruit', img: '/IMG_20260908_192203.png', multi: '×5',  move: '-translate-y-[5px]',                   imgW: 37, imgH: 37 },  // Orange
  { id: 5, type: 'fruit', img: '/IMG_20260908_192120.png', multi: '×25', move: '-translate-x-[5px] -translate-y-[5px]', imgW: 36, imgH: 36 },// Grapes
];

// Clockwise path for Spinner (Perimeter cards only, skipping center timer at index 4)
const SPIN_PATH = [0, 1, 2, 5, 8, 7, 6, 3]; 

// ==========================================
// IndexedDB Logic for Winners History
// ==========================================
const DB_NAME = 'FruitPartyDB';
const STORE_NAME = 'GameState';

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject("No window");
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveWinnersToDB(winners: string[]) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(winners, 'winners');
  } catch (err) {
    console.error("IndexedDB Save Error:", err);
  }
}

async function loadWinnersFromDB(): Promise<string[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get('winners');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB Load Error:", err);
    return [];
  }
}

// ==========================================
// WebGL Shader for real-time solid white background removal
// ==========================================
function WebGLShaderImage({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
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
      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        float isWhite = step(0.88, color.r) * step(0.88, color.g) * step(0.88, color.b);
        if (isWhite > 0.5) {
          discard;
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
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,  0, 1,
         1, -1,  1, 1,
        -1,  1,  0, 0,
        -1,  1,  0, 0,
         1, -1,  1, 1,
         1,  1,  1, 0,
      ]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'a_position');
    const aTexCoord = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

    const texture = gl.createTexture();
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = src;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
  }, [src]);

  return <canvas ref={canvasRef} className="w-full h-full object-contain" />;
}

export default function Fruitparty({ onClose }: FruitpartyProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // States: Phase, Countdown, aur Spinner
  const [phase, setPhase] = useState<'betting' | 'spinning'>('betting');
  const [countdown, setCountdown] = useState(30);
  
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const highlightRef = useRef<number | null>(null);
  
  // Winners history ko save karne ke liye
  const [winners, setWinners] = useState<string[]>([]);
  
  // Track karne ke liye konsa button active (clicked) hai
  const [activeBtn, setActiveBtn] = useState<number | null>(null);

  // Load IndexedDB History on Mount
  useEffect(() => {
    loadWinnersFromDB().then(savedWinners => {
      if (savedWinners && savedWinners.length > 0) {
        setWinners(savedWinners);
      }
    });
  }, []);

  // Loading progression effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 200);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Main Timer Loop (30s Betting -> 15s Spinning)
  useEffect(() => {
    if (loading) return;

    const clock = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (phase === 'betting') {
            setPhase('spinning');
            return 15; // 15 Second ka Spinning timer chalu
          } else {
            // Spin Khatam hone par Winner decide karo
            if (highlightRef.current !== null) {
              const winnerItem = GRID_ITEMS[highlightRef.current];
              if (winnerItem && winnerItem.img) {
                setWinners(w => {
                  // 10 winners ki history rakhenge (UI overfill na ho isliye)
                  const newWinners = [...w, winnerItem.img as string].slice(-10);
                  saveWinnersToDB(newWinners); // IndexedDB mein save kiya
                  return newWinners;
                });
              }
            }
            setPhase('betting');
            return 30; // Wapas 30s Betting chalu
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(clock);
  }, [loading, phase]);

  // Fast Spinner Effect Loop (Sirf Spinning Phase mein chalega)
  useEffect(() => {
    if (phase === 'spinning') {
      const interval = setInterval(() => {
        setHighlightIndex(prev => {
          let nextPos = 0;
          if (prev !== null) {
            const currentPos = SPIN_PATH.indexOf(prev);
            nextPos = (currentPos + 1) % SPIN_PATH.length;
          }
          const nextIndex = SPIN_PATH[nextPos];
          highlightRef.current = nextIndex;
          return nextIndex;
        });
      }, 120); // Speed of the spin (120ms)
      
      return () => clearInterval(interval);
    } else {
      // Jaise hi spin hatega, original color wapas aa jayega (null karke)
      setHighlightIndex(null);
    }
  }, [phase]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 70vh Bottom Sheet */}
      <div
        className="relative bg-[#330c36] w-full max-w-md shadow-2xl overflow-hidden animate-slide-up flex flex-col rounded-none"
        style={{ height: '70vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {!loading && (
          <>
            {/* TOP LEFT BUTTONS */}
            <div className="absolute top-[6.5px] left-7 z-30 flex items-center gap-0.5">
              <button className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-[#4a2810] stroke-[#4a2810] stroke-[1.5]">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
              <button className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <span className="text-[#4a2810] font-black text-[18px] leading-none font-serif">?</span>
              </button>
            </div>

            {/* TOP HEADER MIDDLE: Round 358 */}
            <div className="absolute top-[8px] left-1/2 -translate-x-1/2 z-30">
              <span className="text-white font-bold text-base drop-shadow-md tracking-wide">
                Round 358
              </span>
            </div>

            {/* TOP RIGHT BUTTONS */}
            <div className="absolute top-[6.5px] right-7 z-30 flex items-center gap-0.5">
              <button className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-[#4a2810] stroke-[4]" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <button className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-[#4a2810]">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12.5 7V12.25L17 14.92L16.25 16.15L11 13V7H12.5Z" />
                </svg>
              </button>
              <button onClick={onClose} className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-[#4a2810] stroke-[#4a2810] stroke-[1.5]">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </>
        )}

        {loading ? (
          /* ---------- Loading State ---------- */
          <div className="w-full h-full bg-gradient-to-b from-[#4A154B] via-[#330c36] to-[#1e0520] flex flex-col items-center justify-center px-6">
            <div className="w-32 h-32 flex items-center justify-center mb-6">
              <WebGLShaderImage src="/IMG_20260824_232321.png" />
            </div>
            <div className="w-48 bg-black/40 rounded-full h-3 p-0.5 border border-yellow-300/40 shadow-inner">
              <div className="bg-gradient-to-r from-yellow-400 to-amber-300 h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(250,204,21,0.7)]" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-yellow-300 text-xs font-semibold mt-2 tracking-wider">LOADING {progress}%</span>
          </div>
        ) : (
          /* ---------- Game Screen ---------- */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img src="/1787413631876~2.jpg" alt="Fruit Party Background" className="absolute inset-0 w-full h-full object-fill pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center -mt-34">
              
              {/* === STRICT SQUARE CSS GRID === */}
              <div className="grid grid-cols-3 gap-0 mx-auto w-max">
                {GRID_ITEMS.map((item, index) => (
                  <div key={item.id || index} className={`relative w-[78px] h-[87px] flex items-center justify-center transition-transform ${item.move || ''}`}>
                    
                    {item.type === 'fruit' ? (
                      <>
                        {/* Base Card Background */}
                        <img src="/file_00000000d0ec820ba666eab8bea30204.png" alt="Card Base" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0" />
                        
                        {/* 🔥 Green Highlight Overlay */}
                        {highlightIndex === index && (
                          <div className="absolute inset-[3px] bg-[#00FF00]/50 rounded-[8px] z-[5] mix-blend-color animate-pulse pointer-events-none border-[2px] border-green-400"></div>
                        )}

                        {/* Content constrained inside */}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-0.5">
                          <img 
                            src={item.img} 
                            alt="Fruit" 
                            style={{ width: `${item.imgW}px`, height: `${item.imgH}px` }}
                            className="object-contain pointer-events-none drop-shadow-md" 
                          />
                          <span className="text-white text-[11px] font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] leading-none">{item.multi}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Countdown Timer Center Card Background */}
                        <img src="/file_00000000b28881f49f5506a9fd64e7fd.png" alt="Timer Base" className="absolute inset-0 w-full h-full object-fill z-0" />
                        
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                          <span className="text-white text-[9px] font-bold tracking-wider drop-shadow-md mb-0.5">
                            {phase === 'betting' ? 'BETTING' : 'SPINNING'}
                          </span>
                          <span className="text-amber-400 font-extrabold text-xl tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-none">{countdown}s</span>
                        </div>
                      </>
                    )}

                  </div>
                ))}
              </div>
              {/* ============================== */}

              {/* Space and 2 New Images */}
              <div className="flex flex-row justify-center items-center gap-1 mt-1">
                <img src="/IMG_20260908_152953.png" alt="Option 1" className="w-23 h-auto object-contain" />
                <img src="/IMG_20260908_153008.png" alt="Option 2" className="w-23 h-auto object-contain" />
              </div>
            </div>

            {/* Bottom Centered Compact Button Group - 4 Buttons */}
            <div className="absolute bottom-[15vh] left-1/2 -translate-x-1/2 z-30 flex flex-row items-end gap-1 w-max">
              
              {/* Button 1 - 50K */}
              <button onClick={() => setActiveBtn(1)} className="relative flex flex-col items-center w-[85px] h-[100px] cursor-pointer">
                <img 
                  src="/file_00000000d9b08211b0304c61b802348b.png" 
                  alt="Red Button 1" 
                  className={`absolute left-1/2 -translate-x-1/2 w-[90px] h-auto object-contain transition-all duration-150 ${activeBtn === 1 ? 'top-[36px] hue-rotate-[120deg] brightness-110 saturate-150 z-0' : 'top-[29px] z-10'}`} 
                />
                <img 
                  src="/file_000000003d24821182882f8ca412d2b6.png" 
                  alt="Border 1" 
                  className={`absolute top-[34px] left-1/2 -translate-x-1/2 w-[100px] h-auto object-contain pointer-events-none ${activeBtn === 1 ? 'z-10' : 'z-0'}`} 
                />
                <span className="absolute bottom-[35px] text-white font-bold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 pointer-events-none">50K</span>
              </button>

              {/* Button 2 - 500K */}
              <button onClick={() => setActiveBtn(2)} className="relative flex flex-col items-center w-[85px] h-[100px] cursor-pointer">
                <img 
                  src="/file_00000000d9b08211b0304c61b802348b.png" 
                  alt="Red Button 2" 
                  className={`absolute left-1/2 -translate-x-1/2 w-[90px] h-auto object-contain transition-all duration-150 ${activeBtn === 2 ? 'top-[36px] hue-rotate-[120deg] brightness-110 saturate-150 z-0' : 'top-[29px] z-10'}`} 
                />
                <img 
                  src="/file_000000003d24821182882f8ca412d2b6.png" 
                  alt="Border 2" 
                  className={`absolute top-[34px] left-1/2 -translate-x-1/2 w-[100px] h-auto object-contain pointer-events-none ${activeBtn === 2 ? 'z-10' : 'z-0'}`} 
                />
                <span className="absolute bottom-[35px] text-white font-bold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 pointer-events-none">500K</span>
              </button>

              {/* Button 3 - 5M */}
              <button onClick={() => setActiveBtn(3)} className="relative flex flex-col items-center w-[85px] h-[100px] cursor-pointer">
                <img 
                  src="/file_00000000d9b08211b0304c61b802348b.png" 
                  alt="Red Button 3" 
                  className={`absolute left-1/2 -translate-x-1/2 w-[90px] h-auto object-contain transition-all duration-150 ${activeBtn === 3 ? 'top-[36px] hue-rotate-[120deg] brightness-110 saturate-150 z-0' : 'top-[29px] z-10'}`} 
                />
                <img 
                  src="/file_000000003d24821182882f8ca412d2b6.png" 
                  alt="Border 3" 
                  className={`absolute top-[34px] left-1/2 -translate-x-1/2 w-[100px] h-auto object-contain pointer-events-none ${activeBtn === 3 ? 'z-10' : 'z-0'}`} 
                />
                <span className="absolute bottom-[35px] text-white font-bold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 pointer-events-none">5M</span>
              </button>

              {/* Button 4 - 50M */}
              <button onClick={() => setActiveBtn(4)} className="relative flex flex-col items-center w-[85px] h-[100px] cursor-pointer">
                <img 
                  src="/file_00000000d9b08211b0304c61b802348b.png" 
                  alt="Red Button 4" 
                  className={`absolute left-1/2 -translate-x-1/2 w-[90px] h-auto object-contain transition-all duration-150 ${activeBtn === 4 ? 'top-[36px] hue-rotate-[120deg] brightness-110 saturate-150 z-0' : 'top-[29px] z-10'}`} 
                />
                <img 
                  src="/file_000000003d24821182882f8ca412d2b6.png" 
                  alt="Border 4" 
                  className={`absolute top-[34px] left-1/2 -translate-x-1/2 w-[100px] h-auto object-contain pointer-events-none ${activeBtn === 4 ? 'z-10' : 'z-0'}`} 
                />
                <span className="absolute bottom-[35px] text-white font-bold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 pointer-events-none">50M</span>
              </button>
            </div>

            {/* 🔥 Winners History Dikhane Ki Jagah (Ekdam Bottom Par) */}
            <div className="absolute bottom-2 left-8 z-40 flex flex-row flex-wrap gap-0.5 max-w-[90vw]">
              {winners.map((imgUrl, i) => (
                <div key={i} className="animate-fade-in-up">
                  <img src={imgUrl} alt="Winner" className="w-5 h-5 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                </div>
              ))}
            </div>

            {/* Left Side: 82927 (Bottom 4vh) */}
            <div className="absolute bottom-[6vh] left-8 z-30 flex items-center gap-0.5">
              <div className="w-6 h-6">
                <WebGLShaderImage src="/1786855398290.png" />
              </div>
              <span className="text-white font-bold text-base drop-shadow-md">
                82927
              </span>
            </div>

            {/* Right Side: 30180 (Bottom 4vh) - Image on Left, Value on Right */}
            <div className="absolute bottom-[6vh] right-8 z-30 flex items-center gap-0.5">
              <div className="w-6 h-6">
                <WebGLShaderImage src="/1786855398290.png" />
              </div>
              <span className="text-white font-bold text-base drop-shadow-md">
                30180
              </span>
            </div>

          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(0.8); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

