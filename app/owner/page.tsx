"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu, X, Shield, Lock, Save, Eye, EyeOff, Key,
  Users, Flame, Radio, Store, Landmark, FileText,
  AlertTriangle, BarChart3, Settings, Search, ArrowUpDown,
  Trash2, RefreshCw, Bot, ChevronDown, ChevronUp, LogOut
} from "lucide-react";

import { db, doc, onSnapshot, query, collection, orderBy, getDocs, deleteDoc, setDoc } from '../../src/lib/supabase';

export default function OwnerPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("manage_users");
  const [saveMessage, setSaveMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginKey, setLoginKey] = useState("");
  const [loginError, setLoginError] = useState("");

  // Feedback & Chat states
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [aiChats, setAiChats] = useState<any[]>([]);
  const [loadingAiChats, setLoadingAiChats] = useState(false);
  const [expandedChats, setExpandedChats] = useState<Record<string, boolean>>({});

  const defaultIds = ["100002", "100003", "500001", "500002", "500003", "500004", "500005", "700001", "700002", "700003"];

  const getDefaultIdsData = () => {
    const data: Record<string, { email: string; password: string }> = {};
    defaultIds.forEach(id => {
      data[id] = { email: "", password: "" };
    });
    return data;
  };

  const [idsData, setIdsData] = useState<Record<string, any>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ownerPanelCredentials");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Local storage error:", e);
      }
    }
    return getDefaultIdsData();
  });

  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const isDirtied = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(localStorage.getItem("ownerPanelLoggedIn") === "true");
    }
  }, []);

  // Sync credentials from Firestore safely
  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, "adminSettings", "credentials");
    const unsubscribe = onSnapshot(docRef, (docSnap: any) => {
      if (isDirtied.current) return;
      if (docSnap.exists()) {
        const serverData = docSnap.data().ownerPanelCredentials || {};
        const mergedData = getDefaultIdsData();
        defaultIds.forEach(id => {
          if (serverData[id]) {
            mergedData[id] = {
              email: serverData[id].email || "",
              password: serverData[id].password || ""
            };
          }
        });
        setIdsData(mergedData);
        localStorage.setItem("ownerPanelCredentials", JSON.stringify(mergedData));
      }
    }, (err) => console.error("Firestore error:", err));

    return () => unsubscribe();
  }, []);

  // Track online status safely without memory leak
  useEffect(() => {
    if (!db) return;
    const unsubscribes = defaultIds.map(id => {
      const docRef = doc(db, "adminSettings", `sessions_${id}`);
      return onSnapshot(docRef, (docSnap: any) => {
        setOnlineStatus(prev => ({
          ...prev,
          [id]: docSnap.exists() ? docSnap.data().isLoggedIn === true : false
        }));
      }, (err) => console.error(`Session error ${id}:`, err));
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  const handleLogin = () => {
    if (loginUsername === "HAWA.IN" && loginPassword === "HAWA.OWNER/CEO" && loginKey === "25/7/2026") {
      setIsLoggedIn(true);
      setLoginError("");
      localStorage.setItem("ownerPanelLoggedIn", "true");
    } else {
      setLoginError("Invalid credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("ownerPanelLoggedIn");
    setLoginUsername("");
    setLoginPassword("");
    setLoginKey("");
  };

  const handleChange = (id: string, field: string, value: string) => {
    isDirtied.current = true;
    setIdsData(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSave = useCallback(async () => {
    try {
      const credentials: any[] = [];
      Object.entries(idsData).forEach(([id, data]: [string, any]) => {
        const email = (data.email || "").trim();
        const password = (data.password || "").trim();
        if (email && password) {
          credentials.push({
            id,
            email,
            password,
            type: id.startsWith("5") ? "official" : id.startsWith("7") ? "admin" : "special"
          });
        }
      });

      const docRef = doc(db, "adminSettings", "credentials");
      await setDoc(docRef, {
        ownerPanelCredentials: idsData,
        officialCredentials: credentials
      }, { merge: true });

      isDirtied.current = false;
      localStorage.setItem("ownerPanelCredentials", JSON.stringify(idsData));
      localStorage.setItem("officialCredentials", JSON.stringify(credentials));

      setSaveMessage("Saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setSaveMessage("Error saving data!");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }, [idsData]);

  const handleIDLogout = async (id: string) => {
    try {
      const docRef = doc(db, "adminSettings", `sessions_${id}`);
      await setDoc(docRef, {
        isLoggedIn: false,
        forceLogoutTimestamp: Date.now()
      }, { merge: true });

      setSaveMessage(`ID ${id} Logged Out!`);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Load Feedbacks
  const loadFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const q = query(collection(db, "feedbacks"), orderBy("timestamp", "desc"));
      const snap: any = await getDocs(q);
      const list: any[] = [];
      snap.forEach((d: any) => list.push({ id: d.id, ...d.data() }));
      setFeedbacks(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  // Load AI Chats
  const loadAiChats = async () => {
    setLoadingAiChats(true);
    try {
      const q = query(collection(db, "aiChats"), orderBy("timestamp", "desc"));
      const snap: any = await getDocs(q);
      const list: any[] = [];
      snap.forEach((d: any) => list.push({ id: d.id, ...d.data() }));
      setAiChats(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiChats(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "reports") loadFeedbacks();
    if (activeMenu === "hawa_ai") loadAiChats();
  }, [activeMenu]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-md text-white">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Haka Live Staff Panel</h1>
            <p className="text-slate-400 text-xs mt-1">Staff Control & Verification</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="HAWA.IN"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Security Key</label>
              <input
                type="password"
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                placeholder="25/7/2026"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            {loginError && <p className="text-rose-400 text-xs text-center bg-rose-500/10 py-2 rounded-lg">{loginError}</p>}

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm cursor-pointer shadow-lg shadow-indigo-600/30 mt-2"
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredIds = defaultIds.filter(id =>
    id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (idsData[id]?.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR (Haka Live Theme) */}
      <aside className={`bg-[#0f172a] text-slate-400 w-64 flex-shrink-0 flex flex-col justify-between transition-all duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-64 fixed lg:static lg:translate-x-0"} z-40`}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo Header */}
          <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-base tracking-wide">Haka Live</h2>
              <p className="text-[10px] tracking-wider uppercase text-slate-500 font-semibold">Staff Control Panel</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300">
              <Flame className="w-4 h-4 text-orange-400" /> Dashboard
            </button>

            <div className="pt-2 pb-1 text-[11px] font-semibold text-slate-500 px-3 uppercase tracking-wider">User Center</div>
            <button
              onClick={() => setActiveMenu("manage_users")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeMenu === "manage_users" ? "bg-indigo-600/20 text-indigo-400 font-semibold" : "hover:bg-slate-800/60 text-slate-300"
              }`}
            >
              <Users className="w-4 h-4 text-indigo-400" /> Manage Users / IDs
            </button>

            <div className="pt-2 pb-1 text-[11px] font-semibold text-slate-500 px-3 uppercase tracking-wider">Live & Store</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400">
              <Radio className="w-4 h-4 text-sky-400" /> Manage Rooms
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400">
              <Store className="w-4 h-4 text-emerald-400" /> Special IDs & Themes
            </button>

            <div className="pt-2 pb-1 text-[11px] font-semibold text-slate-500 px-3 uppercase tracking-wider">Economy & Moderation</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400">
              <Landmark className="w-4 h-4 text-amber-400" /> Master Wallet & Revenue
            </button>
            <button
              onClick={() => setActiveMenu("reports")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeMenu === "reports" ? "bg-indigo-600/20 text-indigo-400 font-semibold" : "hover:bg-slate-800/60 text-slate-400"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Reports & Feedbacks
            </button>
            <button
              onClick={() => setActiveMenu("hawa_ai")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeMenu === "hawa_ai" ? "bg-indigo-600/20 text-indigo-400 font-semibold" : "hover:bg-slate-800/60 text-slate-400"
              }`}
            >
              <Bot className="w-4 h-4 text-purple-400" /> AI Assistant Logs
            </button>

            <div className="pt-2 pb-1 text-[11px] font-semibold text-slate-500 px-3 uppercase tracking-wider">Platform</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Analytics & Reports
            </button>
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              H
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Owner Admin</p>
              <p className="text-[10px] text-slate-500">Live Server</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 transition" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-slate-600">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-slate-900">
              {activeMenu === "manage_users" ? "Users" : activeMenu === "reports" ? "Feedbacks & Reports" : "AI Logs"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold px-3 py-1.5 rounded-md">
                {saveMessage}
              </span>
            )}
            {activeMenu === "manage_users" && (
              <>
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                >
                  {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPasswords ? "Hide" : "Show"} Passwords
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* USER MANAGEMENT VIEW (Exact Table Theme) */}
          {activeMenu === "manage_users" && (
            <div className="space-y-4 max-w-7xl mx-auto">
              
              {/* Filter Controls Row */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3 text-xs">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, email, Haka ID..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition text-xs"
                  />
                </div>
                <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none">
                  <option>All Roles</option>
                  <option>Official</option>
                  <option>Admin</option>
                  <option>Special</option>
                </select>
                <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none">
                  <option>All Status</option>
                  <option>Online</option>
                  <option>Offline</option>
                </select>
                <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-medium">
                  <ArrowUpDown className="w-3 h-3" /> DESC
                </button>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">USER</th>
                        <th className="py-3 px-4">HAKA ID</th>
                        <th className="py-3 px-4">EMAIL</th>
                        <th className="py-3 px-4">PASSWORD</th>
                        <th className="py-3 px-4">ROLE</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredIds.map((id) => {
                        const role = id.startsWith("1") ? "Special" : id.startsWith("5") ? "Official" : "Admin";
                        const isOnline = onlineStatus[id];
                        const roleColor = id.startsWith("1") ? "bg-amber-50 text-amber-600 border-amber-200" : id.startsWith("5") ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-purple-50 text-purple-600 border-purple-200";

                        return (
                          <tr key={id} className="hover:bg-slate-50/80 transition group">
                            {/* User Avatar + Name */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                                  {id.slice(-2)}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">Staff Account</p>
                                  <p className="text-[10px] text-slate-400">@staff_{id}</p>
                                </div>
                              </div>
                            </td>

                            {/* ID */}
                            <td className="py-3 px-4 font-semibold text-indigo-600">
                              {id}
                            </td>

                            {/* Email Input */}
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                placeholder="name@example.com"
                                value={idsData[id]?.email || ""}
                                onChange={(e) => handleChange(id, "email", e.target.value)}
                                className="w-56 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white transition"
                              />
                            </td>

                            {/* Password Input */}
                            <td className="py-3 px-4">
                              <input
                                type={showPasswords ? "text" : "password"}
                                placeholder="••••••••"
                                value={idsData[id]?.password || ""}
                                onChange={(e) => handleChange(id, "password", e.target.value)}
                                className="w-36 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white transition"
                              />
                            </td>

                            {/* Role Badge */}
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${roleColor}`}>
                                {role}
                              </span>
                            </td>

                            {/* Online/Offline Status */}
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                isOnline ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                                {isOnline ? "Online" : "Offline"}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleIDLogout(id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                Logout
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORTS / FEEDBACKS VIEW */}
          {activeMenu === "reports" && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">User Feedbacks & Bug Reports</h2>
                <button
                  onClick={loadFeedbacks}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingFeedbacks ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>

              {feedbacks.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
                  No active reports available.
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map(f => (
                    <div key={f.id} className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-indigo-600 uppercase">{f.type || "Feedback"}</span>
                        <button
                          onClick={async () => {
                            await deleteDoc(doc(db, "feedbacks", f.id));
                            setFeedbacks(prev => prev.filter(item => item.id !== f.id));
                          }}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-slate-700">{f.description}</p>
                      <p className="text-[10px] text-slate-400 mt-2">{f.contactInfo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI CHATS VIEW */}
          {activeMenu === "hawa_ai" && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">Live AI Conversation Logs</h2>
                <button
                  onClick={loadAiChats}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAiChats ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>

              {aiChats.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
                  No chat logs recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {aiChats.map(chat => (
                    <div key={chat.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <button
                        onClick={() => setExpandedChats(prev => ({ ...prev, [chat.id]: !prev[chat.id] }))}
                        className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{chat.userName || "Anonymous User"}</p>
                          <p className="text-[10px] text-slate-400">{chat.userEmail}</p>
                        </div>
                        {expandedChats[chat.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedChats[chat.id] && (
                        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2 max-h-60 overflow-y-auto">
                          {chat.messages?.map((m: any, idx: number) => (
                            <div key={idx} className={`p-2 rounded-lg text-xs ${m.isBot ? "bg-white border border-slate-200 text-slate-700" : "bg-indigo-600 text-white ml-auto max-w-[80%]"}`}>
                              {m.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

