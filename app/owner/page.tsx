"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, Shield, Lock, Mail, Save, Eye, EyeOff, Key, LogOut, Star, MessageSquare, Trash2, RefreshCw, Bot, ChevronDown, ChevronUp } from "lucide-react";


export default function OwnerPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('ownerPanelLoggedIn') === 'true');
    }
  }, []);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState("official_id");
  const [saveMessage, setSaveMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginKey, setLoginKey] = useState("");
  const [loginError, setLoginError] = useState("");

  // Feedback States
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // AI Chat States
  const [aiChats, setAiChats] = useState<any[]>([]);
  const [loadingAiChats, setLoadingAiChats] = useState(false);
  const [expandedChats, setExpandedChats] = useState<Record<string, boolean>>({});

  const getDefaultIdsData = () => ({
    "100002": { email: "", password: "" },
    "100003": { email: "", password: "" },
    "500001": { email: "", password: "" },
    "500002": { email: "", password: "" },
    "500003": { email: "", password: "" },
    "500004": { email: "", password: "" },
    "500005": { email: "", password: "" },
    "700001": { email: "", password: "" },
    "700002": { email: "", password: "" },
    "700003": { email: "", password: "" },
  });

  const [idsData, setIdsData] = useState<Record<string, any>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ownerPanelCredentials");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return getDefaultIdsData();
  });

  const focusedField = useRef<string | null>(null);
  const isDirtied = useRef(false);
  const isLoadedFromGoogleSheet = useRef(false);

  // ===============================
  // GOOGLE SHEET DATABASE
  // ===============================

  const loadOwnerCredentials = async () => {
    try {
      const { getOwnerCredentials } = await import("@/src/lib/googleSheet");
      const result = await getOwnerCredentials();

      if (result?.success && result?.credentials) {
        const mergedData = getDefaultIdsData();

        Object.keys(mergedData).forEach((id) => {
          if (result.credentials[id]) {
            mergedData[id] = {
              email: result.credentials[id].email || "",
              password: result.credentials[id].password || "",
            };
          }
        });

        setIdsData(mergedData);
        localStorage.setItem(
          "ownerPanelCredentials",
          JSON.stringify(mergedData)
        );
      }

      isLoadedFromGoogleSheet.current = true;
    } catch (error) {
      console.error("Google Sheet credentials error:", error);
      isLoadedFromGoogleSheet.current = true;
    }
  };

  useEffect(() => {
    loadOwnerCredentials();
  }, []);

  // Track online status
  const [onlineStatus, setOnlineStatus] =
    useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const { getSession } = await import("@/src/lib/googleSheet");

        const result: Record<string, boolean> = {};

        for (const id of Object.keys(idsData)) {
          try {
            const response = await getSession(id);
            result[id] = response?.session?.isLoggedIn === true;
          } catch {
            result[id] = false;
          }
        }

        setOnlineStatus(result);
      } catch (error) {
        console.error("Google Sheet session error:", error);
      }
    };

    if (Object.keys(idsData).length > 0) {
      loadSessions();
    }
  }, [idsData]);

  // Load Feedbacks
  const loadFeedbacks = async () => {
    setLoadingFeedbacks(true);

    try {
      const { getFeedbacks } = await import("@/src/lib/googleSheet");
      const result = await getFeedbacks();

      if (result?.success) {
        const list = Array.isArray(result.feedbacks)
          ? result.feedbacks
          : [];

        setFeedbacks(list);
      }
    } catch (error) {
      console.error("Error loading feedbacks:", error);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  // Load AI Chats
  const loadAiChats = async () => {
    setLoadingAiChats(true);

    try {
      const { getAiChats } = await import("@/src/lib/googleSheet");
      const result = await getAiChats();

      if (result?.success) {
        const list = Array.isArray(result.aiChats)
          ? result.aiChats
          : [];

        setAiChats(list);
      }
    } catch (error) {
      console.error("Error loading AI chats:", error);
    } finally {
      setLoadingAiChats(false);
    }
  };

  // Auto-delete feedbacks older than 48 hours
  useEffect(() => {
    if (activeView !== "moderator") return;

    loadFeedbacks();

    const interval = setInterval(() => {
      loadFeedbacks();
    }, 600000);

    return () => clearInterval(interval);
  }, [activeView]);

  // Load feedbacks / AI chats when switching views
  useEffect(() => {
    if (activeView === "moderator") {
      loadFeedbacks();
    } else if (activeView === "hawa_ai") {
      loadAiChats();
    }
  }, [activeView]);

  const handleSave = useCallback(
    async (customData?: Record<string, any>) => {
      try {
        const targetData = customData || idsData;

        const credentials: any[] = [];

        Object.entries(targetData).forEach(
          ([id, data]: [string, any]) => {
            const email = (data.email || "").trim();
            const password = (data.password || "").trim();

            if (email && password) {
              credentials.push({
                id,
                email,
                password,
                type: id.startsWith("5")
                  ? "official"
                  : id.startsWith("7")
                    ? "admin"
                    : "special",
              });
            }
          }
        );

        const { saveOwnerCredentials } =
          await import("@/src/lib/googleSheet");

        const result = await saveOwnerCredentials({
          ownerPanelCredentials: targetData,
          officialCredentials: credentials,
        });

        if (!result?.success) {
          throw new Error(
            result?.error || "Google Sheet save failed"
          );
        }

        localStorage.setItem(
          "ownerPanelCredentials",
          JSON.stringify(targetData)
        );

        localStorage.setItem(
          "officialCredentials",
          JSON.stringify(credentials)
        );

        setSaveMessage("Credentials saved!");

        setTimeout(() => setSaveMessage(""), 3000);
      } catch (error) {
        console.error("Error saving credentials:", error);
        setSaveMessage("Error saving credentials!");

        setTimeout(() => setSaveMessage(""), 3000);
      }
    },
    [idsData]
  );

  const handleChange = (
    id: string,
    field: string,
    value: string
  ) => {
    isDirtied.current = true;

    setIdsData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleIDLogout = async (id: string) => {
    try {
      const { updateSession } =
        await import("@/src/lib/googleSheet");

      await updateSession(id, {
        isLoggedIn: false,
        forceLogoutTimestamp: Date.now(),
      });

      const loggedInSessions = JSON.parse(
        localStorage.getItem("loggedInSessions") || "{}"
      );

      delete loggedInSessions[id];

      localStorage.setItem(
        "loggedInSessions",
        JSON.stringify(loggedInSessions)
      );

      localStorage.removeItem(`session_${id}`);
      localStorage.removeItem(`user_data_${id}`);
      localStorage.setItem(
        `forceLogout_${id}`,
        Date.now().toString()
      );

      setOnlineStatus((prev) => ({
        ...prev,
        [id]: false,
      }));

      setSaveMessage(
        `ID ${id} logged out successfully!`
      );

      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error(
        `Error logging out ID ${id}:`,
        error
      );
    }
  };

  const handleLogoutGroup = async (ids: string[]) => {
    try {
      const { updateSession } =
        await import("@/src/lib/googleSheet");

      await Promise.all(
        ids.map((id) =>
          updateSession(id, {
            isLoggedIn: false,
            forceLogoutTimestamp: Date.now(),
          })
        )
      );

      const loggedInSessions = JSON.parse(
        localStorage.getItem("loggedInSessions") || "{}"
      );

      ids.forEach((id) => {
        delete loggedInSessions[id];

        localStorage.removeItem(`session_${id}`);
        localStorage.removeItem(`user_data_${id}`);

        localStorage.setItem(
          `forceLogout_${id}`,
          Date.now().toString()
        );
      });

      localStorage.setItem(
        "loggedInSessions",
        JSON.stringify(loggedInSessions)
      );

      setOnlineStatus((prev) => {
        const next = { ...prev };

        ids.forEach((id) => {
          next[id] = false;
        });

        return next;
      });

      setSaveMessage(
        "Selected IDs logged out successfully!"
      );

      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error logging out group:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (timestamp: number) => {
    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    const expiryTime = timestamp + fortyEightHours;
    const remaining = expiryTime - now;

    if (remaining <= 0) return "Expired";

    const hours = Math.floor(
      remaining / (60 * 60 * 1000)
    );

    const minutes = Math.floor(
      (remaining % (60 * 60 * 1000)) /
        (60 * 1000)
    );

    return `${hours}h ${minutes}m remaining`;
  };

  const handleDeleteFeedback = async (
    feedbackId: string
  ) => {
    try {
      const { deleteFeedback } =
        await import("@/src/lib/googleSheet");

      const result = await deleteFeedback(feedbackId);

      if (!result?.success) {
        throw new Error(
          result?.error || "Delete failed"
        );
      }

      setFeedbacks((prev) =>
        prev.filter((f) => f.id !== feedbackId)
      );

      setSaveMessage("Feedback deleted!");

      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error(
        "Error deleting feedback:",
        error
      );
    }
  };

  const toggleChatExpansion = (chatId: string) => {
    setExpandedChats((prev) => ({
      ...prev,
      [chatId]: !prev[chatId],
    }));
  };

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Owner Panel Login</h1>
            <p className="text-gray-500 text-sm mt-1">Enter credentials to continue</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">User Name</label>
              <input
                type="text"
                placeholder="Enter username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
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
                type="password"
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
              onClick={() => window.location.href = "/"}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition cursor-pointer mt-2"
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
    <div className="min-h-screen bg-gray-50">
      
      {/* TOP NAVBAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition cursor-pointer"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Owner Control Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          {activeView === "official_id" && (
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition cursor-pointer"
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPasswords ? "Hide Passwords" : "Show Passwords"}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <X className="w-4 h-4" />
            Logout
          </button>
          {saveMessage && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
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
            className="fixed inset-0 bg-black/40"
          />
          <div className="relative w-80 h-full bg-gray-900 p-6 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-700 mb-6">
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-lg text-white">Owner Menu</span>
              </div>
              
              <button
                onClick={() => { setActiveView("official_id"); setIsDrawerOpen(false); }}
                className={`w-full text-left px-5 py-4 rounded-xl transition cursor-pointer mb-3 ${
                  activeView === "official_id" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Manage IDs
              </button>
              
              <button
                onClick={() => { setActiveView("moderator"); setIsDrawerOpen(false); }}
                className={`w-full text-left px-5 py-4 rounded-xl transition cursor-pointer mb-3 ${
                  activeView === "moderator" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Moderator (Feedbacks)
              </button>
              
              <button
                onClick={() => { setActiveView("hawa_ai"); setIsDrawerOpen(false); }}
                className={`w-full text-left px-5 py-4 rounded-xl transition cursor-pointer ${
                  activeView === "hawa_ai" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                HAWA AI (Chats)
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Owner Panel v1.0
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="p-8">
        
        {/* HAWA AI VIEW */}
        {activeView === "hawa_ai" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Bot className="w-7 h-7 text-purple-600" />
                HAWA AI Conversations
              </h2>
              <button
                onClick={loadAiChats}
                disabled={loadingAiChats}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingAiChats ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {loadingAiChats ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-4" />
                <p className="text-gray-500">Loading conversations...</p>
              </div>
            ) : aiChats.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Bot className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiChats.map((chat) => (
                  <div key={chat.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleChatExpansion(chat.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{chat.userName || "Unknown User"}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {chat.userEmail} • {formatDate(chat.timestamp)} • {chat.messages?.length || 0} messages
                        </p>
                      </div>
                      {expandedChats[chat.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedChats[chat.id] && (
                      <div className="border-t p-5 bg-gray-50 max-h-96 overflow-y-auto space-y-3">
                        {chat.messages?.map((msg: any, i: number) => (
                          <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${
                              msg.isBot ? 'bg-white border' : 'bg-blue-500 text-white'
                            }`}>
                              <p className="text-sm whitespace-pre-line">{msg.text}</p>
                              {msg.timestamp && (
                                <p className={`text-xs mt-1 ${msg.isBot ? 'text-gray-400' : 'text-blue-200'}`}>
                                  {formatDate(msg.timestamp)}
                                </p>
                              )}
                            </div>
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

        {/* MODERATOR VIEW */}
        {activeView === "moderator" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-blue-600" />
                Feedback Submissions
              </h2>
              <button
                onClick={loadFeedbacks}
                disabled={loadingFeedbacks}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingFeedbacks ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
              Feedbacks auto-delete after 48 hours
            </div>

            {loadingFeedbacks ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-500">Loading feedbacks...</p>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No feedback yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                          feedback.type === 'app_bug' ? 'bg-red-100 text-red-700' :
                          feedback.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {feedback.typeLabel || feedback.type}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(feedback.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-orange-500">{getTimeRemaining(feedback.timestamp)}</span>
                        <button onClick={() => handleDeleteFeedback(feedback.id)} className="p-2 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{feedback.description}</p>
                    <p className="text-sm text-gray-500">{feedback.contactInfo}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MANAGE IDs VIEW */}
        {activeView === "official_id" && (
          <div className="space-y-8 max-w-5xl mx-auto">
            
            {/* Special Official IDs */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-amber-600 flex items-center gap-2">
                  <Star className="w-5 h-5" /> Special Official IDs
                </h2>
                <button
                  onClick={() => handleLogoutGroup(["100002", "100003"])}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Logout All Special
                </button>
              </div>

              {["100002", "100003"].map((id) => (
                <div key={id} className="flex items-center gap-4 mb-3 last:mb-0 bg-gray-50 p-4 rounded-xl">
                  <span className="w-24 text-sm font-bold text-amber-600">ID: {id}</span>
                  <input
                    type="text"
                    placeholder="Email"
                    value={idsData[id]?.email || ""}
                    onChange={(e) => handleChange(id, "email", e.target.value)}
                    onFocus={() => focusedField.current = `${id}-email`}
                    onBlur={() => focusedField.current = null}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-amber-500"
                  />
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="Password"
                    value={idsData[id]?.password || ""}
                    onChange={(e) => handleChange(id, "password", e.target.value)}
                    onFocus={() => focusedField.current = `${id}-password`}
                    onBlur={() => focusedField.current = null}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-amber-500"
                  />
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    onlineStatus[id] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {onlineStatus[id] ? 'Online' : 'Offline'}
                  </span>
                  <button
                    onClick={() => handleIDLogout(id)}
                    className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ))}
            </div>

            {/* Official IDs */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <Lock className="w-5 h-5" /> Official IDs
                </h2>
                <button
                  onClick={() => handleLogoutGroup(["500001", "500002", "500003", "500004", "500005"])}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Logout All Official
                </button>
              </div>

              {["500001", "500002", "500003", "500004", "500005"].map((id) => (
                <div key={id} className="flex items-center gap-4 mb-3 last:mb-0 bg-gray-50 p-4 rounded-xl">
                  <span className="w-24 text-sm font-bold text-blue-600">ID: {id}</span>
                  <input
                    type="text"
                    placeholder="Email"
                    value={idsData[id]?.email || ""}
                    onChange={(e) => handleChange(id, "email", e.target.value)}
                    onFocus={() => focusedField.current = `${id}-email`}
                    onBlur={() => focusedField.current = null}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="Password"
                    value={idsData[id]?.password || ""}
                    onChange={(e) => handleChange(id, "password", e.target.value)}
                    onFocus={() => focusedField.current = `${id}-password`}
                    onBlur={() => focusedField.current = null}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    onlineStatus[id] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {onlineStatus[id] ? 'Online' : 'Offline'}
                  </span>
                  <button
                    onClick={() => handleIDLogout(id)}
                    className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ))}
            </div>

            {/* Admin IDs */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-purple-600 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Admin IDs
                </h2>
                <button
                  onClick={() => handleLogoutGroup(["700001", "700002", "700003"])}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Logout All Admin
                </button>
              </div>

              {["700001", "700002", "700003"].map((id) => (
                <div key={id} className="flex items-center gap-4 mb-3 last:mb-0 bg-gray-50 p-4 rounded-xl">
                  <span className="w-24 text-sm font-bold text-purple-600">ID: {id}</span>
                  <input
                    type="text"
                    placeholder="Email"
                    value={idsData[id]?.email || ""}
                    onChange={(e) => handleChange(id, "email", e.target.value)}
                    onFocus={() => focusedField.current = `${id}-email`}
                    onBlur={() => focusedField.current = null}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
                  />
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="Password"
                    value={idsData[id]?.password || ""}
                    onChange={(e) => handleChange(id, "password", e.target.value)}
                    onFocus={() => focusedField.current = `${id}-password`}
                    onBlur={() => focusedField.current = null}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
                  />
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    onlineStatus[id] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {onlineStatus[id] ? 'Online' : 'Offline'}
                  </span>
                  <button
                    onClick={() => handleIDLogout(id)}
                    className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <button
              onClick={() => {
                handleSave();
                isDirtied.current = false;
              }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-5 h-5" /> Save All Credentials
            </button>

          </div>
        )}
      </main>
    </div>
  );
                     }
