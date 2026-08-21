'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WildpartyProps {
  onClose: () => void;
}

// Custom WebGL Shader Component
function ShaderTransparentImage({
  src,
  className,
  removeColor = 'white',
}: {
  src: string;
  className?: string;
  removeColor?: 'white' | 'green';
}) {
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

    const fsSource =
      removeColor === 'green'
        ? `
          precision mediump float;
          varying vec2 v_texCoord;
          uniform sampler2D u_image;
          vec3 rgb2hsv(vec3 c) {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
          }
          void main() {
            vec4 color = texture2D(u_image, v_texCoord);
            if (color.a < 0.1) {
              discard;
            }
            vec3 hsv = rgb2hsv(color.rgb);
            bool isHueGreen = (hsv.x >= 0.18 && hsv.x <= 0.46);
            bool isHighGreen = (color.g > 0.35 && color.g > (color.r * 1.1) && color.g > (color.b * 1.1));
            if ((isHueGreen && hsv.y > 0.25 && hsv.z > 0.15) || isHighGreen) {
              discard;
            } else {
              float maxRB = max(color.r, color.b);
              if (color.g > maxRB) color.g = maxRB;
              gl_FragColor = color;
            }
          }
        `
        : `
          precision mediump float;
          varying vec2 v_texCoord;
          uniform sampler2D u_image;
          void main() {
            vec4 color = texture2D(u_image, v_texCoord);
            if (color.a < 0.1) {
              discard;
            }
            // Strict white removal (only pure/near white pixels discarded)
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
  }, [src, removeColor]);

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

      {/* Bottom sheet */}
      <div
        className="relative bg-transparent w-full max-w-md rounded-t-3xl rounded-b-3xl shadow-2xl overflow-hidden"
        style={{ height: '70vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background image covering the sheet */}
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
              <ShaderTransparentImage
                src="/1787338085121.png"
                className="w-24 h-24 object-contain mb-6"
                removeColor="white"
              />
              <div className="w-3/4 max-w-xs bg-white/30 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-50 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Main Center Image */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <ShaderTransparentImage
                  src="/1787339290785.png"
                  className="w-full h-full object-contain"
                  removeColor="white"
                />
              </div>

              {/* Animal circles in ring */}
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
                    <ShaderTransparentImage
                      src={animal.src}
                      className="w-full h-full object-cover"
                      removeColor="green"
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

