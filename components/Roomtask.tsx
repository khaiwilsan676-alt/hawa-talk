'use client';

import React, { useEffect, useState } from 'react';

interface RoomtaskProps {
  onBack?: () => void;
}

// Custom Hook jo WebGL Shader se image ka white background ek baar mein strictly remove karke clean URL dega
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

// Helper component for task items (Title aur Icon image ke upar rakhe hain)
function TaskItem({ 
  title, 
  reward,
  iconSrc
}: { 
  title: string; 
  reward: string;
  iconSrc: string;
}) {
  return (
    <div className="relative z-10 w-[100%] max-w-[310px] h-[130px] flex items-center">
      {/* Background Task Image */}
      <img 
        src="/file_000000004fd0821198ed4e26d5008b16.png"
        alt="Task Background"
        className="absolute inset-0 w-full h-full object-fill cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none z-0"
        draggable={false}
      />

      {/* Image ke upar Left Side: Shader Processed Icon & Text */}
      <div className="relative z-20 w-full px-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2.5 pr-2">
          <img 
            src={iconSrc} 
            alt="Task Icon" 
            className="w-7 h-7 object-contain flex-shrink-0 drop-shadow-md select-none"
            draggable={false}
          />
          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-bold text-white leading-tight drop-shadow-md line-clamp-2">
              {title}
            </span>
            <span className="text-[10px] font-extrabold text-[#ffd700] drop-shadow-md mt-0.5">
              {reward}
            </span>
          </div>
        </div>

        {/* Right Side Corner: Yellow Color 3D Claim Button */}
        <div className="flex-shrink-0 pointer-events-auto">
          <button 
            onClick={() => {}}
            className="px-3.5 py-1.5 rounded-full font-black text-[11px] text-[#5a2c00] bg-gradient-to-b from-[#ffe853] via-[#ffc107] to-[#e09b00] shadow-[0_4px_0_#9c6500,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-[2px] active:shadow-[0_2px_0_#9c6500,0_4px_6px_rgba(0,0,0,0.4)] transition-all cursor-pointer uppercase tracking-wider"
          >
            Claim
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Roomtask({ onBack }: RoomtaskProps) {
  const cleanedIconSrc = useProcessedShaderImage('/1786855398290.png');

  const tasks = [
    { title: "10 people enter the room", reward: "10,000 coin" },
    { title: "5 people enter the room for two consecutive days", reward: "120,000 coin" },
    { title: "Successfully share to Facebook", reward: "24,000 coin" },
    { title: "3 new users enter the room", reward: "40,000 coin" },
    { title: "1 new follower of the room", reward: "4,000 coin" },
    { title: "3 new users follow the room", reward: "40,000 coin" },
    { title: "Successfully share to WhatsApp", reward: "24,000 coin" },
    { title: "Room host is on mice for 10 minutes", reward: "4,000 coin" },
    { title: "Give people 5 gifts in the room", reward: "40,000 coin" },
    { title: "10 new followers of the room", reward: "100,000 coin" },
    { title: "5 new followers of the room", reward: "24,000 coin" },
    { title: "3 new users are on mice simultaneously for 5 minutes", reward: "100,000 coin" },
    { title: "Room host is on mice for 30 minutes", reward: "24,000 coin" },
    { title: "Room host gives gifts to 3 new users", reward: "32,000 coin" },
    { title: "Room host successfully invites 1 person to the mice", reward: "4,000 coin" },
    { title: "Room host successfully invites 3 new users to the mice", reward: "40,000 coin" },
    { title: "Room host gives 10 gifts", reward: "32,000 coin" },
    { title: "3 new users give gifts in the room", reward: "60,000 coin" },
    { title: "Room host successfully invites 10 people to the mice", reward: "24,000 coin" },
    { title: "3 people are on mice simultaneously for 10 minutes", reward: "40,000 coin" },
    { title: "Room host gives 1 gift", reward: "4,000 coin" },
    { title: "10 new followers of the room", reward: "100,000 coin" }
  ];

  return (
    <div className="relative w-full h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#120a1f] scrollbar-none">
      <div className="relative w-full min-h-full flex flex-col">
        {/* TOP BACKGROUND */}
        <div 
          className="absolute top-0 left-0 w-full h-[55vh] z-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/file_00000000cb748211bf0120855b80f449.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, black 98%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 98%, transparent 100%)',
          }}
        />

        {/* BOTTOM BACKGROUND */}
        <div 
          className="absolute top-[50vh] left-0 w-full h-[250vh] z-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/file_0000000077748211a3cf580b616ab31b.png)',
            backgroundSize: '100% 100%',
            backgroundPosition: 'top center',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 2%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 2%, black 100%)',
          }}
        />

        {/* BACK ICON */}
        <button 
          onClick={onBack} 
          className="absolute z-50 p-2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
          style={{
            top: 'max(12px, env(safe-area-inset-top))',
            left: '12px'
          }}
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round drop-shadow-lg">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        {/* FOREGROUND CONTENT */}
        <div className="relative z-10 w-full flex flex-col items-center">
          
          <div className="w-full" style={{ height: 'calc(50vh - 45px)' }}></div>

          {/* Middle Decoration Image */}
          <div className="w-full flex justify-center px-4 flex-col items-center">
            <img 
              src="/file_00000000f2908208a7b6a2b73c3bbf36.png" 
              alt="Middle Decoration" 
              className="w-[90%] max-w-[340px] object-contain drop-shadow-2xl select-none"
              draggable={false}
            />
            
            {/* Middle Image ke theek niche Room Task heading */}
            <h1 className="text-white text-lg font-black tracking-wider uppercase mt-8 drop-shadow-md">
              Room Task
            </h1>
          </div>

          {/* 22 Task Images with Titles & Claim Buttons inside */}
          <div className="w-full flex flex-col items-center -space-y-[50px] mt-12 pb-16 px-4">
            {tasks.map((task, index) => (
              <TaskItem 
                key={index}
                title={task.title}
                reward={task.reward}
                iconSrc={cleanedIconSrc}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

