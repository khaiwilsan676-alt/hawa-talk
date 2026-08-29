"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Flame, Users, Mic, Radio, Palette, Star, Gift,
  Landmark, History, Coins, Wallet, CreditCard,
  ArrowDownToLine, RefreshCw, DollarSign, Trophy,
  Image as ImageIcon, AlertOctagon, Headphones,
  ShieldAlert, BarChart2, Briefcase, Gamepad2,
  Settings, ChevronDown, ChevronRight, ArrowUpDown,
  Search, Shield, Eye, EyeOff, Save, LogOut
} from "lucide-react";

import * as SupabaseLib from '../../src/lib/supabase';

const db = (SupabaseLib as any).db || null;
const doc = (SupabaseLib as any).doc || (() => {});
const onSnapshot = (SupabaseLib as any).onSnapshot || (() => () => {});
const setDoc = (SupabaseLib as any).setDoc || (async () => {});

export default function HakaLiveControlPanel() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState("manage_users");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    user_center: true,
    live_rooms: false,
    store: false,
    economy: false,
    content: false,
    moderation: false,
    platform: false,
    system: false
  });

  // Login States
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginKey, setLoginKey] = useState("");
  const [loginError, setLoginError] = useState("");

  // Table Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showPasswords, setShowPasswords] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Default Users/IDs Configuration
  const defaultUsers = [
    { id: "100002", name: "Robot Gaming Master", username: "robot_gaming", role: "SPECIAL", badgeColor: "text-sky-500 bg-sky-50" },
    { id: "100003", name: "Uuhbh Bhhhn", username: "uuhbh_live", role: "HOST", badgeColor: "text-purple-500 bg-purple-50" },
    { id: "500001", name: "Riya", username: "riya_official", role: "HOST", badgeColor: "text-purple-500 bg-purple-50" },
    { id: "500002", name: "Rider", username: "rider_pro", role: "HOST", badgeColor: "text-purple-500 bg-purple-50" },
    { id: "500003", name: "Samir", username: "samir_star", role: "HOST", badgeColor: "text-purple-500 bg-purple-50" },
    { id: "500004", name: "Newbie Fan", username: "newbie_fan", role: "NORMAL", badgeColor: "text-sky-500 bg-sky-50" },
    { id: "500005", name: "Luna Star", username: "luna_star", role: "HOST", badgeColor: "text-purple-500 bg-purple-50" },
    { id: "700001", name: "Agent Boss", username: "agent_boss", role: "AGENT", badgeColor: "text-amber-500 bg-amber-50" },
    { id: "700002", name: "Marco 🎤", username: "marco_talks", role: "HOST", badgeColor: "text-purple-500 bg-purple-50" },
    { id: "700003", name: "Zara Beats 🎵", username: "zara_beats", role: "HOST", badgeColor: "text-purple-500 bg-purple-50" },
    { id: "248708597", name: "Nova ✨", username: "nova_live", role: "HOST", badgeColor: "text-purple-500 bg-purple-50" },
    { id: "941224460", name: "Mia Chen", username: "ts_mia", role: "NORMAL", badgeColor: "text-sky-500 bg-sky-50" },
    { id: "265022948", name: "Leo Stone", username: "ts_leo", role: "NORMAL", badgeColor: "text-sky-500 bg-sky-50" },
    { id: "621965153", name: "Sara Lin", username: "ts_sara", role: "NORMAL", badgeColor: "text-sky-500 bg-sky-50" },
    { id: "028452631", name: "Kai Rivera", username: "ts_kai", role: "NORMAL", badgeColor: "text-sky-500 bg-sky-50" },
    { id: "219185727", name: "Aisha Malik", username: "ts_aisha", role: "NORMAL", badgeColor: "text-sky-500 bg-sky-50" },
    { id: "063153655", name: "Yuki Tanaka", username: "ts_yuki", role: "HOST", badgeColor: "text-purple-500 bg-purple-50" },
    { id: "917144229", name: "JjayFabor", username: "jjayfabor", role: "HOST", badgeColor: "text-purple-500 bg-purple-50" }
  ];

  const [credentials, setCredentials] = useState<Record<string, { email: string; password: string }>>(() => {
    const init: Record<string, { email: string; password: string }> = {};
    defaultUsers.forEach(u => {
      init[u.id] = { email: "", password: "" };
    });
    return init;
  });

  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const isDirtied = useRef(false);

  // Safe SSR Mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsLoggedIn(localStorage.getItem("ownerPanelLoggedIn") === "true");
      try {
        const saved = localStorage.getItem("ownerPanelCredentials");
        if (saved) setCredentials(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync with Firestore
  useEffect(() => {
    if (!mounted || !db) return;
    try {
      const docRef = doc(db, "adminSettings", "credentials");
      const unsubscribe = onSnapshot(docRef, (docSnap: any) => {
        if (isDirtied.current) return;
        if (docSnap.exists()) {
          const serverData = docSnap.data()?.ownerPanelCredentials || {};
          setCredentials(prev => ({ ...prev, ...serverData }));
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.error(e);
    }
  }, [mounted]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogin = () => {
    if (loginUsername === "HAWA.IN" && loginPassword === "HAWA.OWNER/CEO" && loginKey === "25/7/2026") {
      setIsLoggedIn(true);
      setLoginError("");
      if (typeof window !== "undefined") {
        localStorage.setItem("ownerPanelLoggedIn", "true");
      }
    } else {
      setLoginError("Invalid credentials. Please verify your login details.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ownerPanelLoggedIn");
    }
  };

  const handleInputChange = (id: string, field: "email" | "password", value: string) => {
    isDirtied.current = true;
    setCredentials(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { email: "", password: "" }), [field]: value }
    }));
  };

  const handleSaveCredentials = useCallback(async () => {
    if (!db) return;
    try {
      const docRef = doc(db, "adminSettings", "credentials");
      await setDoc(docRef, { ownerPanelCredentials: credentials }, { merge: true });
      isDirtied.current = false;
      if (typeof window !== "undefined") {
        localStorage.setItem("ownerPanelCredentials", JSON.stringify(credentials));
      }
      setSaveMessage("Saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) {
      console.error("Save error:", e);
    }
  }, [credentials]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#0d1322] flex items-center justify-center text-white text-xs">Loading panel...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d1322] flex items-center justify-center p-4">
        <div className="bg-[#172033] border border-slate-700/60 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-white">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">Haka Live</h1>
            <p className="text-slate-400 text-xs mt-0.5">Staff Control Panel</p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="HAWA.IN"
                className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Key</label>
              <input
                type="password"
                value={loginKey}
                onChange={e => setLoginKey(e.target.value)}
                placeholder="25/7/2026"
                className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>

            {loginError && <p className="text-rose-400 text-[11px] text-center bg-rose-500/10 py-1.5 rounded-lg">{loginError}</p>}

            <button
              onClick={handleLogin}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer mt-1"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered List
  const filteredUsers = defaultUsers
    .filter(u => {
      const q = searchQuery.toLowerCase();
      const matchSearch = u.name.toLowerCase().includes(q) || u.id.includes(q) || (credentials[u.id]?.email || "").toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
      return matchSearch && matchRole;
    })
    .sort((a, b) => (sortOrder === "asc" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)));

  return (
    <div className="flex h-screen bg-white text-slate-700 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR (Dark UI matching image) */}
      <aside className="w-56 bg-[#0f172a] text-slate-400 flex flex-col justify-between flex-shrink-0 text-[11px] select-none">
        <div className="overflow-y-auto">
          
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-800/80">
            <h1 className="text-white font-bold text-sm tracking-tight">Haka Live</h1>
            <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Staff Control Panel</p>
          </div>

          {/* Navigation */}
          <div className="py-2 px-2 space-y-0.5">
            
            {/* Dashboard */}
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-slate-800 text-slate-300">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Dashboard</span>
            </button>

            {/* User Center */}
            <div>
              <button
                onClick={() => toggleSection("user_center")}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-slate-800 text-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-white">User Center</span>
                </div>
                {expandedSections.user_center ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>
              
              {expandedSections.user_center && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  <button
                    onClick={() => setActiveMenu("manage_users")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md ${
                      activeMenu === "manage_users" ? "bg-indigo-600/20 text-indigo-400 font-semibold" : "hover:bg-slate-800/50 text-slate-400"
                    }`}
                  >
                    <Users className="w-3 h-3 text-indigo-400" />
                    <span>Manage Users</span>
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-800/50 text-slate-400">
                    <Mic className="w-3 h-3 text-slate-500" />
                    <span>Host Applications</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Rooms */}
            <div>
              <button
                onClick={() => toggleSection("live_rooms")}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-slate-800 text-slate-400"
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-3.5 h-3.5 text-sky-400" />
                  <span>Live Rooms</span>
                </div>
                {expandedSections.live_rooms ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>
              {expandedSections.live_rooms && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <Radio className="w-3 h-3" /> <span>Manage Rooms</span>
                  </button>
                </div>
              )}
            </div>

            {/* Store */}
            <div>
              <button
                onClick={() => toggleSection("store")}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-slate-800 text-slate-400"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Store</span>
                </div>
                {expandedSections.store ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>
              {expandedSections.store && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <Palette className="w-3 h-3 text-orange-400" /> <span>Themes</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <Star className="w-3 h-3 text-amber-400" /> <span>Special IDs</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <Gift className="w-3 h-3 text-red-400" /> <span>Gift Catalogue</span>
                  </button>
                </div>
              )}
            </div>

            {/* Economy */}
            <div>
              <button
                onClick={() => toggleSection("economy")}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-slate-800 text-slate-400"
              >
                <div className="flex items-center gap-2.5">
                  <Landmark className="w-3.5 h-3.5 text-sky-400" />
                  <span>Economy</span>
                </div>
                {expandedSections.economy ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>
              {expandedSections.economy && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <Landmark className="w-3 h-3 text-indigo-400" /> <span>Master Wallet</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <History className="w-3 h-3 text-slate-400" /> <span>Gift Send History</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <Coins className="w-3 h-3 text-rose-400" /> <span>Bean Revenue</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <Wallet className="w-3 h-3 text-amber-400" /> <span>User Wallets</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <CreditCard className="w-3 h-3 text-sky-400" /> <span>Wallet History</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <ArrowDownToLine className="w-3 h-3 text-emerald-400" /> <span>Withdrawal Requests</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <RefreshCw className="w-3 h-3 text-amber-400" /> <span>Seller Recharges</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:bg-slate-800/50">
                    <DollarSign className="w-3 h-3 text-emerald-400" /> <span>Currency Rates</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <button
                onClick={() => toggleSection("content")}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-slate-800 text-slate-400"
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Content</span>
                </div>
                {expandedSections.content ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>
            </div>

            {/* Moderation */}
            <div>
              <button
                onClick={() => toggleSection("moderation")}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-slate-800 text-slate-400"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Moderation</span>
                </div>
                {expandedSections.moderation ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>
            </div>

            {/* Platform */}
            <div>
              <button
                onClick={() => toggleSection("platform")}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-slate-800 text-slate-400"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Platform</span>
                </div>
                {expandedSections.platform ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>
            </div>

            {/* System */}
            <div>
              <button
                onClick={() => toggleSection("system")}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-slate-800 text-slate-400"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>System</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Logout */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              H
            </div>
            <span className="text-[10px] text-slate-300 font-medium truncate">HAWA.OWNER</span>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN VIEW */}
      <main className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">Users</h1>
          <div className="flex items-center gap-2">
            {saveMessage && <span className="text-xs text-emerald-600 font-medium mr-2">{saveMessage}</span>}
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPasswords ? "Hide" : "Show"} Passwords
            </button>
            <button
              onClick={handleSaveCredentials}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>

        {/* Filters Container */}
        <div className="p-6 pb-2">
          {/* Top Search Input */}
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, email, Haka ID..."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>
          </div>

          {/* Filter Dropdowns Row */}
          <div className="flex items-center gap-2.5 text-xs">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 outline-none shadow-sm"
            >
              <option value="all">All Roles</option>
              <option value="host">Host</option>
              <option value="normal">Normal</option>
              <option value="agent">Agent</option>
              <option value="special">Special</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 outline-none shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 outline-none shadow-sm">
              <option>All (mute)</option>
            </select>

            <input
              type="text"
              placeholder="Country..."
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 placeholder-slate-400 outline-none shadow-sm w-28 text-xs"
            />

            <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 outline-none shadow-sm">
              <option>Sort...</option>
            </select>
          </div>

          {/* Sort Order Button */}
          <div className="mt-3">
            <button
              onClick={() => setSortOrder(prev => (prev === "desc" ? "asc" : "desc"))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold shadow-sm hover:bg-slate-50"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortOrder === "desc" ? "↓ DESC" : "↑ ASC"}</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">USER</th>
                  <th className="py-3.5 px-4 font-semibold">HAKA ID</th>
                  <th className="py-3.5 px-4 font-semibold">PHONE / EMAIL</th>
                  <th className="py-3.5 px-4 font-semibold">PASSWORD</th>
                  <th className="py-3.5 px-4 font-semibold">ROLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => {
                  const cred = credentials[user.id] || { email: "", password: "" };

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* USER Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-indigo-600 font-bold flex items-center justify-center text-xs">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-[12px]">{user.name}</p>
                            <p className="text-[10px] text-slate-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* HAKA ID Column */}
                      <td className="py-3 px-4 font-semibold text-indigo-600">
                        {user.id}
                      </td>

                      {/* PHONE / EMAIL Column */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={cred.email}
                          onChange={e => handleInputChange(user.id, "email", e.target.value)}
                          placeholder="—"
                          className="w-56 px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-slate-200 rounded text-slate-600 text-xs outline-none"
                        />
                      </td>

                      {/* PASSWORD Column */}
                      <td className="py-3 px-4">
                        <input
                          type={showPasswords ? "text" : "password"}
                          value={cred.password}
                          onChange={e => handleInputChange(user.id, "password", e.target.value)}
                          placeholder="—"
                          className="w-32 px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-slate-200 rounded text-slate-600 text-xs outline-none"
                        />
                      </td>

                      {/* ROLE Column */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.badgeColor}`}>
                          {user.role}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
