'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WildpartyProps {
  onClose: () => void;
}

// Green screen remover for animal PNGs
function GreenScreenImage({ src, className }: { src: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
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

        // Green Screen Chroma Key
        const isGreen = g > 75 && g > r * 1.15 && g > b * 1.15;
        if (isGreen) {
          data[i + 3] = 0;
        } else if (g > Math.max(r, b)) {
          data[i + 1] = Math.max(r, b); // Despill
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

  const animals = [
    { src: '/IMG_20260822_011118.png', alt: 'Dog' },
    { src: '/IMG_20260822_011103.png', alt: 'Zebra' },
    { src: '/IMG_20260822_011134.png', alt: 'Deer' },
    { src: '/IMG_20260822_011041.png', alt: 'Fox' },
    { src: '/IMG_20260822_011151.png', alt: 'Eagle' },
    { src: '/IMG_20260822_011205.png', alt: 'Bear' },
    { src: '/IMG_20260822_011218.png', alt: 'Tiger' },
    { src: '/IMG_20260822_011028.png', alt: 'Lion' },
  ];

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

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          {loading ? (
            <>
              <img
                src="/1787338085121.png"
                alt="Loading icon"
                className="w-24 h-24 object-contain mb-6 mix-blend-multiply"
              />
              <div className="w-3/4 max-w-xs bg-white/30 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-50 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Center Image - White Background Hatane Ke Liye mix-blend-multiply */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  src="/1787337798141~2.jpg"
                  alt="Center Wheel"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Animal circles arranged around center */}
              {animals.map((animal, index) => {
                const angle = index * 45;
                return (
                  <div
                    key={animal.src}
                    className="absolute overflow-hidden pointer-events-none"
                    style={{
                      width: '64px',
                      height: '64px',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-32px',
                      marginTop: '-32px',
                      transform: `rotate(${angle}deg) translate(130px) rotate(-${angle}deg)`,
                    }}
                  >
                    <GreenScreenImage
                      src={animal.src}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 bg-white/70 rounded-full hover:bg-white transition-colors z-30"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-gray-800 stroke-[2.5]">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

