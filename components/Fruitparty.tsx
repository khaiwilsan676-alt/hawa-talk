'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FruitpartyProps {
  onClose: () => void;
}

// -------------------------------------------------------------
// Perfect 3x3 Grid Layout (Strict Fixed Sizes for Cards) 
// (Aapke original Grapes & Orange swap kar diye hain)
// -------------------------------------------------------------
const GRID_ITEMS = [
  { id: 1, type: 'fruit', img: '/IMG_20260908_192143.png', multi: '×5',  move: 'translate-x-[5px] translate-y-[5px]', imgW: 50, imgH: 50 },  // Lemon
  { id: 2, type: 'fruit', img: '/IMG_20260908_192050.png', multi: '×10', move: 'translate-y-[5px]',                   imgW: 50, imgH: 50 },  // Apple
  { id: 3, type: 'fruit', img: '/IMG_20260908_191941.png', multi: '×5',  move: '-translate-x-[5px] translate-y-[5px]', imgW: 58, imgH: 58 },  // Mango
  { id: 8, type: 'fruit', img: '/IMG_20260908_192013.png', multi: '×15', move: 'translate-x-[5px]',                   imgW: 50, imgH: 50 },  // Cherry
  { id: 9, type: 'timer', move: 'z-20 scale-[1.10]' },                                                                                        // CENTER (Timer)
  { id: 4, type: 'fruit', img: '/IMG_20260908_191906.png', multi: '×45', move: '-translate-x-[5px]',                   imgW: 50, imgH: 50 },// Strawberry
  { id: 7, type: 'fruit', img: '/IMG_20260908_191930.png', multi: '×5',  move: 'translate-x-[5px] -translate-y-[5px]', imgW: 50, imgH: 50 },  // Guava
  { id: 6, type: 'fruit', img: '/IMG_20260908_192203.png', multi: '×5',  move: '-translate-y-[5px]',                   imgW: 55, imgH: 55 },  // Orange (Swapped with Grapes)
  { id: 5, type: 'fruit', img: '/IMG_20260908_192120.png', multi: '×25', move: '-translate-x-[5px] -translate-y-[5px]', imgW: 50, imgH: 50 },// Grapes (Swapped with Orange)
];

// Clockwise path for Spinner & Pointer
const SPIN_PATH = [0, 1, 2, 5, 8, 7, 6, 3]; 

// ==========================================
// IndexedDB Logic for Global Rounds & History
// ==========================================
const DB_NAME = 'FruitPartyDB';
const STORE_NAME = 'GameState';

interface GameStateData {
  currentRound: number;
  winners: string[];
  roundHistory: Array<{ round: number; winnerImg: string; won: boolean }>;
  lastResetTime: number;
  balance: number;
  totalWon: number;
}

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject("No window");
    const request = indexedDB.open(DB_NAME, 2);
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

async function saveGameStateToDB(state: GameStateData) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(state.currentRound, 'currentRound');
    store.put(state.winners, 'winners');
    store.put(state.roundHistory, 'roundHistory');
    store.put(state.lastResetTime, 'lastResetTime');
    store.put(state.balance, 'balance');
    store.put(state.totalWon, 'totalWon');
  } catch (err) {
    console.error("IndexedDB Save Error:", err);
  }
}

async function loadGameStateFromDB(): Promise<GameStateData> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      
      const reqRound = store.get('currentRound');
      const reqWinners = store.get('winners');
      const reqHistory = store.get('roundHistory');
      const reqReset = store.get('lastResetTime');
      const reqBalance = store.get('balance');
      const reqTotalWon = store.get('totalWon');

      tx.oncomplete = () => {
        const now = Date.now();
        let lastReset = reqReset.result || 0;
        const savedBalance = reqBalance.result !== undefined ? reqBalance.result : 82927;
        const savedTotalWon = reqTotalWon.result !== undefined ? reqTotalWon.result : 0;

        const currentDate = new Date(now);
        const resetToday = new Date(currentDate);
        resetToday.setHours(5, 30, 0, 0);
        
        let cutoff = resetToday.getTime();
        if (now < cutoff) {
          cutoff -= 24 * 60 * 60 * 1000;
        }

        if (lastReset < cutoff) {
          const freshState: GameStateData = {
            currentRound: 358,
            winners: [],
            roundHistory: [],
            lastResetTime: now,
            balance: savedBalance,
            totalWon: 0 
          };
          saveGameStateToDB(freshState);
          resolve(freshState);
        } else {
          resolve({
            currentRound: reqRound.result || 358,
            winners: reqWinners.result || [],
            roundHistory: reqHistory.result || [],
            lastResetTime: lastReset || now,
            balance: savedBalance,
            totalWon: savedTotalWon
          });
        }
      };
      tx.onerror = () => {
        resolve({ currentRound: 358, winners: [], roundHistory: [], lastResetTime: Date.now(), balance: 82927, totalWon: 0 });
      };
    });
  } catch (err) {
    return { currentRound: 358, winners: [], roundHistory: [], lastResetTime: Date.now(), balance: 82927, totalWon: 0 };
  }
}

// ==========================================
// FIX: WebGL Crash hata kar Canvas 2D (Ye kabhi crash nahi hoga)
// ==========================================
function WebGLShaderImage({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = src;
    
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 220 && data[i + 1] > 220 && data[i + 2] > 220) {
            data[i + 3] = 0; 
          }
        }
        ctx.putImageData(imageData, 0, 0);
      } catch (err) {}
    };
  }, [src]);

  return <canvas ref={canvasRef} className="w-full h-full object-contain" />;
}

const getDynamicTextSize = (val: number) => {
  const len = val.toString().length;
  if (len > 8) return 'text-[10px]';
  if (len > 6) return 'text-[12px]';
  return 'text-base'; 
};

export default function Fruitparty({ onClose }: FruitpartyProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const [phase, setPhase] = useState<'betting' | 'spinning'>('betting');
  const [countdown, setCountdown] = useState(30);
  
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const highlightRef = useRef<number | null>(null);
  
  const [handPointerIndex, setHandPointerIndex] = useState<number>(SPIN_PATH[0]);

  const [currentRound, setCurrentRound] = useState(358);
  const [winners, setWinners] = useState<string[]>([]);
  const [roundHistory, setRoundHistory] = useState<Array<{ round: number; winnerImg: string; won: boolean }>>([]);
  
  const [balance, setBalance] = useState(82927);
  const [totalWon, setTotalWon] = useState(0);
  const [bets, setBets] = useState<Record<number, number>>({});
  const stateRefs = useRef({ balance: 82927, totalWon: 0, bets: {} as Record<number, number> });

  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const [activeBtn, setActiveBtn] = useState<number | null>(null);

  // ==========================================
  // SAFE RESPONSIVE FIX (Bina design hilaaye chote phone k liye zoom out trick)
  // ==========================================
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 390) {
        setScale(width / 390);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadGameStateFromDB().then((data) => {
      if (data) {
        setCurrentRound(data.currentRound);
        setWinners(data.winners || []);
        setRoundHistory(data.roundHistory || []);
        setBalance(data.balance);
        setTotalWon(data.totalWon);
      }
    });
  }, []);

  useEffect(() => {
    stateRefs.current = { balance, totalWon, bets };
  }, [balance, totalWon, bets]);

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

  useEffect(() => {
    if (loading) return;

    const clock = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (phase === 'betting') {
            setPhase('spinning');
            return 15;
          } else {
            if (highlightRef.current !== null) {
              const winnerItem = GRID_ITEMS[highlightRef.current];
              if (winnerItem && winnerItem.img) {
                const winnerImg = winnerItem.img as string;
                
                const { balance: currentBalance, totalWon: currentTotalWon, bets: currentBets } = stateRefs.current;
                
                let earned = 0;
                const betOnWinner = currentBets[winnerItem.id] || 0;
                if (betOnWinner > 0) {
                   const mult = parseInt(winnerItem.multi.replace('×', ''));
                   earned = betOnWinner * mult;
                }

                const nextBalance = currentBalance + earned;
                const nextTotalWon = currentTotalWon + earned;

                setBalance(nextBalance);
                setTotalWon(nextTotalWon);
                setBets({}); 

                setWinners(w => {
                  const newWinners = [...w, winnerImg].slice(-13);
                  setRoundHistory(history => {
                    const newHistory = [
                      { round: currentRound, winnerImg, won: earned > 0 },
                      ...history
                    ];
                    const nextRound = currentRound + 1;
                    setCurrentRound(nextRound);

                    saveGameStateToDB({
                      currentRound: nextRound,
                      winners: newWinners,
                      roundHistory: newHistory,
                      lastResetTime: Date.now(),
                      balance: nextBalance,
                      totalWon: nextTotalWon
                    });

                    return newHistory;
                  });
                  return newWinners;
                });
              }
            }
            setPhase('betting');
            return 30;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(clock);
  }, [loading, phase, currentRound]);

  useEffect(() => {
    if (phase === 'betting' && !loading) {
      const pointerInterval = setInterval(() => {
        setHandPointerIndex((prev) => {
          const currentPos = SPIN_PATH.indexOf(prev);
          const nextPos = (currentPos + 1) % SPIN_PATH.length;
          return SPIN_PATH[nextPos];
        });
      }, 2000);
      return () => clearInterval(pointerInterval);
    }
  }, [phase, loading]);

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
      }, 120); 
      
      return () => clearInterval(interval);
    } else {
      setHighlightIndex(null);
    }
  }, [phase]);

  const handleBetClick = (fruitId: number) => {
    if (phase === 'betting' && activeBtn !== null) {
      const betValues = { 1: 1000, 2: 500000, 3: 5000000, 4: 50000000 };
      const betAmt = betValues[activeBtn as keyof typeof betValues];
      
      if (balance >= betAmt) {
        const newBalance = balance - betAmt;
        const newBets = { ...bets, [fruitId]: (bets[fruitId] || 0) + betAmt };
        
        setBalance(newBalance);
        setBets(newBets);
        
        saveGameStateToDB({ 
          currentRound, winners, roundHistory, 
          lastResetTime: Date.now(), 
          balance: newBalance, 
          totalWon 
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="relative bg-[#330c36] w-full max-w-md shadow-2xl overflow-hidden animate-slide-up flex flex-col rounded-none"
        style={{ height: '70vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {!loading && (
          <>
            <div className="absolute top-[6.5px] left-7 z-30 flex items-center gap-0.5">
              <button className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-[#4a2810] stroke-[#4a2810] stroke-[1.5]">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
              <button 
                onClick={() => setShowRules(true)}
                className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5"
              >
                <span className="text-[#4a2810] font-black text-[18px] leading-none font-serif">?</span>
              </button>
            </div>

            <div className="absolute top-[8px] left-1/2 -translate-x-1/2 z-30">
              <span className="text-white font-bold text-base drop-shadow-md tracking-wide">
                Round {currentRound}
              </span>
            </div>

            <div className="absolute top-[6.5px] right-7 z-30 flex items-center gap-0.5">
              <button className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-[#4a2810] stroke-[4]" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <button 
                onClick={() => setShowHistory(true)}
                className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5"
              >
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
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img src="/1787413631876~2.jpg" alt="Fruit Party Background" className="absolute inset-0 w-full h-full object-fill pointer-events-none" />

            {/* Yaha sirf Square Grid hai, 2-row image ko is container se nikal diya hai! */}
            <div className="relative z-10 w-full flex flex-col items-center -mt-36" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
              <div className="grid grid-cols-3 gap-0 mx-auto w-max">
                {GRID_ITEMS.map((item, index) => (
                 <div 
                  key={item.id || index} 
                  onClick={() => {
                    if (item.type === 'fruit') handleBetClick(item.id);
                  }}
                  className={`relative w-[84px] h-[93px] flex items-center justify-center transition-transform ${item.move || ''} ${item.type === 'fruit' ? 'cursor-pointer' : ''} ${(phase === 'betting' && handPointerIndex === index) || highlightIndex === index ? '!z-[999]' : ''}`}
                >
                    {item.type === 'fruit' ? (
                      <>
                        <img 
                          src="/file_00000000d0ec820ba666eab8bea30204.png" 
                          alt="Card Base" 
                          className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 transition-all duration-300" 
                          style={(highlightIndex === index || (phase === 'betting' && handPointerIndex === index)) ? { filter: 'hue-rotate(-150deg) saturate(200%) drop-shadow(0px 0px 8px lime)' } : {}}
                        />
                        
                        {phase === 'betting' && handPointerIndex === index && (
                          <img 
                            src="/file_000000000f0c820b95490c9d927692d9.png" 
                            alt="Pointer" 
                            className="absolute -bottom-3 -right-2 w-[55px] h-[55px] z-[999] object-contain pointer-events-none -rotate-[45deg] drop-shadow-xl transition-all duration-300"
                          />
                        )}

                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-0.5">
                          <img 
                            src={item.img} 
                            alt="Fruit" 
                            style={{ width: `${item.imgW}px`, height: `${item.imgH}px` }}
                            className="object-contain pointer-events-none drop-shadow-md mb-2" 
                          />
                        </div>

                        {(bets[item.id] || 0) > 0 && (
                          <div className="absolute bottom-[22px] left-1/2 -translate-x-1/2 w-[85%] h-[16px] bg-gradient-to-r from-blue-500/80 to-pink-500/80 flex items-center justify-center gap-[2px] rounded z-20 pointer-events-none shadow-md border border-white/20">
                            <div className="w-[10px] h-[10px] flex-shrink-0">
                              <WebGLShaderImage src="/1786855398290.png" />
                            </div>
                            <span className="text-white text-[9px] font-bold leading-none mt-[1px]">{bets[item.id]}</span>
                          </div>
                        )}

                        <span className="absolute bottom-[10px] left-1/2 -translate-x-1/2 text-white text-[11px] font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] leading-none z-20 pointer-events-none">
                          {item.multi}
                        </span>
                      </>
                    ) : (
                      <>
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
            </div>

            {/* ======================================================== */}
            {/* 2-ROW IMAGE ALAG KAR DI GAYI HAI (ABSOLUTE POSITION PE)  */}
            {/* ======================================================== */}
            <div 
              className="absolute bottom-[22vh] left-1/2 z-30 flex flex-row items-center justify-center gap-0.5 w-max" 
              style={{ transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'bottom center' }}
            >
              <img src="/IMG_20260908_152953.png" alt="Option 1" className="w-23 h-auto object-contain" />
              <img src="/IMG_20260908_153008.png" alt="Option 2" className="w-23 h-auto object-contain" />
            </div>

            <div className="absolute bottom-[15vh] left-1/2 z-30 flex flex-row items-end gap-1 w-max" style={{ transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'bottom center' }}>
              <button onClick={() => setActiveBtn(1)} className="relative flex flex-col items-center w-[85px] h-[100px] cursor-pointer">
                <img src="/file_00000000d9b08211b0304c61b802348b.png" alt="Red Button 1" className={`absolute left-1/2 -translate-x-1/2 w-[90px] h-auto object-contain transition-all duration-150 ${activeBtn === 1 ? 'top-[36px] hue-rotate-[120deg] brightness-110 saturate-150 z-0' : 'top-[29px] z-10'}`} />
                <img src="/file_000000003d24821182882f8ca412d2b6.png" alt="Border 1" className={`absolute top-[34px] left-1/2 -translate-x-1/2 w-[100px] h-auto object-contain pointer-events-none ${activeBtn === 1 ? 'z-10' : 'z-0'}`} />
                <span className="absolute bottom-[35px] text-white font-bold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 pointer-events-none">1K</span>
              </button>

              <button onClick={() => setActiveBtn(2)} className="relative flex flex-col items-center w-[85px] h-[100px] cursor-pointer">
                <img src="/file_00000000d9b08211b0304c61b802348b.png" alt="Red Button 2" className={`absolute left-1/2 -translate-x-1/2 w-[90px] h-auto object-contain transition-all duration-150 ${activeBtn === 2 ? 'top-[36px] hue-rotate-[120deg] brightness-110 saturate-150 z-0' : 'top-[29px] z-10'}`} />
                <img src="/file_000000003d24821182882f8ca412d2b6.png" alt="Border 2" className={`absolute top-[34px] left-1/2 -translate-x-1/2 w-[100px] h-auto object-contain pointer-events-none ${activeBtn === 2 ? 'z-10' : 'z-0'}`} />
                <span className="absolute bottom-[35px] text-white font-bold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 pointer-events-none">500K</span>
              </button>

              <button onClick={() => setActiveBtn(3)} className="relative flex flex-col items-center w-[85px] h-[100px] cursor-pointer">
                <img src="/file_00000000d9b08211b0304c61b802348b.png" alt="Red Button 3" className={`absolute left-1/2 -translate-x-1/2 w-[90px] h-auto object-contain transition-all duration-150 ${activeBtn === 3 ? 'top-[36px] hue-rotate-[120deg] brightness-110 saturate-150 z-0' : 'top-[29px] z-10'}`} />
                <img src="/file_000000003d24821182882f8ca412d2b6.png" alt="Border 3" className={`absolute top-[34px] left-1/2 -translate-x-1/2 w-[100px] h-auto object-contain pointer-events-none ${activeBtn === 3 ? 'z-10' : 'z-0'}`} />
                <span className="absolute bottom-[35px] text-white font-bold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 pointer-events-none">5M</span>
              </button>

              <button onClick={() => setActiveBtn(4)} className="relative flex flex-col items-center w-[85px] h-[100px] cursor-pointer">
                <img src="/file_00000000d9b08211b0304c61b802348b.png" alt="Red Button 4" className={`absolute left-1/2 -translate-x-1/2 w-[90px] h-auto object-contain transition-all duration-150 ${activeBtn === 4 ? 'top-[36px] hue-rotate-[120deg] brightness-110 saturate-150 z-0' : 'top-[29px] z-10'}`} />
                <img src="/file_000000003d24821182882f8ca412d2b6.png" alt="Border 4" className={`absolute top-[34px] left-1/2 -translate-x-1/2 w-[100px] h-auto object-contain pointer-events-none ${activeBtn === 4 ? 'z-10' : 'z-0'}`} />
                <span className="absolute bottom-[35px] text-white font-bold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 pointer-events-none">50M</span>
              </button>
            </div>

            <div className="absolute bottom-3 z-40 flex flex-row flex-wrap gap-0.5 max-w-[90vw]" style={{ left: '51px' }}>
              {winners.map((imgUrl, i) => (
                <div key={i} className="animate-fade-in-up">
                  <img src={imgUrl} alt="Winner" className="w-5 h-5 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                </div>
              ))}
            </div>

            <div className="absolute bottom-[6vh] z-30 flex items-center gap-0.5 w-[90px]" style={{ left: '55px' }}>
              <div className="w-5 h-5 flex-shrink-0">
                <WebGLShaderImage src="/1786855398290.png" />
              </div>
              <span className={`text-white font-bold drop-shadow-md text-left flex-1 truncate ${getDynamicTextSize(balance)}`}>
                {balance}
              </span>
            </div>

            <div className="absolute bottom-[6vh] z-30 flex items-center gap-0.5 w-[90px]" style={{ right: '35px' }}>
              <div className="w-5 h-5 flex-shrink-0">
                <WebGLShaderImage src="/1786855398290.png" />
              </div>
              <span className={`text-white font-bold drop-shadow-md text-left flex-1 truncate ${getDynamicTextSize(totalWon)}`}>
                {totalWon}
              </span>
            </div>

          </div>
        )}
      </div>

      {showHistory && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center">
          <div className="absolute inset-0 bg-transparent" onClick={() => setShowHistory(false)} />
          <div className="relative bg-black w-full max-w-md h-[40vh] rounded-t-md shadow-2xl flex flex-col overflow-hidden text-white animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => setShowHistory(false)} className="w-6 h-6 flex items-center justify-center active:scale-95 transition-all">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </button>
              <span className="font-bold text-base tracking-wide">History</span>
              <div className="w-6" /> 
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1">
              {roundHistory.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs font-medium">
                  No round history available yet.
                </div>
              ) : (
                roundHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-1.5 px-2">
                    <span className="text-sm font-bold text-gray-200">Round {item.round}</span>
                    <div className="flex items-center gap-3">
                      <img src={item.winnerImg} alt="Fruit" className="w-6 h-6 object-contain drop-shadow-sm" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center">
          <div className="absolute inset-0 bg-transparent" onClick={() => setShowRules(false)} />
          <div className="relative bg-black w-full max-w-md h-[40vh] rounded-t-md shadow-2xl flex flex-col overflow-hidden text-white animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => setShowRules(false)} className="w-6 h-6 flex items-center justify-center active:scale-95 transition-all">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </button>
              <span className="font-bold text-base tracking-wide">Rules</span>
              <div className="w-6" /> 
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-2 pb-6">
              <ul className="list-disc space-y-3 text-sm text-gray-200 font-medium">
                <li>You can place bet by Clicking on the Red button and Place the bet On the Fruit Card</li>
                <li>10,15,25,45 give you hight coins</li>
                <li>You will Receive Coins according to ( Your Bet × Multipler)</li>
                <li>Left mix Card Give you all 5 times Coins ( Your Bet × all ×5 Times )</li>
                <li>Right Mix card Give you all High Cards ( Your Bet × 10,15,25,45 Times)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

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

