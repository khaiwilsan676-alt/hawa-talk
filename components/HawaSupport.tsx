"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";

export default function HawaSupport() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial welcome message - Bilingual
  useEffect(() => {
    const welcomeMessage = {
      text: "Hi, Welcome to Hawa | नमस्ते, हवा में आपका स्वागत है\n\nI'm Daisy AI Hawa Customer Support | मैं Daisy AI हवा कस्टमर सपोर्ट हूँ\n\nI'm glad to see you here! Tell me how we can help you with any suggestions or something related to the App. You can feel free to ask questions, I will assist you 😊\n\nआपको यहाँ देखकर खुशी हुई! ऐप से संबंधित किसी भी सुझाव या किसी भी चीज़ के लिए हम आपकी कैसे मदद कर सकते हैं, हमें बताएं। आप बेझिझक सवाल पूछ सकते हैं, मैं आपकी सहायता करूंगा 😊",
      isBot: true
    };
    setMessages([welcomeMessage]);
  }, []);

  // Bad words filter - Complete list with sex related words
  const containsBadWords = (text: string) => {
    const badWords = [
      // Hindi Gaalis
      "gand", "gandu", "gaand", "gaandu", "chut", "chutiya", "chutiyapa",
      "bhosdi", "bhonsdi", "bhosdike", "bhonsdike", "madarchod", "behenchod",
      "bhenchod", "lauda", "lund", "chuch", "chuchi", "chod", "chodu",
      "maa ka", "maa ki", "bhen ka", "bhen ki", "behen ka", "behen ki",
      "teri maa", "teri bhen", "bhosdiwala", "bhonsdiwala",
      "hijda", "hijra", "kutta", "kutiya", "kamina", "harami",
      "suar", "sawar", "bhak", "bhak cho", "bc", "mc", "bkc",
      
      // English Gaalis
      "fuck", "shit", "asshole", "bitch", "bastard", "cunt",
      "dick", "pussy", "whore", "slut", "motherfucker",
      "ass", "damn", "hell", "piss", "cock", "tits", "boobs",
      "nigger", "nigga", "rape", "pedo", "child porn",
      
      // Sex related words
      "sex", "sexy", "xxx", "porn", "porno", "adult", "nude", "naked",
      "hot", "horny", "kiss", "makeout", "fingering", "blowjob", "handjob",
      "cum", "sperm", "orgasm", "erotic", "kamasutra", "position",
      "lingerie", "strip", "stripper", "escort", "hooker", "prostitute",
      "rape", "molest", "harass", "pervert", "creep", "stalk",
      
      // Hindi sex related
      "chudai", "chud", "chudwa", "sex karna", "sex kar", "bina kapde",
      "nanga", "nangi", "kapde utar", "kapde utaro", "hath lagao",
      "chu", "chumma", "kiss", "romance", "romantic"
    ];
    const lowerText = text.toLowerCase();
    return badWords.some(word => lowerText.includes(word));
  };

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
    
    // Seller related
    if (msg.includes("seller") || msg.includes("लेना") || msg.includes("seller lene") || 
        msg.includes("बेचना") || msg.includes("earn") || msg.includes("कमाना") || msg.includes("selling")) {
      return isHindi
        ? "आप हमारे ऑफिशियल से बात करके Seller ले सकते हैं।\n\nSeller लेने से आपको कई Benefits होंगे:\n• आप Coins Sell करके Earn कर सकते हैं\n• आपको Special Discounts मिलेंगे\n\nक्या आप Seller लेना चाहेंगे? मैं आपको ऑफिशियल से Connect करवा सकता हूँ।"
        : "You can take Seller by talking to our Official.\n\nBenefits of taking Seller:\n• You can Earn by Selling Coins\n• You'll get Special Discounts\n\nWould you like to take Seller? I can connect you with our Official.";
    }
    
    // What is Hawa
    if (msg.includes("hawa kya") || msg.includes("what is hawa") || msg.includes("hawa hai") || 
        msg.includes("app kya") || msg.includes("what is this app") || msg.includes("about hawa")) {
      return isHindi
        ? "Hawa एक Social Dating Live Party App है! 🎉\n\nयहाँ आप कर सकते हैं:\n• Like-minded People से Connect हो सकते हैं\n• Games खेल सकते हैं\n• New Friends बना सकते हैं\n• Interesting Events में Participate कर सकते हैं\n• Rewards और Coins Earn कर सकते हैं\n\n💰 Earning के बारे में:\nHawa Party App है, Earning App नहीं है।\nलेकिन अगर आप Seller लेते हैं तो आप Coins Sell करके Earn कर सकते हैं! 😊"
        : "Hawa is a Social Dating Live Party App! 🎉\n\nHere you can:\n• Connect with Like-minded People\n• Play Games\n• Make New Friends\n• Participate in Interesting Events\n• Earn Rewards and Coins\n\n💰 About Earning:\nHawa is a Party App, not an Earning App.\nBut if you take Seller, you can Earn by Selling Coins! 😊";
    }
    
    // Earning related
    if (msg.includes("earning") || msg.includes("earning app") || msg.includes("कमाई") || 
        msg.includes("पैसा") || msg.includes("money") || msg.includes("earn money")) {
      return isHindi
        ? "Hawa Earning App नहीं है, यह एक Party App है! 🎉\n\nलेकिन अगर आप Seller लेते हैं तो आप Coins Sell करके Earn कर सकते हैं।\n\nSeller लेने के लिए आप हमारे Official से बात कर सकते हैं।"
        : "Hawa is not an Earning App, it's a Party App! 🎉\n\nBut if you take Seller, you can Earn by Selling Coins.\n\nYou can talk to our Official to take Seller.";
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
        ? "हवा ऐप में कई शानदार फीचर्स हैं! 🎉\n\n• Live Party\n• Dating\n• Games\n• Friends\n• Events\n• Rewards\n\nक्या आप किसी विशेष फीचर के बारे में जानना चाहेंगे?"
        : "Hawa app has many amazing features! 🎉\n\n• Live Party\n• Dating\n• Games\n• Friends\n• Events\n• Rewards\n\nWould you like to know about any specific feature?";
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
    
    // Check for bad words before sending
    if (containsBadWords(message)) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      setMessage("");
      return;
    }
    
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
          {/* Back Arrow Icon - Goes Back */}
          <button onClick={() => window.history.back()} className="p-1 hover:bg-white/20 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Daisy Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center border-2 border-white/30 shadow-lg overflow-hidden">
            <img 
              src="/1785612362650~2.jpg" 
              alt="Daisy" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title / Name */}
          <div>
            <h1 className="font-semibold text-lg leading-tight">Daisy</h1>
            <span className="text-xs text-blue-100 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Online
            </span>
          </div>
        </div>
      </header>

      {/* 2. CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-0 relative">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-2 ${msg.isBot ? '' : 'flex-row-reverse'}`}>
            {msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                <img 
                  src="/1785612362650~2.jpg" 
                  alt="Daisy" 
                  className="w-full h-full object-cover"
                />
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
              <img 
                src="/1785612362650~2.jpg" 
                alt="Daisy" 
                className="w-full h-full object-cover"
              />
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
        
        {/* Warning Toast */}
        {showWarning && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
             You can't type wrong words!
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* 3. BOTTOM INPUT BAR - White with no extra padding */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 m-3 shadow-inner">
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
