"use client";

import React, { useState, useEffect, useRef } from "react";
import { Smile } from "lucide-react";

// --- INLINE WEBSHADER COMPONENT (WHITE & BLACK REMOVAL + NO STUCK FIX) ---
interface ShaderProps {
  imageSrc: string;
  threshold?: number;
  removeColor?: "white" | "black" | "both";
  className?: string;
  style?: React.CSSProperties;
}

function WhiteColorRemovalShader({
  imageSrc,
  threshold = 0.85,
  removeColor = "both",
  className = "",
  style = {},
}: ShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) return;

    // Vertex Shader
    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    // Fragment Shader - Removes White & Black boxes
    const fsSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      uniform float u_threshold;
      uniform int u_mode; // 0: White, 1: Black, 2: Both

      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        
        // Pure/Near White check
        bool isWhite = (color.r > u_threshold && color.g > u_threshold && color.b > u_threshold);
        
        // Pure/Near Black box check
        float blackThreshold = 1.0 - u_threshold;
        bool isBlack = (color.r < blackThreshold && color.g < blackThreshold && color.b < blackThreshold);

        if (u_mode == 0 && isWhite) {
          discard;
        } else if (u_mode == 1 && isBlack) {
          discard;
        } else if (u_mode == 2 && (isWhite || isBlack)) {
          discard;
        } else {
          gl_FragColor = color;
        }
      }
    `;

    const createShader = (glContext: WebGLRenderingContext, type: number, source: string) => {
      const shader = glContext.createShader(type);
      if (!shader) return null;
      glContext.shaderSource(shader, source);
      glContext.compileShader(shader);
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

    // Buffers setup
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,
      ]),
      gl.STATIC_DRAW
    );

    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    let modeValue = 2;
    if (removeColor === "white") modeValue = 0;
    if (removeColor === "black") modeValue = 1;

    const thresholdLoc = gl.getUniformLocation(program, "u_threshold");
    const modeLoc = gl.getUniformLocation(program, "u_mode");
    gl.uniform1f(thresholdLoc, threshold);
    gl.uniform1i(modeLoc, modeValue);

    // Load Image onto Canvas safely without freezing
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    let isMounted = true;
    image.onload = () => {
      if (!isMounted || !canvas) return;
      canvas.width = image.width || 512;
      canvas.height = image.height || 512;
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

    return () => {
      isMounted = false;
    };
  }, [imageSrc, threshold, removeColor]);

  return <canvas ref={canvasRef} className={className} style={style} />;
}

// --- MAIN EMOJI PICKER COMPONENT ---
export default function EmojiPicker({
  onClose,
  onSelectEmoji,
}: {
  onClose: () => void;
  onSelectEmoji: (e: any) => void;
}) {
  const [selectedGif, setSelectedGif] = useState("");

  // PNG stickers data - Restricted only to this picker
  const gifStickers = [
    { id: "laugh", name: "Laugh", src: "/512.png", removeColor: "both" },
    { id: "sad", name: "Sad", src: "/512 (6).png", removeColor: "both" },
    { id: "love", name: "Love", src: "/512 (3).png", removeColor: "both" },
    { id: "thinking", name: "Thinking", src: "/512 (2).png", removeColor: "both" },
    { id: "party", name: "Party", src: "/512 (16).png", removeColor: "both" },
    { id: "loving", name: "Loving", src: "/512 (15).png", removeColor: "both" },
    { id: "smart", name: "Smart", src: "/512 (13).png", removeColor: "both" },
    { id: "irritating", name: "Irritating", src: "/512 (12).png", removeColor: "both" },
    { id: "rolling", name: "Rolling", src: "/512 (10).png", removeColor: "both" },
    { id: "unamused", name: "Unamused", src: "/512 (11).png", removeColor: "both" },
    { id: "pleading", name: "Pleading", src: "/512 (4).png", removeColor: "both" },
    { id: "hug", name: "Hug", src: "/512 (8).png", removeColor: "both" },
    { id: "kiss", name: "Kiss-R", src: "/512 (14).png", removeColor: "both" },
  ];

  const handleGifClick = (gif: any) => {
    setSelectedGif(gif.name);
    if (onSelectEmoji) {
      onSelectEmoji(gif);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
      {/* 40vh Black Sheet Container */}
      <div className="h-[40vh] w-full bg-black text-white flex flex-col justify-between rounded-t-3xl border-t border-white/10 shadow-2xl px-4 pt-3 pb-3">
        
        {/* TOP HEADING */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base font-bold tracking-wide text-white">Stickers</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-md bg-white/5 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* PNG STICKERS GRID - 4 per row */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-none">
          <div className="grid grid-cols-4 gap-2 place-items-center">
            {gifStickers.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleGifClick(gif)}
                className={`w-full aspect-square rounded-xl transition-all active:scale-90 flex items-center justify-center overflow-hidden border ${
                  selectedGif === gif.name
                    ? "bg-blue-600/30 border-blue-500 scale-105"
                    : "hover:bg-white/10 border-transparent"
                }`}
              >
                <WhiteColorRemovalShader
                  imageSrc={gif.src}
                  threshold={0.88}
                  removeColor={gif.removeColor as any}
                  className="w-full h-full"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    maxWidth: "none",
                    maxHeight: "none",
                    pointerEvents: "none",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

