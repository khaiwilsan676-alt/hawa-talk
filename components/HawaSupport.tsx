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

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = {
      text: "Welcome to Hawa Support! 👋\n\nI'm Daisy, your AI Customer Support Assistant.\n\nHow may I assist you today? Feel free to ask any questions related to the Hawa App — I'm here to help! 😊",
      isBot: true
    };
    setMessages([welcomeMessage]);
  }, []);

  // ==========================================
  // 🛡️ ULTIMATE BAD WORDS FILTER (300+ words)
  // ==========================================
  const containsBadWords = (text: string) => {
    const badWords = [
      // Hindi Gaalis
      "gand", "gandu", "gaand", "gaandu", "chut", "chutiya", "chutiyapa", "chutiye",
      "bhosdi", "bhonsdi", "bhosdike", "bhonsdike", "bhosdiwala", "bhonsdiwala",
      "madarchod", "madar chod", "maadar chod", "mc", "m.c.", "m c",
      "behenchod", "bhenchod", "behanchod", "bahanchod", "bhen chod", "behen chod",
      "lauda", "lund", "loda", "laude", "lod", "lodu", "loda lassun",
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
      
      // 🔴 RANDI - Complete Block (40+ variations)
      "randi", "randi rona", "randi khana", "randikhana", "randikhane",
      "randibaaz", "randibaz", "randi baaz", "randi bazz", "randi bazi",
      "raand", "rand", "raand k", "randi k", "randi ki", "raand ki",
      "randiya", "randiyo", "randiyon", "raandiya", "raandiyo",
      "randi sali", "randi saali", "randi bhen", "randi behen",
      "randi maa", "randi ma", "raand maa", "raand ma",
      "randikhori", "randi khori", "randi chor", "randi chori",
      "randi ka", "randi ke", "raand ka", "raand ke",
      "teri randi", "teri raand", "saali randi", "sali randi",
      
      // English Gaalis
      "fuck", "fuck you", "fucker", "fucking", "fucked", "fuck off",
      "shit", "shitty", "bullshit", "piece of shit",
      "asshole", "ass hole", "ass", "arse", "arsehole",
      "bitch", "bitching", "bitchy", "son of a bitch", "biatch",
      "bastard", "bastards", "basterd",
      "cunt", "cunts", "kunt",
      "dick", "dickhead", "dick head", "dickface",
      "pussy", "pussies", "pussycat",
      "whore", "whoring", "slut", "slutty", "motherfucker", "mother fucker",
      "damn", "hell", "piss", "pissed", "pissing",
      "cock", "cocks", "cockhead", "cock sucker", "cocksucker",
      "tits", "titties", "boobs", "boobies", "nipple", "nipples",
      "nigger", "nigga", "niggah", "niggas", "n word",
      "retard", "retarded", "stupid fuck", "dumb fuck",
      
      // Sex related words
      "sex", "sexy", "sexual", "xxx", "porn", "porno", "pornography",
      "adult video", "adult film", "nude", "naked", "nudes",
      "hot", "horny", "horniness",
      "kiss", "makeout", "make out",
      "fingering", "finger", "blowjob", "blow job", "handjob", "hand job",
      "cum", "sperm", "semen", "orgasm", "orgasms",
      "erotic", "kamasutra", "kama sutra", "position", "sex position",
      "lingerie", "strip", "stripper", "stripping", "strip dance",
      "escort", "hooker", "prostitute", "prostitution",
      "rape", "rapist", "molest", "molestation", "harass", "harassment",
      "pervert", "perverted", "creep", "creepy", "stalk", "stalker",
      "pedo", "pedophile", "child porn", "child abuse",
      "incest", "incestial",
      
      // Hindi sex related
      "chudai", "chud", "chudwa", "chudwana", "chudwane",
      "chudegi", "chudega", "chudoge", "chudogi",
      "sex karna", "sex kar", "sex karo", "sex kiya",
      "bina kapde", "bina kapda", "kapde utar", "kapde utaro", "kapde nikal",
      "nanga", "nangi", "nange", "nangapan",
      "hath lagao", "haath lagao", "hath laga", "haath laga",
      "chu", "chumma", "chummi", "chumban",
      "romance", "romantic", "romancing",
      "masti", "mastiya", "ashleel", "ashlil", "ashleelta",
      "gand mara", "gaand mara", "gand marao", "gaand marao",
      "gand me", "gaand me", "gand mein", "gaand mein",
      "tera gand", "teri gand", "tera gaand", "teri gaand",
      
      // Bypass attempts (Numbers/Symbols)
      "r4ndi", "r@ndi", "rand1", "r andi", "r.andi",
      "ch0d", "ch0du", "chod@", "ch.od",
      "l@vda", "l@wda", "l@uda", "l@vde",
      "f*ck", "f**k", "f*#k", "f u c k", "f.u.c.k",
      "sh*t", "sh!t", "sh1t", "b*tch", "b!tch", "b1tch",
      "a$$", "a$s", "@ss", "@$$", "d!ck", "d*ck", "d1ck",
      "p*ssy", "p**sy", "p*ssy", "p#ssy",
      "r a n d i", "r.a.n.d.i",
    ];
    
    const lowerText = text.toLowerCase();
    const noSpaceText = lowerText.replace(/\s+/g, '');
    const noSymbolText = lowerText.replace(/[^a-zA-Z0-9]/g, '');
    
    return badWords.some(word => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
      return lowerText.includes(word) || 
             noSpaceText.includes(cleanWord) || 
             noSymbolText.includes(cleanWord);
    });
  };

  // ==========================================
  // 🤖 PROFESSIONAL RESPONSE ENGINE
  // ==========================================
  const generateBotResponse = (userMsg: string) => {
    const msg = userMsg.toLowerCase().trim();
    const isHindi = /[\u0900-\u097F]/.test(msg);

    // --- GREETINGS ---
    if (msg.includes("hi") || msg.includes("hello") || msg.includes("hlw") || 
        msg.includes("hey") || msg.includes("नमस्ते") || msg.includes("नमस्कार") ||
        msg.includes("good morning") || msg.includes("good evening")) {
      return isHindi
        ? "नमस्ते! 🙏\n\nहवा सपोर्ट में आपका स्वागत है।\n\nमैं Daisy हूँ, आपकी AI कस्टमर सपोर्ट असिस्टेंट।\n\nकृपया बताएं मैं आपकी किस प्रकार सहायता कर सकती हूँ?"
        : "Hello! 👋\n\nWelcome to Hawa Support. I'm Daisy, your AI Customer Support Assistant.\n\nPlease let me know how I can assist you today.";
    }

    // --- THANK YOU ---
    if (msg.includes("thank") || msg.includes("thanks") || msg.includes("thx") ||
        msg.includes("धन्यवाद") || msg.includes("शुक्रिया")) {
      return isHindi
        ? "आपका स्वागत है! 😊\n\nहमें मदद करके खुशी हुई।\n\nअगर आपको किसी और चीज़ की ज़रूरत हो तो कृपया बेझिझक पूछें। हम हमेशा आपकी सहायता के लिए यहाँ हैं!"
        : "You're welcome! 😊\n\nGlad I could help you.\n\nIf you need anything else, please feel free to ask. We're always here to assist you!";
    }

    // --- 1. ONLINE RECHARGE ---
    if (msg.includes("recharge") || msg.includes("coin") || msg.includes("buy coin") ||
        msg.includes("purchase") || msg.includes("रिचार्ज") || msg.includes("सिक्का") ||
        msg.includes("खरीद") || msg.includes("payment") || msg.includes("pay") ||
        msg.includes("google play") || msg.includes("phonepay") || msg.includes("paytm") ||
        msg.includes("phone pay") || msg.includes("phonepe")) {
      return "💎 **How to Recharge Coins Online**\n\n" +
             "Follow these simple steps to recharge coins:\n\n" +
             "📌 **Step 1:** Go to your **Profile** section.\n" +
             "📌 **Step 2:** Tap on the **Coins** option.\n" +
             "📌 **Step 3:** You will see various **Coin Packages** and the **Recharge** option.\n" +
             "📌 **Step 4:** Select your preferred package and proceed.\n\n" +
             "💳 **Accepted Payment Methods:**\n" +
             "• Google Play\n" +
             "• PhonePe\n" +
             "• Paytm\n" +
             "• Official Website Recharge\n\n" +
             "✅ Once the payment is successful, coins will be credited to your account instantly.\n\n" +
             "🔹 **Need a Coin Seller?**\n" +
             "If you're looking for a seller, please contact our Official Team. They will provide you with:\n" +
             "• Seller Name & Contact Details\n" +
             "• Payment Screenshot (for verification)\n" +
             "• Your User ID confirmation\n\n" +
             "Would you like me to connect you with an Official?";
    }

    // --- 2. ROOM MUSIC ---
    if (msg.includes("music") || msg.includes("song") || msg.includes("play music") ||
        msg.includes("music play") || msg.includes("room music") || msg.includes("संगीत") ||
        msg.includes("गाना") || msg.includes("म्यूजिक") || msg.includes("dj") ||
        msg.includes("audio") || msg.includes("गाने")) {
      return "🎵 **How to Play Music in Your Room**\n\n" +
             "Follow these steps to add music to your room:\n\n" +
             "📌 **Step 1:** Open your room first.\n" +
             "📌 **Step 2:** Look at the bottom of your room screen — you will see a **4-Grid Option** (four square icon).\n" +
             "📌 **Step 3:** Tap on the 4-Grid icon.\n" +
             "📌 **Step 4:** You will find the **Music Play** option there.\n" +
             "📌 **Step 5:** Select your desired music, add it, and press **Play**.\n\n" +
             "🎶 Now enjoy the music with your room members!\n\n" +
             "If you face any issues, feel free to ask.";
    }

    // --- 3. PLAY GAMES ---
    if (msg.includes("game") || msg.includes("play game") || msg.includes("खेल") ||
        msg.includes("गेम") || msg.includes("khel") || msg.includes("gaming") ||
        (msg.includes("play") && msg.includes("win"))) {
      return "🎮 **How to Play Games & Win Coins**\n\n" +
             "Follow these steps to start playing games:\n\n" +
             "📌 **Step 1:** Open your room first.\n" +
             "📌 **Step 2:** At the bottom of the room, tap on the **4-Grid Option** (four square icon).\n" +
             "📌 **Step 3:** You will see the **Game Remote** options displayed there.\n" +
             "📌 **Step 4:** Select any game you like and start playing.\n\n" +
             "🎯 **Enjoy & Win Coins!**\n\n" +
             "Play more, win more, and have fun with your friends in the room!\n\n" +
             "If you need help with any specific game, let me know.";
    }

    // --- 4. CREATE ROOM ---
    if (msg.includes("create room") || msg.includes("open room") || msg.includes("new room") ||
        msg.includes("रूम") || msg.includes("कमरा") || msg.includes("create") ||
        msg.includes("बनाएं") || msg.includes("खोलें") || msg.includes("room banao") ||
        msg.includes("room open") || msg.includes("room create") || msg.includes("room kholo")) {
      return "🏠 **How to Create Your Own Room**\n\n" +
             "Creating a room is quick and easy. Just follow these steps:\n\n" +
             "📌 **Step 1:** Go to the **Homepage**.\n" +
             "📌 **Step 2:** At the top, you will see two tabs: **Mine** and **Popular**.\n" +
             "📌 **Step 3:** Tap on the **Mine** tab.\n" +
             "📌 **Step 4:** You will see a **+ Icon Card** — tap on it.\n" +
             "📌 **Step 5:** Now you can enter your own room and customize it.\n\n" +
             "🎉 Congratulations! Your room is ready. Invite your friends and enjoy!\n\n" +
             "Would you like to know more about room features?";
    }

    // --- 5. ABUSE / COMPLAINT ---
    if (msg.includes("abuse") || msg.includes("gali") || msg.includes("गाली") ||
        msg.includes("complain") || msg.includes("report") || msg.includes("शिकायत") ||
        msg.includes("bad word") || msg.includes("ban") || msg.includes("harass") ||
        msg.includes("block") || msg.includes("abusing") || msg.includes("गाली दे") ||
        msg.includes("gali de") || msg.includes("gali di")) {
      return "⚠️ **Reporting Abuse or Misconduct**\n\n" +
             "If someone is using abusive language or harassing you in the app, here's the correct procedure:\n\n" +
             "📌 **Step 1:** Go to **Help & Feedback** section in the app.\n" +
             "📌 **Step 2:** You can upload a **video or screenshot** as evidence.\n" +
             "📌 **Step 3:** Submit your complaint to our **Admin / Official Team**.\n\n" +
             "🚫 **Important Warning — Please Read Carefully:**\n\n" +
             "• **DO NOT** respond with abusive language yourself.\n" +
             "• If both parties use abusive language, **both User IDs will be banned**.\n\n" +
             "📋 **Reason for Ban:**\n" +
             "• Violation of App Policy\n" +
             "• Breaking Community Rules (Reason: Abusing)\n\n" +
             "✅ The right approach is to report and let our team handle it professionally.\n\n" +
             "If you need help filing a complaint, I can guide you further.";
    }

    // --- 6. WHAT IS HAWA ---
    if (msg.includes("hawa kya") || msg.includes("what is hawa") || msg.includes("about hawa") ||
        msg.includes("hawa app") || msg.includes("app kya") || msg.includes("hawa kya hai") ||
        msg.includes("app ke bare") || msg.includes("hawa ke bare")) {
      return "🌟 **About Hawa App**\n\n" +
             "Hawa is a **Social Dating & Live Party App** designed for entertainment and connecting with new people.\n\n" +
             "✨ **Key Features:**\n" +
             "• Connect with like-minded people\n" +
             "• Host and join Live Parties\n" +
             "• Play interactive games\n" +
             "• Make new friends\n" +
             "• Participate in exciting events\n" +
             "• Earn rewards and coins\n\n" +
             "💰 **Regarding Earnings:**\n" +
             "Hawa is primarily an entertainment and party app. However, if you become a **Seller**, you can earn by selling coins.\n\n" +
             "Would you like more information about becoming a Seller?";
    }

    // --- 7. SELLER INFO ---
    if (msg.includes("seller") || msg.includes("become seller") || msg.includes("earning") ||
        msg.includes("earn") || msg.includes("sell coin") || msg.includes("विक्रेता") ||
        msg.includes("कमाई") || msg.includes("बेचना") || msg.includes("seller lena") ||
        msg.includes("seller banna") || msg.includes("sell karna")) {
      return "💼 **Become a Seller — Earn with Hawa**\n\n" +
             "Interested in becoming a seller? Here's what you need to know:\n\n" +
             "✅ **Benefits of Being a Seller:**\n" +
             "• Earn by selling coins to users\n" +
             "• Get exclusive discounts and offers\n" +
             "• Access special seller features\n" +
             "• Priority support from our team\n\n" +
             "📋 **How to Apply:**\n" +
             "Contact our Official Team to get started. They will guide you through:\n" +
             "• Seller registration\n" +
             "• Coin packages and pricing\n" +
             "• Payment methods and settlement\n\n" +
             "Would you like me to connect you with an Official?";
    }

    // --- 8. OFFICIALS ---
    if (msg.includes("official") || msg.includes("admin") || msg.includes("contact") ||
        msg.includes("officer") || msg.includes("अधिकारी") || msg.includes("मालिक") ||
        msg.includes("owner") || msg.includes("team") || msg.includes("support team")) {
      return "👑 **Hawa Official Team**\n\n" +
             "Here are our main officials:\n\n" +
             "• **Hawa_IN**\n" +
             "  🆔 ID: 100002\n\n" +
             "• **Paras**\n" +
             "  🆔 ID: 100003\n\n" +
             "📞 You can reach out to them directly through the app for:\n" +
             "• Seller registration\n" +
             "• Payment and recharge issues\n" +
             "• Business inquiries\n" +
             "• Serious complaints\n\n" +
             "Would you like me to help you with anything specific?";
    }

    // --- 9. FAMILY FEATURE ---
    if (msg.includes("family") || msg.includes("परिवार") || msg.includes("fam") ||
        msg.includes("family tag") || msg.includes("family create") || msg.includes("family join") ||
        msg.includes("parivaar")) {
      return "👨‍👩‍👧‍👦 **Family Feature — Create Your Family**\n\n" +
             "Create your own family on Hawa and get a special **Family Tag** on your public profile!\n\n" +
             "📌 **How to Create a Family:**\n" +
             "• **Step 1:** Go to your **Profile**.\n" +
             "• **Step 2:** Look for the **Family** option and tap on it.\n" +
             "• **Step 3:** Add your Family **Image** and **Name**.\n" +
             "• **Step 4:** Confirm and create your family.\n\n" +
             "💰 **Family Creation Cost:**\n" +
             "Creating a family costs **13,00,000 Coins**.\n\n" +
             "🏷️ **Benefits:**\n" +
             "• You get a **Family Tag** displayed on your public profile.\n" +
             "• Invite members to join your family.\n" +
             "• Exclusive family features and visibility.\n\n" +
             "Do you want to know more about managing your family?";
    }

    // --- 10. PROFILE EDIT (Name, DP, Bio, Age, Cover) ---
    if (msg.includes("name change") || msg.includes("dp change") || msg.includes("profile picture") ||
        msg.includes("bio") || msg.includes("cover") || msg.includes("age") ||
        msg.includes("name badlo") || msg.includes("dp badlo") || msg.includes("नाम") ||
        msg.includes("फोटो") || msg.includes("तस्वीर") || msg.includes("edit profile") ||
        msg.includes("profile edit") || msg.includes("change name") || msg.includes("change dp") ||
        msg.includes("cover photo") || msg.includes("background") || msg.includes("pencil icon")) {
      return "✏️ **How to Edit Your Profile (Name, DP, Bio, Age & Cover)**\n\n" +
             "Follow these steps to customize your profile:\n\n" +
             "📌 **Step 1:** Go to your **Profile**.\n" +
             "📌 **Step 2:** Tap on the **Top Right Arrow** option.\n" +
             "📌 **Step 3:** Now you will see your **Public Profile**.\n" +
             "📌 **Step 4:** Look at the **top right corner** — you will see a **Pencil Icon (✏️)**.\n" +
             "📌 **Step 5:** Tap on the Pencil Icon to edit:\n\n" +
             "✏️ **You Can Edit:**\n" +
             "• **Name** — Change your display name.\n" +
             "• **Profile Picture (DP)** — Upload a new photo.\n" +
             "• **Bio** — Write something about yourself.\n" +
             "• **Age** — Update your age.\n\n" +
             "🖼️ **Background Cover Photo:**\n" +
             "• You can upload a **Cover Photo** only after reaching **Level 24**.\n" +
             "• Once you reach Level 24, the cover upload option will be unlocked.\n\n" +
             "✅ All changes will be visible on your public profile instantly.\n\n" +
             "Need help with anything else? Feel free to ask!";
    }

    // --- 11. PROFILE / SETTINGS (General) ---
    if (msg.includes("profile") || msg.includes("setting") || msg.includes("account") ||
        msg.includes("प्रोफ़ाइल") || msg.includes("सेटिंग") || msg.includes("खाता") ||
        msg.includes("logout") || msg.includes("password")) {
      return "⚙️ **Profile & Settings Help**\n\n" +
             "To manage your profile and account settings:\n\n" +
             "📌 **Edit Profile:** Go to Profile > Top Right Arrow > Pencil Icon > Edit Name, DP, Bio, Age.\n" +
             "📌 **Cover Photo:** Unlocks at Level 24. Then go to Profile > Pencil Icon > Upload Cover.\n" +
             "📌 **Change Password:** Go to Settings > Security > Change Password.\n" +
             "📌 **Logout:** Go to Settings > Scroll down > Tap on Logout.\n" +
             "📌 **Delete Account:** Go to Settings > Account > Delete Account. (Note: This action is irreversible)\n\n" +
             "If you're facing any specific issue with your profile, please describe it in detail.";
    }

    // --- 12. WALLET / BALANCE ---
    if (msg.includes("wallet") || msg.includes("balance") || msg.includes("बटुआ") ||
        msg.includes("बैलेंस") || msg.includes("coin balance") || msg.includes("check balance")) {
      return "💰 **Wallet & Balance Information**\n\n" +
             "To check your wallet and balance:\n\n" +
             "📌 **Check Balance:** Go to Profile > My Wallet / Coins.\n" +
             "📌 **Transaction History:** Inside Wallet, tap on 'History' to see all transactions.\n" +
             "📌 **Withdraw:** If you're a Seller, withdrawal options are available in Wallet > Withdraw.\n\n" +
             "💎 Your coin balance updates in real-time after every transaction.\n\n" +
             "Facing any issue with your wallet? Let me know!";
    }

    // --- 13. BLOCK / UNBLOCK ---
    if (msg.includes("block") || msg.includes("unblock") || msg.includes("ब्लॉक") ||
        msg.includes("अनब्लॉक") || msg.includes("block list") || msg.includes("blocked")) {
      return "🚫 **Block & Unblock Users**\n\n" +
             "To manage blocked users:\n\n" +
             "📌 **Block a User:** Go to their Profile > Tap on 3-dot menu > Select 'Block User'.\n" +
             "📌 **Unblock a User:** Go to Settings > Privacy > Blocked Users > Select User > Unblock.\n" +
             "📌 **Block List:** You can view all blocked users in Settings > Privacy > Blocked Users.\n\n" +
             "⚠️ Once blocked, the user cannot message you, join your room, or see your profile.\n\n" +
             "Need more help with blocking? Ask me!";
    }

    // --- 14. GUEST / VISITOR ---
    if (msg.includes("guest") || msg.includes("visitor") || msg.includes("अतिथि") ||
        msg.includes("guest user") || msg.includes("guest login") || msg.includes("visitor list")) {
      return "👥 **Guest & Visitor Information**\n\n" +
             "📌 **Guest Login:** You can explore the app as a Guest without creating an account. Some features may be limited.\n" +
             "📌 **Visitor List:** In your Profile, you can see who visited your profile recently.\n" +
             "📌 **Become a Member:** To unlock all features, register with your phone number or email.\n\n" +
             "Guest users have limited access. For the full Hawa experience, create an account!\n\n" +
             "Do you need help with registration?";
    }

    // --- 15. FOLLOW / UNFOLLOW ---
    if (msg.includes("follow") || msg.includes("unfollow") || msg.includes("फॉलो") ||
        msg.includes("अनफॉलो") || msg.includes("follower") || msg.includes("following")) {
      return "👥 **Follow & Unfollow Users**\n\n" +
             "📌 **Follow a User:** Go to their Profile > Tap on 'Follow' button.\n" +
             "📌 **Unfollow a User:** Go to their Profile > Tap on 'Following' > Confirm Unfollow.\n" +
             "📌 **Follower List:** In your Profile, tap on 'Followers' to see who follows you.\n" +
             "📌 **Following List:** Tap on 'Following' to see who you follow.\n\n" +
             "Following someone helps you stay updated with their activities!\n\n" +
             "Need more help? Let me know!";
    }

    // --- 16. HELP / PROBLEM ---
    if (msg.includes("problem") || msg.includes("issue") || msg.includes("help") ||
        msg.includes("not working") || msg.includes("error") || msg.includes("समस्या") ||
        msg.includes("मदद") || msg.includes("सहायता") || msg.includes("दिक्कत") ||
        msg.includes("bug") || msg.includes("crash") || msg.includes("stuck")) {
      return "🔧 **We're Here to Help!**\n\n" +
             "I understand you're facing an issue. Please provide me with more details:\n\n" +
             "• What exactly is the problem?\n" +
             "• When did it start happening?\n" +
             "• Any error message you're seeing?\n" +
             "• Your User ID (for faster resolution)\n\n" +
             "Our support team is available **24/7** to assist you. We'll resolve your issue as quickly as possible.\n\n" +
             "Please share the details, and I'll guide you accordingly.";
    }

    // --- 17. APP FEATURES ---
    if (msg.includes("feature") || msg.includes("app feature") || msg.includes("update") ||
        msg.includes("फीचर") || msg.includes("ऐप") || msg.includes("अपडेट") ||
        msg.includes("new update") || msg.includes("latest")) {
      return "📱 **Hawa App Features**\n\n" +
             "Hawa offers a variety of exciting features:\n\n" +
             "🎉 **Live Party** — Host or join live rooms\n" +
             "💕 **Dating** — Connect with interesting people\n" +
             "🎮 **Games** — Play and win coins\n" +
             "👥 **Friends** — Build your social circle\n" +
             "👨‍👩‍👧‍👦 **Family** — Create your own family (13L Coins)\n" +
             "🎪 **Events** — Participate in special events\n" +
             "🏆 **Rewards** — Earn exciting rewards\n\n" +
             "Which feature would you like to know more about?";
    }

    // --- 18. DELETE ACCOUNT ---
    if (msg.includes("delete") || msg.includes("delete account") || msg.includes("हटाएं") ||
        msg.includes("खाता हटाएं") || msg.includes("account delete") || msg.includes("remove account")) {
      return "🗑️ **Delete Account Request**\n\n" +
             "We're sorry to see you go! If you wish to delete your account:\n\n" +
             "📌 **Step 1:** Go to **Settings**.\n" +
             "📌 **Step 2:** Tap on **Account**.\n" +
             "📌 **Step 3:** Select **Delete Account**.\n" +
             "📌 **Step 4:** Confirm your decision.\n\n" +
             "⚠️ **Warning:** This action is **permanent and irreversible**. All your data, coins, and purchase history will be lost.\n\n" +
             "If you're facing any issues, we'd love to help resolve them before you leave. Would you like to tell us the reason?";
    }

    // --- 19. REFERRAL / INVITE ---
    if (msg.includes("refer") || msg.includes("invite") || msg.includes("रेफर") ||
        msg.includes("आमंत्रित") || msg.includes("referral code") || msg.includes("referral bonus")) {
      return "🎁 **Referral Program — Earn Rewards!**\n\n" +
             "Invite your friends to Hawa and earn exciting rewards!\n\n" +
             "📌 **How to Refer:**\n" +
             "• Go to Profile > Refer & Earn\n" +
             "• Share your unique referral code or link\n" +
             "• When your friend joins using your code, both of you get bonus coins!\n\n" +
             "💰 **Referral Bonus:**\n" +
             "• You earn coins for every successful referral\n" +
             "• Your friend also gets a welcome bonus\n\n" +
             "Start inviting and earning today! Need your referral code?";
    }

    // --- DEFAULT RESPONSE ---
    return "Thank you for reaching out! 😊\n\n" +
           "I'm here to help you with any questions about the Hawa App. Here are some topics I can assist you with:\n\n" +
           "💎 • Online Coin Recharge\n" +
           "🎵 • Playing Music in Room\n" +
           "🎮 • Playing Games & Winning Coins\n" +
           "🏠 • Creating a Room\n" +
           "⚠️ • Reporting Abuse or Misconduct\n" +
           "💼 • Becoming a Seller & Earning\n" +
           "👑 • Contacting Officials\n" +
           "👨‍👩‍👧‍👦 • Family Feature (Create Family)\n" +
           "✏️ • Edit Profile (Name, DP, Bio, Cover)\n" +
           "💰 • Wallet & Balance\n" +
           "🚫 • Block & Unblock\n" +
           "🎁 • Referral Program\n\n" +
           "Please feel free to ask your question. I'll be happy to assist you!";
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    if (containsBadWords(message)) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
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
    <div className="flex flex-col h-screen bg-slate-50">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white shadow-md pt-[calc(env(safe-area-inset-top)+12px)]">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-1 hover:bg-white/20 rounded-full transition">
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
        
        {showWarning && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce z-50">
            ⚠️ Inappropriate language is not allowed!
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
