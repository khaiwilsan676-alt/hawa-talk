'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WildpartyProps {
  onClose: () => void;
}

// 1. WebGL Shader: Loading Page ki Image se White Background hatane ke liye
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

// 2. Green Screen Remover for Animals & Center Wheel
function GreenScreenImage({ src, className, grayscale = false }: { src: string; className?: string; grayscale?: boolean }) {
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

        // Green Screen Chroma Key Logic
        const isGreen = g > 65 && g > r * 1.15 && g > b * 1.15;
        if (isGreen) {
          data[i + 3] = 0;
        } else if (g > Math.max(r, b)) {
          data[i + 1] = Math.max(r, b); // Clean green edge spill
        }

        // Apply grayscale if needed
        if (grayscale && data[i + 3] > 0) {
          const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
  }, [src, grayscale]);

  return <canvas ref={canvasRef} className={`${className || ''} block bg-transparent`} />;
}

export default function Wildparty({ onClose }: WildpartyProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCountdown, setSpinCountdown] = useState(15);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState(false);

  const animals = [
    { src: '/IMG_20260822_011134.png', alt: 'Deer', angle: 270, distance: 130, x: 0, y: -17, size: 72 },
    { src: '/IMG_20260822_011118.png', alt: 'Dog', angle: 315, distance: 130, x: -4, y: -10, size: 55 },
    { src: '/IMG_20260822_011103.png', alt: 'Zebra', angle: 0, distance: 130, x: -6, y: -19, size: 68 },
    { src: '/IMG_20260822_011041.png', alt: 'Fox', angle: 45, distance: 130, x: -5, y: -18, size: 52 },
    { src: '/IMG_20260822_011151.png', alt: 'Eagle', angle: 90, distance: 130, x: 0, y: -18, size: 61 },
    { src: '/IMG_20260822_011205.png', alt: 'Bear', angle: 135, distance: 130, x: 5, y: -15, size: 60 },
    { src: '/IMG_20260822_011218.png', alt: 'Tiger', angle: 180, distance: 130, x: 7, y: -8, size: 63 },
    { src: '/IMG_20260822_011028.png', alt: 'Lion', angle: 225, distance: 130, x: 5, y: -5, size: 65 },
  ];

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

  // 30s Selection Countdown Timer
  useEffect(() => {
    if (loading) return;
    if (isSpinning) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-select first animal if none selected
          if (!selectedAnimal) {
            setSelectedAnimal(animals[0].src);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isSpinning, selectedAnimal]);

  // Start spinning when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && !isSpinning && !showWinner) {
      startSpin();
    }
  }, [countdown, isSpinning, showWinner]);

  const startSpin = () => {
    setIsSpinning(true);
    setSpinCountdown(15);
    setWinner(null);
    setShowWinner(false);
    
    // Start spinning animation
    const spinInterval = setInterval(() => {
      setRotation(prev => prev + 20); // Medium speed rotation
    }, 100);
    
    // Store interval for cleanup
    (window as any).spinInterval = spinInterval;
  };

  // Spin countdown timer
  useEffect(() => {
    if (!isSpinning) return;
    
    const timer = setInterval(() => {
      setSpinCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stopSpin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isSpinning]);

  const stopSpin = () => {
    setIsSpinning(false);
    
    // Clear spin interval
    if ((window as any).spinInterval) {
      clearInterval((window as any).spinInterval);
      (window as any).spinInterval = null;
    }
    
    // Determine winner based on rotation
    const winningIndex = Math.floor(Math.random() * animals.length);
    const winningAnimal = animals[winningIndex];
    setWinner(winningAnimal.src);
    setShowWinner(true);
    
    // Reset rotation to align with winner
    setRotation(winningAnimal.angle);
    
    // Reset for next round after 5 seconds
    setTimeout(() => {
      setShowWinner(false);
      setWinner(null);
      setSelectedAnimal(null);
      setCountdown(30);
      setIsSpinning(false);
    }, 5000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Bottom Sheet */}
      <div
        className="relative bg-transparent w-full max-w-md rounded-t-3xl rounded-b-3xl shadow-2xl overflow-hidden"
        style={{ height: '70vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background image */}
        <img
          src="/1787337855180~2.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Bottom decorative image */}
        {!loading && (
          <img
            src="/IMG_20260822_011000.png"
            alt="Bottom decoration"
            className="absolute bottom-0 left-0 w-full h-auto object-contain rounded-b-3xl z-10 pointer-events-none"
          />
        )}

        {/* Top Header Bar & Icons */}
        {!loading && (
          <>
            {/* Top Left Icons */}
            <div className="absolute top-3.5 left-3.5 z-30 flex items-center gap-2">
              <button className="w-6 h-6 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </button>
              <button className="w-6 h-6 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150">
                <span className="text-white font-extrabold text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">?</span>
              </button>
            </div>

            {/* Top Middle Heading */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <span className="italic font-black text-lg tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] select-none">
                Wild Party
              </span>
            </div>

            {/* Top Right Action Buttons */}
            <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-2">
              <button className="w-6 h-6 rounded-xl flex flex-col items-center justify-center gap-[3px] bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150">
                <span className="w-3 h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                <span className="w-3 h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                <div className="flex items-center gap-1 w-4">
                  <span className="w-2.5 h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                  <span className="w-[3px] h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                </div>
              </button>
              <button className="w-6 h-6 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" fill="currentColor">
                  <path d="M6.34 8.5h11.32c.79 0 1.25.9 0.77 1.54l-5.66 7.55c-.38.51-1.16.51-1.54 0L5.57 10.04c-.48-.64-.02-1.54.77-1.54z" />
                </svg>
              </button>
              <button onClick={onClose} className="w-6 h-6 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-150">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Animals Strip - Transparent Patti with all animals */}
            <div className="absolute top-10 left-0 right-0 z-20 bg-gradient-to-b from-black/30 to-transparent backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 py-2 px-3 overflow-x-auto">
                {animals.map((animal, index) => (
                  <button
                    key={index}
                    onClick={() => !isSpinning && setSelectedAnimal(animal.src)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-200 ${
                      selectedAnimal === animal.src
                        ? 'border-yellow-400 bg-yellow-100/50 scale-110 shadow-lg'
                        : 'border-white/40 bg-white/20 hover:scale-105'
                    }`}
                  >
                    <GreenScreenImage
                      src={animal.src}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          {loading ? (
            <>
              <LoadingShaderImage
                src="/1787338085121.png"
                className="w-24 h-24 object-contain mb-6"
              />
              <div className="w-3/4 max-w-xs bg-white/30 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-50 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <div className="relative w-72 h-72 flex items-center justify-center mt-8">
              {/* Center Green-Screen Wheel Image with Spinning */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-100"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <GreenScreenImage
                  src="/1787344138649~2.jpg"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Center Info */}
              {!isSpinning && !showWinner && (
                <div className="absolute z-30 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                  <span className="text-[#5c2e0b] font-black text-xs sm:text-sm leading-tight tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] select-none">
                    Select your
                  </span>
                  <span className="text-[#5c2e0b] font-black text-xs sm:text-sm leading-tight tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] select-none">
                    Animal
                  </span>
                  <span className="text-[#78350f] font-black text-xl mt-0.5 tracking-wider drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                    {countdown}s
                  </span>
                </div>
              )}

              {/* Spin Countdown */}
              {isSpinning && (
                <div className="absolute z-30 flex items-center justify-center pointer-events-none">
                  <span className="text-white font-black text-2xl tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] bg-black/30 rounded-full px-4 py-2">
                    {spinCountdown}s
                  </span>
                </div>
              )}

              {/* Winner Display */}
              {showWinner && winner && (
                <div className="absolute z-30 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-white font-black text-sm tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Winner!
                  </span>
                </div>
              )}

              {/* Animal Circles with grayscale when spinning */}
              {animals.map((animal) => {
                const animalSize = animal.size || 64;
                const halfSize = animalSize / 2;
                const isWinner = winner === animal.src;
                const shouldGrayscale = isSpinning && !isWinner;
                
                return (
                  <div
                    key={animal.src}
                    className={`absolute overflow-hidden pointer-events-none transition-all duration-300 ${
                      isWinner ? 'scale-125 z-40' : ''
                    }`}
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
                    <GreenScreenImage
                      src={animal.src}
                      className="w-full h-full object-cover"
                      grayscale={shouldGrayscale}
                    />
                  </div>
                );
              })}

              {/* Winner Image Display in Top Strip */}
              {showWinner && winner && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-yellow-400 bg-white shadow-2xl animate-bounce">
                    <GreenScreenImage
                      src={winner}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
    }
