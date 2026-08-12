"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { db } from "../src/lib/supabase";
import { collection, addDoc, setDoc, doc, deleteDoc, query, where, getDocs } from "../src/lib/supabase";

interface HurrySupportProps {
  onBack?: () => void;
}

export default function HurrySupport({ onBack }: HurrySupportProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean; timestamp?: number }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [chatDocId, setChatDocId] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatLoadedRef = useRef(false);

  // Get current user info
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('userUID') || 'anonymous';
      const name = localStorage.getItem('userName') || 'User';
      const email = localStorage.getItem('userEmail') || '';
      setUserId(uid);
      setUserName(name);
      setUserEmail(email);
    }
  }, []);

  // Auto-clear chats older than 24 hours
  useEffect(() => {
    const clearOldChats = async () => {
      try {
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const q = query(collection(db, "aiChats"));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(async (document) => {
          const data = document.data();
          const chatTime = data.timestamp || 0;
          if (now - chatTime > twentyFourHours) {
            await deleteDoc(doc(db, "aiChats", document.id));
          }
        });
      } catch (error) {
        console.error("Error clearing old chats:", error);
      }
    };

    clearOldChats();
    const interval = setInterval(clearOldChats, 3600000); // Check every hour
    return () => clearInterval(interval);
  }, []);

  // Load existing chat or create new one
  useEffect(() => {
    if (!userId || chatLoadedRef.current) return;

    const loadOrCreateChat = async () => {
      try {
        const q = query(collection(db, "aiChats"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Load existing chat
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          setChatDocId(docSnap.id);
          
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            const welcomeMessage = {
              text: "Welcome to Hurry Support! 👋\n\nI'm Daisy, your AI Customer Support Assistant.\n\nHow may I assist you today? Feel free to ask any questions related to the Hurry App — I'm here to help! 😊",
              isBot: true,
              timestamp: Date.now()
            };
            setMessages([welcomeMessage]);
          }
        } else {
          // Create new chat
          const welcomeMessage = {
            text: "Welcome to Hurry Support! 👋\n\nI'm Daisy, your AI Customer Support Assistant.\n\nHow may I assist you today? Feel free to ask any questions related to the Hurry App — I'm here to help! 😊",
            isBot: true,
            timestamp: Date.now()
          };
          setMessages([welcomeMessage]);
          
          const docRef = await addDoc(collection(db, "aiChats"), {
            userId: userId,
            userName: userName,
            userEmail: userEmail,
            timestamp: Date.now(),
            messages: [welcomeMessage]
          });
          setChatDocId(docRef.id);
        }
        chatLoadedRef.current = true;
      } catch (error) {
        console.error("Error loading/creating chat:", error);
        const welcomeMessage = {
          text: "Welcome to Hurry Support! 👋\n\nI'm Daisy, your AI Customer Support Assistant.\n\nHow may I assist you today? Feel free to ask any questions related to the Hurry App — I'm here to help! 😊",
          isBot: true,
          timestamp: Date.now()
        };
        setMessages([welcomeMessage]);
      }
    };

    loadOrCreateChat();
  }, [userId, userName, userEmail]);

  // Save messages to Firestore
  const saveChatToFirestore = async (updatedMessages: Array<{ text: string; isBot: boolean; timestamp?: number }>) => {
    if (!chatDocId || !userId) return;
    
    try {
      await setDoc(doc(db, "aiChats", chatDocId), {
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        timestamp: Date.now(),
        messages: updatedMessages
      }, { merge: true });
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Bad words filter
  const containsBadWords = (text: string) => {
    const badWords = [
      "gandu", "gaandu", "chutiya", "chutiye", 
      "bhosdike", "bhonsdike", "bhosdiwala", "bhonsdiwala",
      "madarchod", "maadar chod", 
      "behenchod", "bhenchod", "behanchod", "bahanchod",
      "lauda", "lund", "loda", "laude", "lodu",
      "chuchi", "chuchiya", "chuche",
      "chodu", "chodna", "choda", "chodi",
      "teri maa", "teri ma",
      "teri bhen", "teri behen",
      "hijda", "hijra", "hijde", "chhakka", "chhakke", "kinnar",
      "kutiya", "kutti", "kamine", "kamina", "kaminey",
      "harami", "haramkhor", "haraami", "haramzaada", "haramzada",
      "suar", "sawar", "suvar", "sowar", "bhains", "bhainsa",
      "bhak cho", 
      "lavda", "lavde", "lwda", "lwde", "lawda", "lawde",
      "randi", "raand", "randikhana", "randikhane",
      "randibaaz", "randibaz", "randiya", "randiyo",
      "fuck", "fucker", "fucking", "fucked",
      "shit", "shitty", "bullshit",
      "asshole", "arsehole",
      "bitch", "bitching", "bitchy", "bastard",
      "cunt", "dickhead", "whore", "slut", "motherfucker",
      "cock", "tits", "boobs", "nigger", "nigga",
      "porn", "porno", "nude", "naked",
      "horny", "blowjob", "handjob", "cum", "sperm", "orgasm",
      "rape", "molest", "pedo",
      "chudai", "nanga", "nangi",
    ];
    
    const lowerText = text.toLowerCase().trim();
    const words = lowerText.split(/\s+/);
    
    return badWords.some(badWord => {
      if (badWord.includes(' ')) {
        return lowerText.includes(badWord);
      }
      return words.some(word => {
        const cleanWord = word.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '');
        return cleanWord === badWord;
      });
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
        : "Hello! 👋\n\nWelcome to Hurry Support. I'm Daisy, your AI Customer Support Assistant.\n\nPlease let me know how I can assist you today.";
    }

    // THANK YOU
    if (msg.includes("thank") || msg.includes("thanks") || msg.includes("thx") ||
        msg.includes("धन्यवाद") || msg.includes("शुक्रिया")) {
      return isHindi
        ? "आपका स्वागत है! 😊\n\nहमें मदद करके खुशी हुई।\n\nअगर आपको किसी और चीज़ की ज़रूरत हो तो कृपया बेझिझक पूछें।"
        : "You're welcome! 😊\n\nGlad I could help you.\n\nIf you need anything else, please feel free to ask.";
    }

    // COIN RATES & RECHARGE INFO
    if (msg.includes("rate") || msg.includes("coin rate") || msg.includes("price") || 
        msg.includes("1$") || msg.includes("dollar") || msg.includes("recharge") || 
        msg.includes("coin") || msg.includes("buy coin") || msg.includes("purchase") || 
        msg.includes("रिचार्ज") || msg.includes("सिक्का") || msg.includes("खरीद") || 
        msg.includes("payment") || msg.includes("pay") || msg.includes("google play") || 
        msg.includes("phonepay") || msg.includes("paytm")) {
      return "💎 **Hurry App Coins Rates & Recharge Info**\n\n" +
             "💰 **Coins Exchange Rates:**\n" +
             "• **Offline (Through Official Seller):**\n" +
             "  👉 **1$ = 1,050,000 Coins**\n\n" +
             "• **Online Recharge (In-App Wallet):**\n" +
             "  👉 **1$ = 1,000,000 Coins (+30,000 Bonus Coins)**\n" +
             "  *(Total: 1,030,000 Coins will show in your Wallet option)*\n\n" +
             "📲 **How to Recharge Online:**\n" +
             "📌 **Step 1:** Go to **Profile** section.\n" +
             "📌 **Step 2:** Tap on **Coins** / **Wallet**.\n" +
             "📌 **Step 3:** Select your package & preferred payment method.\n\n" +
             "💳 **Accepted Payment Methods:** Google Play, PhonePe, Paytm & Official Site.\n\n" +
             "🤝 **Want to buy Offline via Seller?**\n" +
             "Contact our Official Team for verified seller options.";
    }

    // SELLER POLICY & PACKAGES
    if (msg.includes("seller") || msg.includes("seller policy") || msg.includes("become seller") || 
        msg.includes("earning") || msg.includes("earn") || msg.includes("sell coin") || 
        msg.includes("विक्रेता") || msg.includes("कमाई") || msg.includes("seller lena") || 
        msg.includes("seller banna") || msg.includes("100$") || msg.includes("200$") || msg.includes("300$")) {
      return "💼 **Hurry Official Seller Policy & Packages**\n\n" +
             "Become an Official Seller to buy in bulk, get special privileges, and earn by reselling coins!\n\n" +
             "📊 **Seller Coin Packages (Rate: 1$ = 1,050,000 Coins):**\n\n" +
             "💵 **$100 Package:**\n" +
             "• Total Coins: **105,000,000 Coins** (10.5 Crore)\n\n" +
             "💵 **$200 Package:**\n" +
             "• Total Coins: **210,000,000 Coins** (21 Crore)\n\n" +
             "💵 **$300 Package:**\n" +
             "• Total Coins: **315,000,000 Coins** (31.5 Crore)\n\n" +
             "📋 **Policy & Benefits:**\n" +
             "• Instant Coin transfers to your seller dashboard.\n" +
             "• Exclusive seller badge & customer priority.\n" +
             "• Dedicated Official Admin support.\n\n" +
             "📩 Contact Official Admin (**Hurry_IN** - ID: 100002) to apply for Seller Status!";
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
      return "🌟 **About Hurry App**\n\n" +
             "Hurry is a **Social Dating & Live Party App** for entertainment and connecting with people.\n\n" +
             "✨ **Key Features:**\n" +
             "• Connect with like-minded people\n" +
             "• Host and join Live Parties\n" +
             "• Play interactive games\n" +
             "• Make new friends\n" +
             "• Earn rewards and coins\n\n" +
             "💰 For earning, you can become a **Seller** and sell coins.";
    }

    // OFFICIALS
    if (msg.includes("official") || msg.includes("admin") || msg.includes("contact") ||
        msg.includes("officer") || msg.includes("अधिकारी") || msg.includes("मालिक") ||
        msg.includes("owner") || msg.includes("team")) {
      return "👑 **Hurry Official Team**\n\n" +
             "• **Hurry_IN**\n" +
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

    // PROFILE EDIT
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
           "I'm here to help with any Hurry App questions:\n\n" +
           "💎 • Coins Rates (Offline 1$=1.05M | Online 1$=1M+30k)\n" +
           "💼 • Seller Policy ($100, $200, $300 Packages)\n" +
           "🎵 • Playing Music in Room\n" +
           "🎮 • Playing Games & Winning Coins\n" +
           "🏠 • Creating a Room\n" +
           "⚠️ • Reporting Abuse\n" +
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
    
    const userMessage = { text: message, isBot: false, timestamp: Date.now() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");
    setIsTyping(true);

    // Save user message
    saveChatToFirestore(updatedMessages);

    setTimeout(() => {
      const botResponse = generateBotResponse(message);
      const botMessage = { text: botResponse, isBot: true, timestamp: Date.now() };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      setIsTyping(false);
      
      // Save bot message
      saveChatToFirestore(finalMessages);
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
