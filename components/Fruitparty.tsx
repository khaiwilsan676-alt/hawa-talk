'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FruitpartyProps {
  onClose: () => void;
}

// -------------------------------------------------------------
// Fruit Positions & Sizes (Strict 3x3 Grid, Zero-Gap Alignment)
// Layout:
// [1] [2] [3]
// [8] [T] [4]  <-- T = Countdown Timer
// [7] [6] [5]
// -------------------------------------------------------------
const FRUITS_CONFIG = [
  { id: 1, img: '/IMG_20260907_154053.png', x: 0,      y: 0,      w: 33.333, h: 33.333 }, // Lemon 5x
  { id: 2, img: '/IMG_20260907_154205.png', x: 33.333, y: 0,      w: 33.333, h: 33.333 }, // Guava 5x
  { id: 3, img: '/IMG_20260907_154232.png', x: 66.666, y: 0,      w: 36, h: 36 }, // Mango 5x
  { id: 4, img: '/IMG_20260907_154250.png', x: 66.666, y: 33.333, w: 35.5, h: 35.5 }, // Orange 5x
  { id: 5, img: '/IMG_20260907_154323.png', x: 66.666, y: 66.666, w: 33.333, h: 33.333 }, // Grapesh 10x
  { id: 6, img: '/IMG_20260907_154348.png', x: 33.333, y: 66.666, w: 33.333, h: 33.333 }, // Strawberry 15x
  { id: 7, img: '/IMG_20260907_154417.png', x: 0,      y: 66.666, w: 33.333, h: 33.333 }, // Apple 25x
  { id: 8, img: '/IMG_20260907_154449.png', x: 0,      y: 33.333, w: 33.333, h: 33.333 }, // Cherry 45x
];

// WebGL Shader for real-time solid white background removal
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
  const [countdown, setCountdown] = useState(30);

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

  // 30s Countdown timer loop
  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 70vh Bottom Sheet */}
      <div
        className="relative bg-[#330c36] w-full max-w-md shadow-2xl overflow-hidden animate-slide-up flex flex-col rounded-none"
        style={{ height: '65vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {!loading && (
          <>
            {/* TOP LEFT BUTTONS: Speaker and Question Mark */}
            <div className="absolute top-[6.5px] left-7 z-30 flex items-center gap-0.5">
              {/* Speaker Button */}
              <button className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-[#4a2810] stroke-[#4a2810] stroke-[1.5]">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
              
              {/* Question Mark Button */}
              <button className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <span className="text-[#4a2810] font-black text-[18px] leading-none font-serif">
                  ?
                </span>
              </button>
            </div>

            {/* TOP RIGHT BUTTONS: Arrow Down, Clock, Cross -> FIX: Capital 'R' removed, now uses lowercase 'right-8' */}
            <div className="absolute top-[6.5px] right-7 z-30 flex items-center gap-0.5">
              {/* Arrow Down Button */}
              <button className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-[#4a2810] stroke-[4]" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Clock Button */}
              <button className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-[#4a2810]">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12.5 7V12.25L17 14.92L16.25 16.15L11 13V7H12.5Z" />
                </svg>
              </button>

              {/* Cross Button (Close) */}
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full border-[2px] border-[#4a2810] bg-transparent flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all p-0.5"
              >
                <svg viewBox="0 0 24 24" className="w-full h-full fill-[#4a2810] stroke-[#4a2810] stroke-[1.5]">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </>
        )}

        {loading ? (
          /* ---------- Loading State with WebGL Shader ---------- */
          <div className="w-full h-full bg-gradient-to-b from-[#4A154B] via-[#330c36] to-[#1e0520] flex flex-col items-center justify-center px-6">
            <div className="w-32 h-32 flex items-center justify-center mb-6">
              <WebGLShaderImage src="/IMG_20260824_232321.png" />
            </div>

            <div className="w-48 bg-black/40 rounded-full h-3 p-0.5 border border-yellow-300/40 shadow-inner">
              <div
                className="bg-gradient-to-r from-yellow-400 to-amber-300 h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-yellow-300 text-xs font-semibold mt-2 tracking-wider">
              LOADING {progress}%
            </span>
          </div>
        ) : (
          /* ---------- Game Screen: 70vh Background + Game Elements ---------- */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Full 70vh Background Image */}
            <img
              src="/1787413631876~2.jpg"
              alt="Fruit Party Background"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />

            {/* Main Wrapping Container */}
            <div className="relative z-10 w-full flex flex-col items-center -mt-27">
              
              {/* PARTICULAR SIZE ADDED HERE: w-[240px] h-[240px] (Aap chaho toh in dono numbers ko change kar sakte ho) */}
              <div className="relative w-[240px] h-[240px]">
                {/* 8 Fruit Images with 0.5px tight padding */}
                {FRUITS_CONFIG.map((fruit) => (
                  <div
                    key={fruit.id}
                    style={{
                      position: 'absolute',
                      left: `${fruit.x}%`,
                      top: `${fruit.y}%`,
                      width: `${fruit.w}%`,
                      height: `${fruit.h}%`,
                      padding: '0.5px',
                    }}
                  >
                    <img
                      src={fruit.img}
                      alt="Fruit"
                      className="w-full h-full object-contain rounded-none block"
                    />
                  </div>
                ))}

                {/* Center 30s Countdown */}
                <div
                  style={{
                    position: 'absolute',
                    left: '33.333%',
                    top: '33.333%',
                    width: '33.333%',
                    height: '33.333%',
                  }}
                  className="flex items-center justify-center pointer-events-none"
                >
                  <span className="text-amber-400 font-extrabold text-2xl tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                    {countdown}s
                  </span>
                </div>
              </div>

              {/* Space 3vh and 2 New Images (Same row, gap 1) */}
              <div className="flex flex-row justify-center items-center gap-1 mt-[1vh]">
                <img 
                  src="/IMG_20260907_154135.png" 
                  alt="Option 1" 
                  className="w-18 h-auto object-contain" 
                />
                <img 
                  src="/IMG_20260907_154118.png" 
                  alt="Option 2" 
                  className="w-18 h-auto object-contain" 
                />
              </div>

            </div>

            {/* Bottom Left Compact Button Group */}
            <div className="absolute bottom-[15vh] left-3 z-30 w-[55px] h-[70px]">
              
              {/* Red Button (Upar) - top-[10px] kiya hai taaki niche khisak jaye */}
              <img 
                src="/file_00000000d9b08211b0304c61b802348b.png" 
                alt="Red Button" 
                className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[45px] h-auto object-contain z-10" 
              />
              
              {/* Border (Niche) */}
              <img 
                src="/file_000000003d24821182882f8ca412d2b6.png" 
                alt="Border" 
                className="absolute top-[28px] left-1/2 -translate-x-1/2 w-[55px] h-auto object-contain z-0" 
              />
              
            </div>

          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
