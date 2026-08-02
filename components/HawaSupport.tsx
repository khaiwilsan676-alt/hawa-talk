"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";

interface HawaSupportProps {
  onBack?: () => void;
}

export default function HawaSupport({ onBack }: HawaSupportProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = {
      text: "Welcome to Hawa Support! 👋\n\nI'm Daisy, your AI Customer Support Assistant.\n\nHow may I assist you today? Feel free to ask any questions related to the Hawa App — I'm here to help! 😊",
      isBot: true
    };
    setMessages([welcomeMessage]);
  }, []);

  // Bad words filter
  const containsBadWords = (text: string) => {
    const badWords = [
      "gand", "gandu", "gaand", "gaandu", "chut", "chutiya", "chutiyapa", "chutiye",
      "bhosdi", "bhonsdi", "bhosdike", "bhonsdike", "bhosdiwala", "bhonsdiwala",
      "madarchod", "madar chod", "maadar chod", "mc",
      "behenchod", "bhenchod", "behanchod", "bahanchod", "bhen chod", "behen chod",
      "lauda", "lund", "loda", "laude", "lod", "lodu",
      "chuch", "chuchi", "chuchiya", "chuche",
      "chod", "chodu", "chodna", "chodne", "choda", "chodi",
      "maa ka", "maa ki", "ma ka", "ma ki", "teri maa", "teri ma",
      "bhen ka", "bhen ki", "behen ka", "behen ki", "teri bhen", "teri behen",
      "hijda", "hijra", "hijde", "chhakka", "chhakke", "kinnar",
      "kutta", "kutiya", "kutti", "kamine", "kamina", "kaminey",
      "harami", "haramkhor", "haraami", "haramzaada", "haramzada",
      "suar", "sawar", "suvar", "sowar", "bhains", "bhainsa",
      "bhak", "bhak cho", "bc", "bkc", "bkl", "bsdk",
      "lavda", "lavde", "lwda", "lwde", "lawda", "lawde",
      "randi", "raand", "rand", "randi khana", "randikhana", "randikhane",
      "randibaaz", "randibaz", "randi baaz", "randiya", "randiyo",
      "randi sali", "randi saali", "randi bhen", "randi behen",
      "randi maa", "randi ma", "teri randi", "teri raand",
      "fuck", "fucker", "fucking", "fucked",
      "shit", "shitty", "bullshit",
      "asshole", "ass", "arse", "arsehole",
      "bitch", "bitching", "bitchy", "bastard",
      "cunt", "dick", "dickhead", "pussy", "whore", "slut", "motherfucker",
      "cock", "tits", "boobs", "nigger", "nigga",
      "sex", "sexy", "xxx", "porn", "porno", "nude", "naked",
      "horny", "blowjob", "handjob", "cum", "sperm", "orgasm",
      "rape", "molest", "harass", "pedo", "child porn",
      "chudai", "chud", "chudwa", "nanga", "nangi",
      "r4ndi", "r@ndi", "rand1", "f*ck", "f**k", "f u c k",
      "sh*t", "sh1t", "b*tch", "b1tch", "a$$", "@ss", "d!ck", "p*ssy",
    ];
    
    const lowerText = text.toLowerCase();
    const noSpaceText = lowerText.replace(/\s+/g, '');
    
    return badWords.some(word => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
      return lowerText.includes(word) || noSpaceText.includes(cleanWord);
    });
  };

  // Professional response generation
  const generateBotResponse = (userMsg: string) => {
    const msg = userMsg.toLowerCase().trim();
    const isHindi = /[\u0900-\u097F]/.test(msg);

    // GREETINGS
    if (msg.includes("hi") || msg.includes("hello") || msg.includes("hlw") || 
        msg.includes("hey") || msg.includes("नमस्ते") || msg.includes("नमस्कार") ||
        msg.includes("good morning") || msg.includes("good evening")) {
      return isHindi
        ? "नमस्ते! 🙏\n\nहवा सपोर्ट में आपका स्वागत है।\n\nमैं Daisy हूँ, आपकी AI कस्टमर सपोर्ट असिस्टेंट।\n\nकृपया बताएं मैं आपकी किस प्रकार सहायता कर सकती हूँ?"
        : "Hello! 👋\n\nWelcome to Hawa Support. I'm Daisy, your AI Customer Support Assistant.\n\nPlease let me know how I can assist you today.";
    }

    // THANK YOU
    if (msg.includes("thank") || msg.includes("thanks") || msg.includes("thx") ||
        msg.includes("धन्यवाद") || msg.includes("शुक्रिया")) {
      return isHindi
        ? "आपका स्वागत है! 😊\n\nहमें मदद करके खुशी हुई।\n\nअगर आपको किसी और चीज़ की ज़रूरत हो तो कृपया बेझिझक पूछें।"
        : "You're welcome! 😊\n\nGlad I could help you.\n\nIf you need anything else, please feel free to ask.";
    }

    // ONLINE RECHARGE
    if (msg.includes("recharge") || msg.includes("coin") || msg.includes("buy coin") ||
        msg.includes("purchase") || msg.includes("रिचार्ज") || msg.includes("सिक्का") ||
        msg.includes("खरीद") || msg.includes("payment") || msg.includes("pay") ||
        msg.includes("google play") || msg.includes("phonepay") || msg.includes("paytm")) {
      return "💎 **How to Recharge Coins Online**\n\n" +
             "Follow these simple steps:\n\n" +
             "📌 **Step 1:** Go to your **Profile** section.\n" +
             "📌 **Step 2:** Tap on the **Coins** option.\n" +
             "📌 **Step 3:** You will see various **Coin Packages** and the **Recharge** option.\n" +
             "📌 **Step 4:** Select your preferred package and proceed.\n\n" +
             "💳 **Accepted Payment Methods:**\n" +
             "• Google Play\n" +
             "• PhonePe\n" +
             "• Paytm\n" +
             "• Official Website Recharge\n\n" +
             "✅ Once payment is successful, coins will be credited instantly.\n\n" +
             "🔹 **Need a Coin Seller?**\n" +
             "Contact our Official Team for seller details, payment screenshot & User ID verification.";
    }

    // ROOM MUSIC
    if (msg.includes("music") || msg.includes("song") || msg.includes("play music") ||
        msg.includes("music play") || msg.includes("room music") || msg.includes("संगीत") ||
        msg.includes("गाना") || msg.includes("म्यूजिक") || msg.includes("dj")) {
      return "🎵 **How to Play Music in Your Room**\n\n" +
             "📌 **Step 1:** Open your room.\n" +
             "📌 **Step 2:** At the bottom, tap on the **4-Grid Option** (four square icon).\n" +
             "📌 **Step 3:** Tap on **Music Play** option.\n" +
             "📌 **Step 4:** Select your music, add it, and press **Play**.\n\n" +
             "🎶 Enjoy the music with your room members!";
    }

    // PLAY GAMES
    if (msg.includes("game") || msg.includes("play game") || msg.includes("खेल") ||
        msg.includes("गेम") || msg.includes("khel") || msg.includes("gaming")) {
      return "🎮 **How to Play Games & Win Coins**\n\n" +
             "📌 **Step 1:** Open your room.\n" +
             "📌 **Step 2:** At the bottom, tap on the **4-Grid Option**.\n" +
             "📌 **Step 3:** You will see **Game Remote** options.\n" +
             "📌 **Step 4:** Select any game and start playing.\n\n" +
             "🎯 Play more, win more! Enjoy with your friends!";
    }

    // CREATE ROOM
    if (msg.includes("create room") || msg.includes("open room") || msg.includes("new room") ||
        msg.includes("रूम") || msg.includes("कमरा") || msg.includes("room banao") ||
        msg.includes("room open") || msg.includes("room create") || msg.includes("room kholo")) {
      return "🏠 **How to Create Your Own Room**\n\n" +
             "📌 **Step 1:** Go to the **Homepage**.\n" +
             "📌 **Step 2:** At the top, tap on the **Mine** tab.\n" +
             "📌 **Step 3:** You will see a **+ Icon Card** — tap on it.\n" +
             "📌 **Step 4:** Now you can enter your own room and customize it.\n\n" +
             "🎉 Your room is ready! Invite friends and enjoy!";
    }

    // ABUSE / COMPLAINT
    if (msg.includes("abuse") || msg.includes("gali") || msg.includes("गाली") ||
        msg.includes("complain") || msg.includes("report") || msg.includes("शिकायत") ||
        msg.includes("bad word") || msg.includes("ban") || msg.includes("harass") ||
        msg.includes("गाली दे") || msg.includes("gali de")) {
      return "⚠️ **Reporting Abuse or Misconduct**\n\n" +
             "📌 **Step 1:** Go to **Help & Feedback** section.\n" +
             "📌 **Step 2:** Upload a **video or screenshot** as evidence.\n" +
             "📌 **Step 3:** Submit your complaint to our **Admin / Official Team**.\n\n" +
             "🚫 **Important Warning:**\n" +
             "• Do **NOT** respond with abusive language.\n" +
             "• If both parties use abuse, **both User IDs will be banned**.\n\n" +
             "📋 **Reason for Ban:** Violation of App Policy (Abusing)\n\n" +
             "✅ Report and let our team handle it professionally.";
    }

    // WHAT IS HAWA
    if (msg.includes("hawa kya") || msg.includes("what is hawa") || msg.includes("about hawa") ||
        msg.includes("hawa app") || msg.includes("app kya") || msg.includes("hawa kya hai")) {
      return "🌟 **About Hawa App**\n\n" +
             "Hawa is a **Social Dating & Live Party App** for entertainment and connecting with people.\n\n" +
             "✨ **Key Features:**\n" +
             "• Connect with like-minded people\n" +
             "• Host and join Live Parties\n" +
             "• Play interactive games\n" +
             "• Make new friends\n" +
             "• Earn rewards and coins\n\n" +
             "💰 For earning, you can become a **Seller** and sell coins.";
    }

    // SELLER INFO
    if (msg.includes("seller") || msg.includes("become seller") || msg.includes("earning") ||
        msg.includes("earn") || msg.includes("sell coin") || msg.includes("विक्रेता") ||
        msg.includes("कमाई") || msg.includes("seller lena") || msg.includes("seller banna")) {
      return "💼 **Become a Seller — Earn with Hawa**\n\n" +
             "✅ **Benefits:**\n" +
             "• Earn by selling coins to users\n" +
             "• Get exclusive discounts and offers\n" +
             "• Priority support from our team\n\n" +
             "📋 **How to Apply:**\n" +
             "Contact our Official Team. They will guide you through registration, pricing & payments.\n\n" +
             "Would you like me to connect you with an Official?";
    }

    // OFFICIALS
    if (msg.includes("official") || msg.includes("admin") || msg.includes("contact") ||
        msg.includes("officer") || msg.includes("अधिकारी") || msg.includes("मालिक") ||
        msg.includes("owner") || msg.includes("team")) {
      return "👑 **Hawa Official Team**\n\n" +
             "• **Hawa_IN**\n" +
             "  🆔 ID: 100002\n\n" +
             "• **Paras**\n" +
             "  🆔 ID: 100003\n\n" +
             "📞 Contact them for: Seller registration, payment issues, business inquiries & serious complaints.";
    }

    // FAMILY FEATURE
    if (msg.includes("family") || msg.includes("परिवार") || msg.includes("fam") ||
        msg.includes("family tag") || msg.includes("family create") || msg.includes("parivaar")) {
      return "👨‍👩‍👧‍👦 **Family Feature — Create Your Family**\n\n" +
             "📌 **How to Create:**\n" +
             "• **Step 1:** Go to your **Profile**.\n" +
             "• **Step 2:** Tap on the **Family** option.\n" +
             "• **Step 3:** Add your Family **Image** and **Name**.\n" +
             "• **Step 4:** Confirm and create.\n\n" +
             "💰 **Cost:** 13,00,000 Coins\n\n" +
             "🏷️ **Benefits:**\n" +
             "• Get a **Family Tag** on your public profile\n" +
             "• Invite members to join\n" +
             "• Exclusive family features";
    }

    // PROFILE EDIT (Name, DP, Bio, Age, Cover)
    if (msg.includes("name change") || msg.includes("dp change") || msg.includes("profile picture") ||
        msg.includes("bio") || msg.includes("cover") || msg.includes("age") ||
        msg.includes("name badlo") || msg.includes("dp badlo") || msg.includes("नाम") ||
        msg.includes("फोटो") || msg.includes("edit profile") || msg.includes("change name") ||
        msg.includes("change dp") || msg.includes("cover photo") || msg.includes("background")) {
      return "✏️ **How to Edit Your Profile**\n\n" +
             "📌 **Step 1:** Go to your **Profile**.\n" +
             "📌 **Step 2:** Tap on the **Top Right Arrow** option.\n" +
             "📌 **Step 3:** You will see your **Public Profile**.\n" +
             "📌 **Step 4:** Tap on the **Pencil Icon (✏️)** at top right corner.\n" +
             "📌 **Step 5:** Now you can edit:\n\n" +
             "✏️ • **Name** — Change your display name\n" +
             "🖼️ • **Profile Picture (DP)** — Upload new photo\n" +
             "📝 • **Bio** — Write about yourself\n" +
             "🎂 • **Age** — Update your age\n\n" +
             "🖼️ **Background Cover Photo:**\n" +
             "• Cover photo unlocks at **Level 24**.\n" +
             "• After Level 24, go to same Pencil Icon > Upload Cover.";
    }

    // WALLET / BALANCE
    if (msg.includes("wallet") || msg.includes("balance") || msg.includes("बटुआ") ||
        msg.includes("बैलेंस") || msg.includes("coin balance") || msg.includes("check balance")) {
      return "💰 **Wallet & Balance**\n\n" +
             "📌 **Check Balance:** Go to Profile > My Wallet / Coins.\n" +
             "📌 **Transaction History:** Inside Wallet, tap on 'History'.\n" +
             "📌 **Withdraw:** Available for Sellers in Wallet > Withdraw.\n\n" +
             "💎 Balance updates in real-time after every transaction.";
    }

    // BLOCK / UNBLOCK
    if (msg.includes("block") || msg.includes("unblock") || msg.includes("ब्लॉक") ||
        msg.includes("अनब्लॉक") || msg.includes("block list")) {
      return "🚫 **Block & Unblock Users**\n\n" +
             "📌 **Block:** Go to their Profile > 3-dot menu > Block User.\n" +
             "📌 **Unblock:** Settings > Privacy > Blocked Users > Unblock.\n\n" +
             "⚠️ Blocked users cannot message you, join your room, or see your profile.";
    }

    // FOLLOW / UNFOLLOW
    if (msg.includes("follow") || msg.includes("unfollow") || msg.includes("फॉलो") ||
        msg.includes("अनफॉलो") || msg.includes("follower") || msg.includes("following")) {
      return "👥 **Follow & Unfollow**\n\n" +
             "📌 **Follow:** Go to their Profile > Tap 'Follow'.\n" +
             "📌 **Unfollow:** Go to their Profile > Tap 'Following' > Confirm.\n" +
             "📌 **Follower List:** Your Profile > 'Followers'.\n" +
             "📌 **Following List:** Your Profile > 'Following'.";
    }

    // DELETE ACCOUNT
    if (msg.includes("delete") || msg.includes("delete account") || msg.includes("हटाएं") ||
        msg.includes("खाता हटाएं") || msg.includes("account delete")) {
      return "🗑️ **Delete Account**\n\n" +
             "📌 **Step 1:** Go to **Settings**.\n" +
             "📌 **Step 2:** Tap on **Account**.\n" +
             "📌 **Step 3:** Select **Delete Account**.\n" +
             "📌 **Step 4:** Confirm.\n\n" +
             "⚠️ **Warning:** This is **permanent and irreversible**. All data, coins & purchases will be lost.";
    }

    // REFERRAL
    if (msg.includes("refer") || msg.includes("invite") || msg.includes("रेफर") ||
        msg.includes("आमंत्रित") || msg.includes("referral")) {
      return "🎁 **Referral Program — Earn Rewards!**\n\n" +
             "📌 **How to Refer:** Profile > Refer & Earn > Share your code/link.\n" +
             "💰 **Bonus:** You & your friend both get bonus coins on successful referral.";
    }

    // HELP / PROBLEM
    if (msg.includes("problem") || msg.includes("issue") || msg.includes("help") ||
        msg.includes("not working") || msg.includes("error") || msg.includes("समस्या") ||
        msg.includes("मदद") || msg.includes("सहायता") || msg.includes("दिक्कत") ||
        msg.includes("bug") || msg.includes("crash") || msg.includes("stuck")) {
      return "🔧 **We're Here to Help!**\n\n" +
             "Please provide details:\n" +
             "• What exactly is the problem?\n" +
             "• When did it start?\n" +
             "• Any error message?\n" +
             "• Your User ID\n\n" +
             "Our support team is available **24/7**. We'll resolve your issue ASAP!";
    }

    // DEFAULT
    return "Thank you for reaching out! 😊\n\n" +
           "I'm here to help with any Hawa App questions:\n\n" +
           "💎 • Online Coin Recharge\n" +
           "🎵 • Playing Music in Room\n" +
           "🎮 • Playing Games & Winning Coins\n" +
           "🏠 • Creating a Room\n" +
           "⚠️ • Reporting Abuse\n" +
           "💼 • Becoming a Seller\n" +
           "👑 • Contacting Officials\n" +
           "👨‍👩‍👧‍👦 • Family Feature (13L Coins)\n" +
           "✏️ • Edit Profile (Name, DP, Bio, Cover)\n" +
           "💰 • Wallet & Balance\n" +
           "🚫 • Block & Unblock\n\n" +
           "Feel free to ask!";
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Silent block - no warning, just clear input and do nothing
    if (containsBadWords(message)) {
      setMessage("");
      return;
    }
    
    const userMessage = { text: message, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(message);
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 absolute inset-0 z-50 w-full">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white shadow-md pt-[calc(env(safe-area-inset-top)+12px)]">
        <div className="flex items-center gap-3">
          <button onClick={onBack || (() => window.history.back())} className="p-1 hover:bg-white/20 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center border-2 border-white/30 shadow-lg overflow-hidden">
            <img 
              src="/1785612362650~2.jpg" 
              alt="Daisy" 
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="font-semibold text-lg leading-tight">Daisy</h1>
            <span className="text-xs text-blue-100 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Online
            </span>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-0">
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
        <div ref={chatEndRef} />
      </div>

      {/* INPUT BAR */}
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
