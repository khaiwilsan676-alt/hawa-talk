'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FourgrideProps {
  onClose: () => void;
  onClearChat: () => void;
  publicMsgOff: boolean;
  onTogglePublicMsg: () => void;
}

// ---------- IndexedDB Helpers (Music Storage) ----------
const DB_NAME = 'HurryMusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'music';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addMusicToDB(music: { id: string; name: string; blob: Blob }): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(music);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    db.close();
  });
}

async function deleteMusicFromDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    db.close();
  });
}

async function getAllMusicFromDB(): Promise<{ id: string; name: string; blob: Blob }[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

// WebGL Shader Component for removing white background
const ImageWithTransparentBackground: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    // Fragment shader for removing white background
    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      uniform float u_threshold;
      
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        
        // Calculate whiteness
        float whiteness = (color.r + color.g + color.b) / 3.0;
        float maxChannel = max(color.r, max(color.g, color.b));
        float minChannel = min(color.r, min(color.g, color.b));
        float colorDiff = maxChannel - minChannel;
        
        // If pixel is white (high brightness, low saturation)
        if (whiteness > u_threshold && colorDiff < 0.2) {
          // Make it transparent
          gl_FragColor = vec4(color.rgb, 0.0);
        } else {
          // Keep original color but adjust alpha for near-white pixels
          float alpha = smoothstep(u_threshold - 0.2, u_threshold, whiteness);
          gl_FragColor = vec4(color.rgb, alpha);
        }
      }
    `;

    // Compile shaders
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set up texture coordinates
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]), gl.STATIC_DRAW);

    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Create texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Load image
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      
      // Enable blending for transparency
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      // Set threshold for white detection (0.85 = 85% white threshold)
      const thresholdLocation = gl.getUniformLocation(program, 'u_threshold');
      gl.uniform1f(thresholdLocation, 0.85);
      
      // Set image uniform
      const imageLocation = gl.getUniformLocation(program, 'u_image');
      gl.uniform1i(imageLocation, 0);
      
      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      setImageLoaded(true);
    };
    image.src = src;

    // Cleanup
    return () => {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texCoordBuffer);
      gl.deleteTexture(texture);
    };
  }, [src]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      style={{ 
        opacity: imageLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

export default function Fourgride({
  onClose,
  onClearChat,
  publicMsgOff,
  onTogglePublicMsg,
}: FourgrideProps) {
  // Toggle states (except publicMsgOff, which is controlled)
  const [entryEffect, setEntryEffect] = useState(false);
  const [giftEffect, setGiftEffect] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  // Music sheet state
  const [showMusicSheet, setShowMusicSheet] = useState(false);
  const [musicFiles, setMusicFiles] = useState<{ id: string; name: string; url: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteCard, setShowDeleteCard] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle handlers
  const toggleEntryEffect = () => setEntryEffect(!entryEffect);
  const toggleGiftEffect = () => setGiftEffect(!giftEffect);
  const toggleSpeaker = () => setSpeaker(!speaker);

  // Clear chat handler
  const handleClearChat = () => {
    onClearChat();
  };

  // Load music files from IndexedDB on mount
  useEffect(() => {
    const loadMusic = async () => {
      try {
        const dbMusic = await getAllMusicFromDB();
        const files = dbMusic.map((item) => ({
          id: item.id,
          name: item.name,
          url: URL.createObjectURL(item.blob),
        }));
        setMusicFiles(files);
      } catch (error) {
        console.error('Error loading music:', error);
      }
    };
    loadMusic();
  }, []);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      musicFiles.forEach((file) => URL.revokeObjectURL(file.url));
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [musicFiles]);

  // Handle music file selection - opens file picker directly
  const handleMusicClick = () => {
    fileInputRef.current?.click();
  };

  // Handle music file selection - supports multiple files
  const handleAddMusic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const validFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
    
    if (validFiles.length === 0) {
      alert('Please select audio files');
      return;
    }
    
    const newMusicFiles = validFiles.map(file => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      return {
        id,
        name: file.name,
        url: URL.createObjectURL(file),
        blob: file
      };
    });
    
    setMusicFiles(prev => [...prev, ...newMusicFiles.map(({ blob, ...rest }) => rest)]);
    
    // Save all files to IndexedDB
    newMusicFiles.forEach(({ id, name, blob }) => {
      addMusicToDB({ id, name, blob });
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Auto-play first added music if nothing is playing
    if (currentlyPlaying === null && newMusicFiles.length > 0) {
      const firstFile = newMusicFiles[0];
      setCurrentlyPlaying(firstFile.id);
      setCurrentTrackIndex(0);
      const audio = new Audio(firstFile.url);
      audio.volume = volume;
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
    }
  };

  // Play/pause handler
  const togglePlay = (id: string, url: string) => {
    if (currentlyPlaying === id) {
      // Same track - toggle play/pause
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } else {
      // Different track - stop current and play new
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = url;
        audioRef.current.play();
      } else {
        const audio = new Audio(url);
        audio.volume = volume;
        audioRef.current = audio;
        audio.play();
      }
      setCurrentlyPlaying(id);
      setCurrentTrackIndex(musicFiles.findIndex(f => f.id === id));
      setIsPlaying(true);
    }
  };

  // Handle audio ended
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        // Play next track
        playNext();
      };
    }
  }, [audioRef.current, currentTrackIndex, musicFiles]);

  // Play next track
  const playNext = () => {
    if (musicFiles.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % musicFiles.length;
    const nextTrack = musicFiles[nextIndex];
    
    if (audioRef.current) {
      audioRef.current.src = nextTrack.url;
      audioRef.current.play();
    } else {
      const audio = new Audio(nextTrack.url);
      audio.volume = volume;
      audioRef.current = audio;
      audio.play();
    }
    
    setCurrentlyPlaying(nextTrack.id);
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  // Play previous track
  const playPrevious = () => {
    if (musicFiles.length === 0) return;
    
    const prevIndex = (currentTrackIndex - 1 + musicFiles.length) % musicFiles.length;
    const prevTrack = musicFiles[prevIndex];
    
    if (audioRef.current) {
      audioRef.current.src = prevTrack.url;
      audioRef.current.play();
    } else {
      const audio = new Audio(prevTrack.url);
      audio.volume = volume;
      audioRef.current = audio;
      audio.play();
    }
    
    setCurrentlyPlaying(prevTrack.id);
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Toggle volume slider
  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  // Delete music handler
  const handleDeleteMusic = async (id: string) => {
    try {
      await deleteMusicFromDB(id);
      setMusicFiles(prev => {
        const fileToDelete = prev.find(f => f.id === id);
        if (fileToDelete) {
          URL.revokeObjectURL(fileToDelete.url);
        }
        return prev.filter(f => f.id !== id);
      });
      if (currentlyPlaying === id) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setCurrentlyPlaying(null);
        setIsPlaying(false);
        setCurrentTrackIndex(-1);
      }
      setShowDeleteCard(null);
    } catch (error) {
      console.error('Error deleting music:', error);
    }
  };

  // Close music sheet but keep playing
  const handleCloseMusicSheet = () => {
    setShowMusicSheet(false);
    // Don't stop audio - keep playing
  };

  // Filter music by search query
  const filteredMusic = musicFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Bottom sheet */}
      <div
        className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl px-4 pt-4 pb-6 animate-slide-up max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Tools</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-gray-700 stroke-[2.5]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Row 1 – 4 items */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* 1. Clear Chat */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleClearChat}
              className="transition-transform hover:scale-105"
            >
              <img src="/IMG_20260814_110525.png" alt="Clear Chat" className="w-12 h-12 object-contain" />
            </button>
            <span className="text-[10px] text-gray-700 mt-1 text-center">Clear-Chat</span>
          </div>

          {/* 2. Public msg Off with toggle overlay */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img src="/IMG_20260814_110608.png" alt="Public msg Off" className="w-12 h-12 object-contain" />
              <button
                onClick={onTogglePublicMsg}
                className={`absolute bottom-0 right-0 w-6 h-4 rounded-full flex items-center transition-colors ${
                  publicMsgOff ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                    publicMsgOff ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <span className="text-[10px] text-gray-700 mt-1 whitespace-nowrap">Public msg</span>
          </div>

          {/* 3. Entry Effect with toggle overlay */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img src="/IMG_20260814_110709.png" alt="Entry Effect" className="w-12 h-12 object-contain" />
              <button
                onClick={toggleEntryEffect}
                className={`absolute bottom-0 right-0 w-6 h-4 rounded-full flex items-center transition-colors ${
                  entryEffect ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                    entryEffect ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <span className="text-[10px] text-gray-700 mt-1 whitespace-nowrap">Entry Effect</span>
          </div>

          {/* 4. Gift Effect with toggle overlay */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img src="/IMG_20260814_110727.png" alt="Gift Effect" className="w-12 h-12 object-contain" />
              <button
                onClick={toggleGiftEffect}
                className={`absolute bottom-0 right-0 w-6 h-4 rounded-full flex items-center transition-colors ${
                  giftEffect ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                    giftEffect ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <span className="text-[10px] text-gray-700 mt-1 whitespace-nowrap">Gift Effect</span>
          </div>
        </div>

        {/* Row 2 – 4 items */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* 5. Music - opens file picker directly */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleMusicClick}
              className="transition-transform hover:scale-105"
            >
              <img src="/IMG_20260814_144255.png" alt="Music" className="w-12 h-12 object-contain" />
            </button>
            <span className="text-[10px] text-gray-700 mt-1">Music</span>
          </div>

          {/* 6. Speaker with toggle */}
          <div className="flex flex-col items-center">
            <img src="/IMG_20260814_110628.png" alt="Speaker" className="w-12 h-12 object-contain" />
            <div className="flex items-center mt-1 space-x-1">
              <span className="text-[10px] text-gray-700 whitespace-nowrap">Speaker</span>
              <button
                onClick={toggleSpeaker}
                className={`w-6 h-4 rounded-full flex items-center transition-colors ${
                  speaker ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                    speaker ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 7. Store */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => console.log('Store')}
              className="transition-transform hover:scale-105"
            >
              <img src="/IMG_20260814_110501.png" alt="Store" className="w-12 h-12 object-contain" />
            </button>
            <span className="text-[10px] text-gray-700 mt-1">Store</span>
          </div>

          {/* 8. My-Iteam */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => console.log('My Item')}
              className="transition-transform hover:scale-105"
            >
              <img src="/IMG_20260814_110545.png" alt="My Item" className="w-12 h-12 object-contain" />
            </button>
            <span className="text-[10px] text-gray-700 mt-1">My-Iteam</span>
          </div>
        </div>

        {/* Games Section */}
        <div className="mt-2">
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Games</h3>
          </div>
          <div className="flex justify-around">
            <div className="flex flex-col items-center">
              <button
                onClick={() => console.log('Games')}
                className="transition-transform hover:scale-105"
              >
                <img src="/IMG_20260814_111008.png" alt="Games" className="w-12 h-12 object-contain" />
              </button>
              <span className="text-[10px] text-gray-700 mt-1">Games</span>
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={() => console.log('Lucky Bag')}
                className="transition-transform hover:scale-105"
              >
                <img src="/IMG_20260814_110743.png" alt="Lucky bag" className="w-12 h-12 object-contain" />
              </button>
              <span className="text-[10px] text-gray-700 mt-1">Lucky bag</span>
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={() => console.log('PK Battle')}
                className="transition-transform hover:scale-105"
              >
                <img src="/IMG_20260814_110802.png" alt="Pk Battle" className="w-12 h-12 object-contain" />
              </button>
              <span className="text-[10px] text-gray-700 mt-1">Pk Battle</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slideUp 0.3s ease-out;
          }
        `}</style>
      </div>

      {/* ---------- Music Player Bar (Bottom) ---------- */}
      {currentlyPlaying && !showMusicSheet && (
        <div className="fixed bottom-[10vh] left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-4">
          <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-3">
            {/* Background Image with Transparent Background */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <ImageWithTransparentBackground 
                src="/IMG_20260815_121535.png" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Song Name */}
              <p className="text-white text-sm font-semibold mb-2 text-center truncate px-2 drop-shadow-lg">
                {musicFiles.find(f => f.id === currentlyPlaying)?.name || 'Playing...'}
              </p>
              
              {/* Controls Row */}
              <div className="flex items-center justify-center gap-4">
                {/* Previous Button */}
                <button
                  onClick={playPrevious}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white drop-shadow">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>
                
                {/* Play/Pause Button */}
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      if (isPlaying) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                      } else {
                        audioRef.current.play();
                        setIsPlaying(true);
                      }
                    }
                  }}
                  className="p-3 bg-white/30 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white drop-shadow">
                      <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white drop-shadow">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                
                {/* Next Button */}
                <button
                  onClick={playNext}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white drop-shadow">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
                
                {/* Volume Control */}
                <div className="relative">
                  <button
                    onClick={toggleVolumeSlider}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white drop-shadow">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  </button>
                  
                  {/* Volume Slider */}
                  {showVolumeSlider && (
                    <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl p-3">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 ${volume * 100}%, #e5e7eb ${volume * 100}%)`
                        }}
                      />
                      <p className="text-center text-xs text-gray-600 mt-1">
                        {Math.round(volume * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Music Bottom Sheet ---------- */}
      {showMusicSheet && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseMusicSheet} />
          <div
            className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden"
            style={{ height: '50vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Music</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMusicClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add
                </button>
                <button
                  onClick={handleCloseMusicSheet}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-gray-700 stroke-[2.5]">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search input */}
            <div className="px-4 pt-3">
              <input
                type="text"
                placeholder="Search music..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-700 outline-none border border-gray-200 focus:border-blue-400"
              />
            </div>

            {/* Music list */}
            <div className="flex-1 overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(50vh - 120px)' }}>
              {filteredMusic.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  {musicFiles.length === 0 ? 'No music added yet. Click Add to select multiple files!' : 'No matching music found'}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredMusic.map((file) => (
                    <div key={file.id} className="relative">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                        </div>
                        <button
                          onClick={() => togglePlay(file.id, file.url)}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                          aria-label={currentlyPlaying === file.id && isPlaying ? 'Pause' : 'Play'}
                        >
                          {currentlyPlaying === file.id && isPlaying ? (
                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-gray-700 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                              <rect x="6" y="4" width="4" height="16" rx="1" />
                              <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-gray-700 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => setShowDeleteCard(showDeleteCard === file.id ? null : file.id)}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                          aria-label="More options"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-600">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Delete Card */}
                      {showDeleteCard === file.id && (
                        <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                          <button
                            onClick={() => handleDeleteMusic(file.id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer w-full"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-red-600 stroke-[2] stroke-linecap-round stroke-linejoin-round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for music - supports multiple files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleAddMusic}
        className="hidden"
      />
    </div>
  );
      }
