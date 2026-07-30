"use client";

import React, { useState } from "react";
import { ArrowLeft, Bot, Send } from "lucide-react"; // Icons ke liye lucide-react (agar installed hai)

export default function HawaSupport() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Message Sent:", message);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* 1. TOP HEADER */}
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white shadow-md pt-[calc(env(safe-area-inset-top)+12px)]">
        <div className="flex items-center gap-3">
          {/* Back Arrow Icon */}
          <button onClick={() => window.history.back()} className="p-1 hover:bg-white/20 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Robot Icon */}
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
            <Bot className="w-6 h-6 text-white" />
          </div>

          {/* Title / Name */}
          <div>
            <h1 className="font-semibold text-lg leading-tight">Hawa Customer support</h1>
            <span className="text-xs text-blue-100 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Online
            </span>
          </div>
        </div>
      </header>

      {/* 2. CHAT AREA (Niche Messages Dikhane ke liye Space) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-slate-100">
          <p className="text-sm text-slate-700">Namaste! Main Hawa Support Bot hoon. Main aapki kya madad kar sakta hoon?</p>
        </div>
      </div>

      {/* 3. BOTTOM INPUT BAR (Peelee/Pali Patti) */}
      <div className="p-3 bg-yellow-400 border-t border-yellow-500 shadow-lg pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-inner">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any Questions you can ask"
            className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          {/* Send Button Icon */}
          <button
            onClick={handleSend}
            className="p-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-full transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
