'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WildpartyProps {
  onClose: () => void;
}

interface AnimalItem {
  id: number;
  src: string;
  alt: string;
  angle: number;
  distance: number;
  x: number;
  y: number;
  size: number;
  multiplier: number;
}

interface ChipItem {
  label: string;
  value: number;
  src: string;
}

interface RoundHistoryRecord {
  roundNo: number;
  winnerAlt: string;
  timestamp: number;
}

// 1. WebGL Shader: White Background remover
function LoadingShaderImage({ src, className }: { src: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      varying vec2 v_texCoord;
      uniform sampler2D u_image;

      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        if (color.a < 0.1) discard;

        if (color.r > 0.88 && color.g > 0.88 && color.b > 0.88) {
          discard;
        } else {
          gl_FragColor = color;
        }
      }
    `;

    const createShader = (glCtx: WebGLRenderingContext, type: number, source: string) => {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
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

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 0, 1,
         1, -1, 1, 1,
        -1,  1, 0, 0,
        -1,  1, 0, 0,
         1, -1, 1, 1,
         1,  1, 1, 0,
      ]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'a_position');
    const aTexCoord = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = src;
    image.onload = () => {
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      gl.viewport(0, 0, canvas.width, canvas.height);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
  }, [src]);

  return <canvas ref={canvasRef} className={`${className || ''} block bg-transparent`} />;
}

// 2. Green Screen Remover
function GreenScreenImage({ src, className }: { src: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const isGreen = g > 65 && g > r * 1.15 && g > b * 1.15;
        if (isGreen) {
          data[i + 3] = 0;
        } else if (g > Math.max(r, b)) {
          data[i + 1] = Math.max(r, b);
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
  }, [src]);

  return <canvas ref={canvasRef} className={`${className || ''} block bg-transparent`} />;
}

export default function Wildparty({ onClose }: WildpartyProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Global Synchronized Game Engine States
  const [currentRoundNo, setCurrentRoundNo] = useState<number>(1);
  const [gamePhase, setGamePhase] = useState<'betting' | 'spinning' | 'result'>('betting');
  const [countdown, setCountdown] = useState<number>(30);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);

  // Sheets Control
  const [showHistorySheet, setShowHistorySheet] = useState<boolean>(false);
  const [showRulesSheet, setShowRulesSheet] = useState<boolean>(false);

  // History & Winner
  const [roundHistory, setRoundHistory] = useState<RoundHistoryRecord[]>([]);
  const [winnerAnimal, setWinnerAnimal] = useState<AnimalItem | null>(null);

  // Balance & Betting
  const [balance, setBalance] = useState<number>(5000000);
  const [bets, setBets] = useState<{ [key: string]: number }>({});
  const [lastBets, setLastBets] = useState<{ [key: string]: number }>({});
  const [selectedChip, setSelectedChip] = useState<ChipItem>({
    label: '10K',
    value: 10000,
    src: '/IMG_20260822_143032.png',
  });

  const chips: ChipItem[] = [
    { label: '1K', value: 1000, src: '/1787389350745~2.jpg' },
    { label: '10K', value: 10000, src: '/IMG_20260822_143032.png' },
    { label: '50k', value: 50000, src: '/IMG_20260822_143348.png' },
    { label: '500k', value: 500000, src: '/IMG_20260822_143408.png' },
    { label: '5M', value: 5000000, src: '/IMG_20260822_143422~2.jpg' },
  ];

  // Original Exact Coordinates, Sizes & Multipliers
  const animals: AnimalItem[] = [
    { id: 0, src: '/IMG_20260822_011118.png', alt: 'Dog', angle: 315, distance: 130, x: 0, y: -15, size: 55, multiplier: 5 },
    { id: 1, src: '/IMG_20260822_011134.png', alt: 'Deer', angle: 260, distance: 130, x: -4, y: -10, size: 72, multiplier: 5 },
    { id: 2, src: '/IMG_20260822_011103.png', alt: 'Zebra', angle: 0, distance: 130, x: -7.5, y: -19, size: 68, multiplier: 5 },
    { id: 3, src: '/IMG_20260822_011041.png', alt: 'Fox', angle: 45, distance: 130, x: -5, y: -18, size: 52, multiplier: 5 },
    { id: 4, src: '/IMG_20260822_011151.png', alt: 'Eagle', angle: 90, distance: 130, x: 0, y: -18, size: 61, multiplier: 10 },
    { id: 5, src: '/IMG_20260822_011205.png', alt: 'Bear', angle: 135, distance: 130, x: 5, y: -15, size: 60, multiplier: 15 },
    { id: 6, src: '/IMG_20260822_011218.png', alt: 'Tiger', angle: 180, distance: 130, x: 7, y: -8, size: 63, multiplier: 25 },
    { id: 7, src: '/IMG_20260822_011028.png', alt: 'Lion', angle: 225, distance: 130, x: 5, y: -5, size: 65, multiplier: 45 },
  ];

  // IndexedDB Storage with 5:00 AM Daily Reset
  const initIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WildPartyGameDB', 2);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('userState')) {
          db.createObjectStore('userState', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('roundHistory')) {
          db.createObjectStore('roundHistory', { keyPath: 'roundNo' });
        }
      };
      request.onsuccess = (e: any) => resolve(e.target.result);
      request.onerror = (e) => reject(e);
    });
  };

  const get5AMResetBoundary = () => {
    const now = new Date();
    const resetTime = new Date(now);
    if (now.getHours() < 5) {
      resetTime.setDate(now.getDate() - 1);
    }
    resetTime.setHours(5, 0, 0, 0);
    return resetTime.getTime();
  };

  const saveBalanceToDB = async (val: number) => {
    try {
      const db = await initIndexedDB();
      const tx = db.transaction('userState', 'readwrite');
      tx.objectStore('userState').put({ id: 'current_balance', value: val });
    } catch (err) {
      console.error('IndexedDB Save Balance Error:', err);
    }
  };

  const saveRoundToDB = async (record: RoundHistoryRecord) => {
    try {
      const db = await initIndexedDB();
      const tx = db.transaction('roundHistory', 'readwrite');
      tx.objectStore('roundHistory').put(record);
    } catch (err) {
      console.error('IndexedDB Save Round Error:', err);
    }
  };

  const loadDataFromDB = async () => {
    try {
      const db = await initIndexedDB();
      const resetBoundary = get5AMResetBoundary();

      // Load Balance
      const txUser = db.transaction('userState', 'readonly');
      const balReq = txUser.objectStore('userState').get('current_balance');
      balReq.onsuccess = () => {
        if (balReq.result && typeof balReq.result.value === 'number') {
          setBalance(balReq.result.value);
        } else {
          saveBalanceToDB(5000000);
        }
      };

      // Load History
      const txHistory = db.transaction('roundHistory', 'readwrite');
      const historyStore = txHistory.objectStore('roundHistory');
      const histReq = historyStore.getAll();
      histReq.onsuccess = () => {
        const records: RoundHistoryRecord[] = histReq.result || [];
        const validRecords = records.filter((r) => r.timestamp >= resetBoundary);

        records.forEach((r) => {
          if (r.timestamp < resetBoundary) {
            historyStore.delete(r.roundNo);
          }
        });

        validRecords.sort((a, b) => a.roundNo - b.roundNo);
        setRoundHistory(validRecords);
      };
    } catch (err) {
      console.error('IndexedDB Load Error:', err);
    }
  };

  useEffect(() => {
    loadDataFromDB();
  }, []);

  // Loading Progress Timer
  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setLoading(false);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [loading]);

  // House-Edge Probability Pool (80% 5x animals to ensure loss)
  const getWeightedWinnerIndex = () => {
    const weightedPool = [
      0, 0, 0, 0, // Deer (5x)
      1, 1, 1, 1, // Dog (5x)
      2, 2, 2, 2, // Zebra (5x)
      3, 3, 3, 3, // Fox (5x)
      4, 4,       // Eagle (10x)
      5,          // Bear (15x)
      6,          // Tiger (25x)
      7,          // Lion (45x)
    ];
    return weightedPool[Math.floor(Math.random() * weightedPool.length)];
  };

  // Synchronized Cycle Engine (48s total round: 30s Bet + 15s Spin + 3s Result)
  const targetWinnerRef = useRef<number>(0);

  useEffect(() => {
    if (loading) return;

    const roundDuration = 48;
    const resetBoundary = get5AMResetBoundary();

    const syncTick = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - resetBoundary) / 1000);
      const calculatedRoundNo = Math.floor(elapsedSeconds / roundDuration) + 1;
      const secondInCycle = elapsedSeconds % roundDuration;

      setCurrentRoundNo(calculatedRoundNo);

      if (secondInCycle === 0) {
        targetWinnerRef.current = getWeightedWinnerIndex();
      }

      if (secondInCycle < 30) {
        setGamePhase('betting');
        setCountdown(30 - secondInCycle);
        setWinnerAnimal(null);
      } else if (secondInCycle < 45) {
        setGamePhase('spinning');
        setCountdown(45 - secondInCycle);
      } else {
        setGamePhase('result');
        setCountdown(48 - secondInCycle);

        const winner = animals[targetWinnerRef.current];
        setWinnerAnimal(winner);
        setActiveHighlightIndex(targetWinnerRef.current);
      }
    };

    syncTick();
    const interval = setInterval(syncTick, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  // Spinning Animation Loop
  useEffect(() => {
    if (gamePhase !== 'spinning') {
      if (gamePhase === 'betting') {
        setActiveHighlightIndex(null);
      }
      return;
    }

    const spinInterval = setInterval(() => {
      setActiveHighlightIndex((prev) => (prev === null ? 0 : (prev + 1) % animals.length));
    }, 120);

    return () => clearInterval(spinInterval);
  }, [gamePhase]);

  // Record Winner & Payout
  const processedRoundsRef = useRef<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (gamePhase === 'result' && winnerAnimal && !processedRoundsRef.current[currentRoundNo]) {
      processedRoundsRef.current[currentRoundNo] = true;

      const record: RoundHistoryRecord = {
        roundNo: currentRoundNo,
        winnerAlt: winnerAnimal.alt,
        timestamp: Date.now(),
      };

      setRoundHistory((prev) => [...prev.slice(-49), record]);
      saveRoundToDB(record);

      const betOnWinner = bets[winnerAnimal.alt] || 0;
      if (betOnWinner > 0) {
        const winnings = betOnWinner * winnerAnimal.multiplier;
        setBalance((prevBal) => {
          const newBal = prevBal + winnings;
          saveBalanceToDB(newBal);
          return newBal;
        });
      }
    } else if (gamePhase === 'betting') {
      if (Object.keys(bets).length > 0) {
        setLastBets(bets);
        setBets({});
      }
    }
  }, [gamePhase, winnerAnimal, currentRoundNo]);

  // Bet Click Handler
  const handleAnimalBet = (animalAlt: string) => {
    if (gamePhase !== 'betting') return;
    if (balance < selectedChip.value) return;

    const newBalance = balance - selectedChip.value;
    setBalance(newBalance);
    saveBalanceToDB(newBalance);

    setBets((prev) => ({
      ...prev,
      [animalAlt]: (prev[animalAlt] || 0) + selectedChip.value,
    }));
  };

  // Repeat Bet Handler
  const handleRepeatBet = () => {
    if (gamePhase !== 'betting') return;
    const totalRepeatCost = Object.values(lastBets).reduce((acc, curr) => acc + curr, 0);
    if (totalRepeatCost === 0 || balance < totalRepeatCost) return;

    const newBalance = balance - totalRepeatCost;
    setBalance(newBalance);
    saveBalanceToDB(newBalance);

    setBets((prev) => {
      const updated = { ...prev };
      Object.entries(lastBets).forEach(([alt, val]) => {
        updated[alt] = (updated[alt] || 0) + val;
      });
      return updated;
    });
  };

  const formatBetAmount = (amt: number) => {
    if (amt >= 1000000) return `${(amt / 1000000).toFixed(1).replace('.0', '')}M`;
    if (amt >= 1000) return `${(amt / 1000).toFixed(0)}K`;
    return amt.toString();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center select-none overflow-hidden touch-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div
        className="relative bg-transparent w-full max-w-md rounded-none rounded-none shadow-2xl overflow-hidden"
        style={{ height: '65vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Image */}
        <img
          src="/1787337855180~2.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Bottom Decorative Image */}
        {!loading && (
          <img
            src="/IMG_20260822_011000.png"
            alt="Bottom decoration"
            className="absolute bottom-0 left-0 w-full h-auto object-contain rounded-md z-10 pointer-events-none"
          />
        )}

        {/* Top Header Bar & Icons */}
        {!loading && (
          <>
            {/* Top Left Icons (Sound & Help/Rules) */}
            <div className="absolute top-2 left-2 z-30 flex items-center gap-1">
              <button
                aria-label="Sound"
                className="w-6 h-6 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                  fill="currentColor"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </button>

              {/* ? Button: Opens 40vh Rules Sheet */}
              <button
                onClick={() => setShowRulesSheet(true)}
                aria-label="Help Rules"
                className="w-6 h-6 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150"
              >
                <span className="text-white font-extrabold text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  ?
                </span>
              </button>
            </div>

            {/* Top Middle Heading */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <span className="italic font-black text-lg tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] select-none">
                Wild Party
              </span>
            </div>

            {/* Top Right Action Buttons Bar */}
            <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
              {/* Menu Button: Opens 40vh History Sheet */}
              <button
                onClick={() => setShowHistorySheet(true)}
                aria-label="History Menu"
                className="w-6 h-6 rounded-md flex flex-col items-center justify-center gap-[2px] bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150"
              >
                <span className="w-4 h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                <span className="w-4 h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                <div className="flex items-center gap-1 w-4">
                  <span className="w-2.5 h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                  <span className="w-[3px] h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                </div>
              </button>

              <button
                aria-label="Minimize"
                className="w-6 h-6 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                  fill="currentColor"
                >
                  <path d="M6.34 8.5h11.32c.79 0 1.25.9 0.77 1.54l-5.66 7.55c-.38.51-1.16.51-1.54 0L5.57 10.04c-.48-.64-.02-1.54.77-1.54z" />
                </svg>
              </button>

              <button
                onClick={onClose}
                aria-label="Close"
                className="w-6 h-6 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Top Transparent Patti: Recent Winners */}
            <div className="absolute top-11 left-2 right-2 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-black/25 rounded-full border border-white/20 shadow-sm overflow-x-auto no-scrollbar pointer-events-none min-h-[25px]">
              {roundHistory.length === 0 ? (
                <span className="text-[10px] text-white/50 italic px-1 select-none">History</span>
              ) : (
                roundHistory.slice(-9).map((record, idx) => {
                  const matchedAnimal = animals.find((a) => a.alt === record.winnerAlt);
                  if (!matchedAnimal) return null;
                  return (
                    <div
                      key={`${record.roundNo}-${idx}`}
                      className="w-6 h-6 flex-shrink-0 flex items-center justify-center"
                    >
                      <GreenScreenImage src={matchedAnimal.src} className="w-full h-full object-contain" />
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <LoadingShaderImage
                src="/1787338085121.png"
                className="w-24 h-24 object-contain mb-6"
              />
              <div className="w-64 bg-white/30 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-50 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="relative w-80 h-80 flex items-center justify-center pointer-events-auto">
              {/* Center Green-Screen Wheel */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <GreenScreenImage
                  src="/1787344138649~2.jpg"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Center Timers & Text */}
              <div className="absolute z-30 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {gamePhase === 'betting' && (
                  <>
                    <span className="text-[#5c2e0b] font-black text-[10px] leading-tight tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] select-none">
                      Select your
                    </span>
                    <span className="text-[#5c2e0b] font-black text-[10px] leading-tight tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] select-none">
                      Animal
                    </span>
                    <span className="text-[#78350f] font-black text-2xl mt-0.5 tracking-wider drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                      {countdown}s
                    </span>
                  </>
                )}

                {gamePhase === 'spinning' && (
                  <>
                    <span className="text-[#5c2e0b] font-black text-xs leading-tight tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] select-none animate-pulse">
                      Spinning...
                    </span>
                    <span className="text-[#78350f] font-black text-2xl mt-0.5 tracking-wider drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                      {countdown}s
                    </span>
                  </>
                )}

                {gamePhase === 'result' && (
                  <>
                    <span className="text-[#5c2e0b] font-black text-xs leading-tight tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] select-none">
                      Winner!
                    </span>
                    <span className="text-yellow-600 font-black text-lg mt-0.5 tracking-wide drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                      {winnerAnimal?.alt} ({winnerAnimal?.multiplier}x)
                    </span>
                  </>
                )}
              </div>

              {/* Exact Fixed Position Animals with Betting Click */}
              {animals.map((animal, index) => {
                const animalSize = animal.size || 64;
                const halfSize = animalSize / 2;

                const isSpinning = gamePhase === 'spinning';
                const isCurrentHighlighted = activeHighlightIndex === index;
                const isWinner = gamePhase === 'result' && winnerAnimal?.alt === animal.alt;

                const isColorless = isSpinning ? !isCurrentHighlighted : false;
                const isGoldenShining = (isSpinning && isCurrentHighlighted) || isWinner;

                const currentBet = bets[animal.alt] || 0;

                return (
                  <div
                    key={animal.src}
                    onClick={() => handleAnimalBet(animal.alt)}
                    className="absolute cursor-pointer select-none"
                    style={{
                      width: `${animalSize}px`,
                      height: `${animalSize}px`,
                      left: '50%',
                      top: '50%',
                      marginLeft: `${-halfSize + (animal.x || 0)}px`,
                      marginTop: `${-halfSize + (animal.y || 0)}px`,
                      transform: `rotate(${animal.angle}deg) translate(${animal.distance}px) rotate(-${animal.angle}deg)`,
                    }}
                  >
                    {/* Animal Image */}
                    <div
                      className={`w-full h-full overflow-hidden transition-[filter] duration-100 ${
                        isColorless ? 'grayscale' : 'grayscale-0'
                      } ${isGoldenShining ? 'drop-shadow-[0_0_15px_rgba(255,215,0,0.95)]' : ''}`}
                    >
                      <GreenScreenImage
                        src={animal.src}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Skin Color Thin Betting Amount Bar */}
                    {currentBet > 0 && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 px-1.5 py-[0.5px] rounded-full bg-[#f6d7b0] border border-[#d49c6b] shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none min-w-[28px]">
                        <span className="text-[#65330e] font-black text-[9px] leading-none tracking-tight">
                          {formatBetAmount(currentBet)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Left: Live Golden Balance */}
        {!loading && (
          <div className="absolute bottom-2.5 left-2.5 z-30 flex items-center gap-1.5 pointer-events-auto select-none">
            <LoadingShaderImage
              src="/1786855398290.png"
              className="w-7 h-7 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            />
            <span className="text-yellow-400 font-black text-xs sm:text-sm tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {balance.toLocaleString()}
            </span>
          </div>
        )}

        {/* Bottom Right: Repeat & Chips */}
        {!loading && (
          <div className="absolute bottom-2.5 right-2.5 z-30 flex items-center gap-1.5 pointer-events-auto">
            {/* Repeat Button */}
            <button
              onClick={handleRepeatBet}
              aria-label="Repeat Bet"
              className="h-5 px-1 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150"
            >
              <span className="text-white font-extrabold text-[11px] tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                Repeat
              </span>
            </button>

            {/* Chips Container */}
            <div className="flex items-center gap-1">
              {chips.map((chip) => {
                const isSelected = selectedChip.label === chip.label;
                return (
                  <button
                    key={chip.label}
                    onClick={() => setSelectedChip(chip)}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 outline-none ${
                      isSelected
                        ? '-translate-y-2 rotate-6 scale-105 ring-2 ring-yellow-400 drop-shadow-[0_4px_8px_rgba(250,204,21,0.8)]'
                        : 'hover:scale-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]'
                    }`}
                  >
                    <GreenScreenImage
                      src={chip.src}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 40vh Black Bottom History Sheet */}
        {showHistorySheet && (
          <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-white/20 rounded-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* History Header */}
            <div className="relative flex items-center justify-center px-4 py-3 border-b border-white/10">
              <button
                onClick={() => setShowHistorySheet(false)}
                aria-label="Back"
                className="absolute left-4 p-1.5 rounded-full bg-white/10 active:scale-90 transition-transform"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <h2 className="text-white font-black text-base tracking-wide">History</h2>
            </div>

            {/* 1st Row: Round + Animals Header */}
            <div className="grid grid-cols-9 items-center gap-1 px-3 py-2 bg-white/5 border-b border-white/10">
              <span className="text-[10px] font-black text-yellow-400 text-center uppercase tracking-tighter">
                Round
              </span>
              {animals.map((animal) => (
                <div key={animal.src} className="w-6 h-6 mx-auto flex items-center justify-center">
                  <GreenScreenImage src={animal.src} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>

            {/* Round History Rows */}
            <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 divide-y divide-white/5 no-scrollbar">
              {roundHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-white/40 italic">
                  No rounds recorded yet today
                </div>
              ) : (
                [...roundHistory].reverse().map((record) => (
                  <div key={record.roundNo} className="grid grid-cols-9 items-center gap-1 py-1.5">
                    <span className="text-[10px] font-bold text-white/70 text-center">
                      #{record.roundNo}
                    </span>
                    {animals.map((animal) => {
                      const isWinner = record.winnerAlt === animal.alt;
                      return (
                        <div key={animal.alt} className="flex items-center justify-center">
                          {isWinner ? (
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shadow-[0_0_6px_rgba(16,185,129,0.5)]">
                              ✓
                            </span>
                          ) : (
                            <span className="text-rose-500/40 font-bold text-[11px]">✕</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 40vh Black Bottom Rules Sheet */}
        {showRulesSheet && (
          <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-white/20 rounded-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Rules Header */}
            <div className="relative flex items-center justify-center px-4 py-3 border-b border-white/10">
              <button
                onClick={() => setShowRulesSheet(false)}
                aria-label="Back"
                className="absolute left-4 p-1.5 rounded-full bg-white/10 active:scale-90 transition-transform"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <h2 className="text-white font-black text-base tracking-wide">Rules</h2>
            </div>

            {/* Rules Bullet List Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 text-white/90 no-scrollbar">
              <div className="flex items-start gap-2.5">
                <span className="text-yellow-400 text-lg leading-none mt-0.5">•</span>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  Select you Chip and Choose the animals
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-yellow-400 text-lg leading-none mt-0.5">•</span>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  If Lion win you will receive 45 time × your Bet
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-yellow-400 text-lg leading-none mt-0.5">•</span>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  For placing bet click on the Animals
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-yellow-400 text-lg leading-none mt-0.5">•</span>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  All 5 time gives your 5 × your bet
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-yellow-400 text-lg leading-none mt-0.5">•</span>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  45, 25, 15, 10 TIME gives you × your bet
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

