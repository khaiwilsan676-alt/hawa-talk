"use client";

import React, { useState } from "react";
import { Menu, X, Shield, Lock, Mail, Save } from "lucide-react";

export default function OwnerPanel() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState("official_id");
  const [saveMessage, setSaveMessage] = useState("");

  const [idsData, setIdsData] = useState(() => {
    // Load saved data from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ownerPanelCredentials');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      "500001": { email: "", password: "" },
      "500002": { email: "", password: "" },
      "500003": { email: "", password: "" },
      "500004": { email: "", password: "" },
      "500005": { email: "", password: "" },
      "700001": { email: "", password: "" },
      "700002": { email: "", password: "" },
      "700003": { email: "", password: "" },
    };
  });

  const handleChange = (id, field, value) => {
    setIdsData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('ownerPanelCredentials', JSON.stringify(idsData));
    
    // Create credentials array for login
    const credentials = [];
    Object.entries(idsData).forEach(([id, data]) => {
      if (data.email && data.password) {
        credentials.push({
          id: id,
          email: data.email,
          password: data.password,
          type: id.startsWith('5') ? 'official' : 'admin'
        });
      }
    });
    localStorage.setItem('officialCredentials', JSON.stringify(credentials));
    
    setSaveMessage("Credentials saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
    console.log("Saved Data:", idsData);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative flex flex-col min-w-[1024px] overflow-x-auto">
      
      {/* TOP NAVBAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition active:scale-95 cursor-pointer"
          >
            <Menu className="w-7 h-7 text-white" />
          </button>
          <h1 className="text-xl font-bold tracking-wide">Owner Control Panel (Desktop View)</h1>
        </div>
        {saveMessage && (
          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-medium">
            {saveMessage}
          </div>
        )}
      </header>

      {/* LEFT SIDE BLUE DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-80 h-full bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 shadow-2xl p-6 flex flex-col justify-between z-10 border-r border-blue-400/30">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-blue-400/30 mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-yellow-300" />
                  <span className="font-bold text-lg text-white">Owner Menu</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-white cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={() => {
                  setActiveView("official_id");
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between px-5 py-4 bg-white/10 hover:bg-white/20 active:bg-blue-500 text-white font-semibold rounded-xl transition border border-white/20 shadow-md cursor-pointer"
              >
                <span>MANAGE IDs</span>
                <span className="text-xs bg-yellow-400 text-black px-2.5 py-1 rounded-full font-bold">
                  Official/Admin
                </span>
              </button>
            </div>

            <div className="text-xs text-blue-200/60 text-center pb-2">
              Owner Panel Desktop Scale
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 w-full max-w-5xl mx-auto overflow-y-auto">
        {activeView === "official_id" && (
          <div className="space-y-8">
            
            {/* OFFICIAL IDs SECTION */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold text-blue-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" /> Official IDs (500001-500005)
              </h2>

              <div className="space-y-3">
                {["500001", "500002", "500003", "500004", "500005"].map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60"
                  >
                    <span className="w-24 text-sm font-bold text-yellow-400">ID: {id}</span>
                    
                    {/* Email Input */}
                    <div className="flex-1 flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={idsData[id]?.email}
                        onChange={(e) => handleChange(id, "email", e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-white placeholder-slate-500"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="flex-1 flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={idsData[id]?.password}
                        onChange={(e) => handleChange(id, "password", e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ADMIN IDs SECTION */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold text-purple-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Admin IDs (700001-700003)
              </h2>

              <div className="space-y-3">
                {["700001", "700002", "700003"].map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60"
                  >
                    <span className="w-24 text-sm font-bold text-purple-300">ID: {id}</span>
                    
                    {/* Email Input */}
                    <div className="flex-1 flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={idsData[id]?.email}
                        onChange={(e) => handleChange(id, "email", e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-white placeholder-slate-500"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="flex-1 flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={idsData[id]?.password}
                        onChange={(e) => handleChange(id, "password", e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-5 h-5" /> Save All Credentials
            </button>

          </div>
        )}
      </main>
    </div>
  );
                                }
