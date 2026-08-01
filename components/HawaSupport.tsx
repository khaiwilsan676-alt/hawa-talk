"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Bot, Send } from "lucide-react";

export default function HawaSupport() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial welcome message - Bilingual
  useEffect(() => {
    const welcomeMessage = {
      text: "Hi, Welcome to Hawa | नमस्ते, हवा में आपका स्वागत है\n\nI'm Kim AI Hawa Customer Support | मैं किम AI हवा कस्टमर सपोर्ट हूँ\n\nI'm glad to see you here! Tell me how we can help you with any suggestions or something related to the App. You can feel free to ask questions, I will assist you 😊\n\nआपको यहाँ देखकर खुशी हुई! ऐप से संबंधित किसी भी सुझाव या किसी भी चीज़ के लिए हम आपकी कैसे मदद कर सकते हैं, हमें बताएं। आप बेझिझक सवाल पूछ सकते हैं, मैं आपकी सहायता करूंगा 😊",
      isBot: true
    };
    setMessages([welcomeMessage]);
  }, []);

  // Language detection and response generation
  const generateBotResponse = (userMsg: string) => {
    const msg = userMsg.toLowerCase().trim();
    
    // Detect language (Hindi or English)
    const isHindi = /[\u0900-\u097F]/.test(msg);
    
    // Greetings
    if (msg.includes("hi") || msg.includes("hello") || msg.includes("hlw") || 
        msg.includes("नमस्ते") || msg.includes("नमस्कार") || msg.includes("हैलो")) {
      return isHindi 
        ? "नमस्ते! हवा सपोर्ट में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ? 😊"
        : "Hi! Welcome to Hawa Support. How can I assist you today? 😊";
    }
    
    // Official query
    if (msg.includes("official") || msg.includes("who is") || msg.includes("officer") || 
        msg.includes("अधिकारी") || msg.includes("कौन") || msg.includes("मालिक")) {
      return isHindi
        ? "हवा के मुख्य अधिकारी हैं:\n• Hawa_IN\n  ID: 100002\n• Paras\n  ID: 100003\n\nक्या आप किसी विशेष अधिकारी से बात करना चाहेंगे?"
        : "The main officials of Hawa are:\n• Hawa_IN\n  ID: 100002\n• Paras\n  ID: 100003\n\nWould you like to talk to any specific official?";
    }
    
    // App related
    if (msg.includes("app") || msg.includes("feature") || msg.includes("update") || 
        msg.includes("ऐप") || msg.includes("फीचर") || msg.includes("अपडेट")) {
      return isHindi
        ? "हवा ऐप में कई शानदार फीचर्स हैं! क्या आप किसी विशेष फीचर के बारे में जानना चाहेंगे? मैं आपको पूरी जानकारी दे सकता हूँ।"
        : "Hawa app has many amazing features! Would you like to know about any specific feature? I can give you complete information.";
    }
    
    // Problem/Help
    if (msg.includes("problem") || msg.includes("issue") || msg.includes("help") || 
        msg.includes("समस्या") || msg.includes("मदद") || msg.includes("सहायता")) {
      return isHindi
        ? "मुझे आपकी समस्या सुनकर दुख हुआ। कृपया मुझे विस्तार से बताएं, मैं आपकी पूरी मदद करूंगा। हमारी टीम 24/7 आपके साथ है।"
        : "I'm sorry to hear about your problem. Please tell me in detail, I will help you completely. Our team is available 24/7.";
    }
    
    // Default response
    return isHindi
      ? "आपके संदेश के लिए धन्यवाद! हमारी सपोर्ट टीम जल्द ही आपसे संपर्क करेगी। तब तक, ऐप के बारे में कोई भी प्रश्न पूछने में संकोच न करें। 😊"
      : "Thank you for your message! Our support team will get back to you shortly. In the meantime, feel free to ask any questions about the app. 😊";
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = { text: message, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(message);
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
      setIsTyping(false);
    }, 1000);
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
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Online | ऑनलाइन
            </span>
          </div>
        </div>
      </header>

      {/* 2. CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-2 ${msg.isBot ? '' : 'flex-row-reverse'}`}>
            {msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.isBot ? 'bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-100' : 'bg-blue-500 text-white rounded-2xl rounded-tr-none'} p-3`}>
              <p className={`text-sm whitespace-pre-line ${msg.isBot ? 'text-slate-700' : 'text-white'}`}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-100 p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 3. BOTTOM INPUT BAR - Grey Square */}
      <div className="p-3 bg-gray-200 border-t border-gray-300 shadow-lg pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-inner">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message... | अपना संदेश लिखें..."
            className="flex-1 outline-none text-sm text-slate-800 bg-transparent"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="p-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-full transition-all flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
                                                           }
