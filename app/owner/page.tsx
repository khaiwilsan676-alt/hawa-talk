"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Shield, Lock, Mail, Save, Eye, EyeOff, Key, LogOut } from "lucide-react";
import { db } from "../../src/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export default function OwnerPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ownerPanelLoggedIn') === 'true';
    }
    return false;
  });
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState("official_id");
  const [saveMessage, setSaveMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginKey, setLoginKey] = useState("");
  const [loginError, setLoginError] = useState("");

  const defaultIdsData = {
    "500001": { email: "", password: "" },
    "500002": { email: "", password: "" },
    "500003": { email: "", password: "" },
    "500004": { email: "", password: "" },
    "500005": { email: "", password: "" },
    "700001": { email: "", password: "" },
    "700002": { email: "", password: "" },
    "700003": { email: "", password: "" },
  };

  const [idsData, setIdsData] = useState<Record<string, any>>(defaultIdsData);

  // Load from firestore
  useEffect(() => {
    const fetchCreds = async () => {
      try {
        const docRef = doc(db, "adminSettings", "credentials");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIdsData(docSnap.data().ownerPanelCredentials || defaultIdsData);
        } else {
          // If doc doesn't exist, try localstorage for backward compatibility or use default
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('ownerPanelCredentials');
            if (saved) {
              setIdsData(JSON.parse(saved));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching credentials:", error);
      }
    };
    fetchCreds();
  }, []);

  // Track online status
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Listen to sessions collection to get real-time online status
    const unsubscribes = Object.keys(idsData).map(id => {
      const docRef = doc(db, "adminSettings", `sessions_${id}`);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setOnlineStatus(prev => ({
            ...prev,
            [id]: docSnap.data().isLoggedIn === true
          }));
        } else {
          setOnlineStatus(prev => ({
            ...prev,
            [id]: false
          }));
        }
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [idsData]);

  const handleLogin = () => {
    if (loginUsername === "HAWA.IN" && loginPassword === "HAWA.OWNER/CEO" && loginKey === "25/7/2026") {
      setIsLoggedIn(true);
      setLoginError("");
      localStorage.setItem('ownerPanelLoggedIn', 'true');
    } else {
      setLoginError("Invalid credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('ownerPanelLoggedIn');
    setLoginUsername("");
    setLoginPassword("");
    setLoginKey("");
  };

  const handleChange = (id: string, field: string, value: string) => {
    setIdsData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async () => {
    try {
      const credentials: any[] = [];
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

      const docRef = doc(db, "adminSettings", "credentials");
      await setDoc(docRef, {
        ownerPanelCredentials: idsData,
        officialCredentials: credentials
      }, { merge: true });

      // Also set to localstorage for backward compatibility just in case
      localStorage.setItem('ownerPanelCredentials', JSON.stringify(idsData));
      localStorage.setItem('officialCredentials', JSON.stringify(credentials));

      setSaveMessage("Credentials saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving credentials:", error);
      setSaveMessage("Error saving credentials!");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  // ✅ Individual ID Logout
  const handleIDLogout = async (id: string) => {
    try {
      const docRef = doc(db, "adminSettings", `sessions_${id}`);
      await setDoc(docRef, {
        isLoggedIn: false,
        forceLogoutTimestamp: Date.now()
      }, { merge: true });

      // Clean local storage too just for good measure if we're on the same device
      const loggedInSessions = JSON.parse(localStorage.getItem('loggedInSessions') || '{}')
      delete loggedInSessions[id]
      localStorage.setItem('loggedInSessions', JSON.stringify(loggedInSessions))
      localStorage.removeItem(`session_${id}`)
      localStorage.removeItem(`user_data_${id}`)
      localStorage.setItem(`forceLogout_${id}`, Date.now().toString())

      setSaveMessage(`ID ${id} logged out successfully!`)
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      console.error(`Error logging out ID ${id}:`, error);
    }
  }

  // ✅ Group Logout
  const handleLogoutGroup = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const docRef = doc(db, "adminSettings", `sessions_${id}`);
        await setDoc(docRef, {
          isLoggedIn: false,
          forceLogoutTimestamp: Date.now()
        }, { merge: true });

        // Clean local storage too just for good measure
        const loggedInSessions = JSON.parse(localStorage.getItem('loggedInSessions') || '{}')
        delete loggedInSessions[id]
        localStorage.setItem('loggedInSessions', JSON.stringify(loggedInSessions))
        localStorage.removeItem(`session_${id}`)
        localStorage.removeItem(`user_data_${id}`)
        localStorage.setItem(`forceLogout_${id}`, Date.now().toString())
      }

      const groupName = ids[0].startsWith('5') ? 'Official' : 'Admin'
      setSaveMessage(`All ${groupName} IDs logged out successfully!`)
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      console.error(`Error logging out group:`, error);
    }
  }

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Owner Panel Login</h1>
            <p className="text-gray-500 text-sm mt-1">Enter credentials to continue</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                User Name
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="text"
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Key className="w-4 h-4" /> Key
              </label>
              <input
                type="text"
                placeholder="Enter key"
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition cursor-pointer mt-2"
            >
              Sign In
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            Owner Panel • Secure Access
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 relative flex flex-col min-w-[1024px] overflow-x-auto">
      
      {/* TOP NAVBAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition active:scale-95 cursor-pointer"
          >
            <Menu className="w-7 h-7 text-white" />
          </button>
          <h1 className="text-xl font-bold tracking-wide text-gray-900">Owner Control Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition cursor-pointer"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPasswords ? "Hide" : "Show"}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium text-red-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
            Logout
          </button>
          {saveMessage && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
              {saveMessage}
            </div>
          )}
        </div>
      </header>

      {/* DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="relative w-80 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-6 flex flex-col justify-between z-10 border-r border-slate-700">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-700 mb-6">
                <Shield className="w-6 h-6 text-yellow-400" />
                <span className="font-bold text-lg text-white">Owner Menu</span>
              </div>
              <button
                onClick={() => {
                  setActiveView("official_id");
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between px-5 py-4 bg-slate-700/50 hover:bg-slate-700 active:bg-blue-600 text-white font-semibold rounded-xl transition border border-slate-600 shadow-md cursor-pointer"
              >
                <span>MANAGE IDs</span>
                <span className="text-xs bg-yellow-400 text-black px-2.5 py-1 rounded-full font-bold">
                  Official/Admin
                </span>
              </button>
            </div>
            <div className="text-xs text-slate-500 text-center pb-2">
              Owner Panel
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 w-full max-w-5xl mx-auto overflow-y-auto bg-white">
        {activeView === "official_id" && (
          <div className="space-y-8">
            
            {/* OFFICIAL IDs */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-blue-600 tracking-wider uppercase flex items-center gap-2">
                  <Lock className="w-5 h-5" /> Official IDs
                </h2>
                <button
                  onClick={() => handleLogoutGroup(["500001", "500002", "500003", "500004", "500005"])}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout All Official
                </button>
              </div>

              <div className="space-y-3">
                {["500001", "500002", "500003", "500004", "500005"].map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-200"
                  >
                    <span className="w-24 text-sm font-bold text-blue-600">ID: {id}</span>
                    
                    {/* Email */}
                    <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Email"
                        value={idsData[id]?.email}
                        onChange={(e) => handleChange(id, "email", e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* Password */}
                    <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-300">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="Password"
                        value={idsData[id]?.password}
                        onChange={(e) => handleChange(id, "password", e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* ✅ STATUS + LOGOUT BUTTON */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        onlineStatus[id] 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {onlineStatus[id] ? 'Logined' : 'Offline'}
                      </span>
                      
                      <button
                        onClick={() => handleIDLogout(id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> LOGOUT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ADMIN IDs */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-purple-600 tracking-wider uppercase flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Admin IDs
                </h2>
                <button
                  onClick={() => handleLogoutGroup(["700001", "700002", "700003"])}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout All Admin
                </button>
              </div>

              <div className="space-y-3">
                {["700001", "700002", "700003"].map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-200"
                  >
                    <span className="w-24 text-sm font-bold text-purple-600">ID: {id}</span>
                    
                    {/* Email */}
                    <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Email"
                        value={idsData[id]?.email}
                        onChange={(e) => handleChange(id, "email", e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* Password */}
                    <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-300">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="Password"
                        value={idsData[id]?.password}
                        onChange={(e) => handleChange(id, "password", e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* ✅ STATUS + LOGOUT BUTTON */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        onlineStatus[id] 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {onlineStatus[id] ? 'Logined' : 'Offline'}
                      </span>
                      
                      <button
                        onClick={() => handleIDLogout(id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> LOGOUT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-5 h-5" /> Save All Credentials
            </button>

          </div>
        )}
      </main>
    </div>
  );
}

