'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FruitpartyProps {
  onClose: () => void;
}

// -------------------------------------------------------------
// Fruit Positions & Sizes (Adjustable X, Y, W, H % to scale square size)
// Layout:
// [1] [2] [3]
// [8] [T] [4]
// [7] [6] [5]
// -------------------------------------------------------------
const FRUITS_CONFIG = [
  { id: 1, img: '/IMG-20260823-WA0003.jpg', x: 0,      y: 0,      w: 33.333, h: 33.333 }, // Mango
  { id: 2, img: '/IMG-20260823-WA0004.jpg', x: 33.333, y: 0,      w: 33.333, h: 33.333 }, // Banana
  { id: 3, img: '/IMG-20260823-WA0005.jpg', x: 66.666, y: 0,      w: 33.333, h: 33.333 }, // Watermelon
  { id: 4, img: '/IMG-20260823-WA0006.jpg', x: 66.666, y: 33.333, w: 33.333, h: 33.333 }, // Kiwi
  { id: 5, img: '/IMG-20260823-WA0007.jpg', x: 66.666, y: 66.666, w: 33.333, h: 33.333 }, // Grapes
  { id: 6, img: '/IMG-20260823-WA0008.jpg', x: 33.333, y: 66.666, w: 33.333, h: 33.333 }, // Apple
  { id: 7, img: '/IMG-20260823-WA0009.jpg', x: 0,      y: 66.666, w: 33.333, h: 33.333 }, // Strawberry
  { id: 8, img: '/IMG-20260822-WA0124.jpg', x: 0,      y: 33.333, w: 33.333, h: 33.333 }, // Cherry
];

// WebGL Shader for real-time solid white keying / removal
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

  // Loading progression
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

      {/* 60vh Bottom Sheet */}
      <div
        className="relative bg-[#330c36] w-full max-w-md shadow-2xl overflow-hidden animate-slide-up flex flex-col rounded-none"
        style={{ height: '60vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition-colors backdrop-blur-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2.5]">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {loading ? (
          /* ---------- Loading State with WebGL Shader Texture ---------- */
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
          /* ---------- Game Screen: Reduced Square Box Size ---------- */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Full 60vh Background Image */}
            <img
              src="/1787413631876~2.jpg"
              alt="Fruit Party Background"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />

            {/* Reduced Compact Square Container (72% width / max 260px) */}
            <div className="relative z-10 w-[72%] max-w-[260px] aspect-square">
              {/* 8 Fruits */}
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
                    className="w-full h-full object-cover rounded-xl block"
                  />
                </div>
              ))}

              {/* Exact Center: Pure Countdown */}
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

