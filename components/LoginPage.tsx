'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, User } from 'lucide-react'

// 🔥 Firebase (Auth + Firestore)
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "firebase/auth"
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore"
import { auth, db } from "../src/lib/firebase" 

// ⚡ Supabase (Sirf Google Login ke liye)
import { supabase } from "../src/lib/supabase"

interface LoginPageProps {
  onLoginSuccess?: (data?: any) => void
}

// Feedback Types
const FEEDBACK_TYPES = [
  { id: 'app_bug', label: 'App Bug', icon: '' },
  { id: 'suggestion', label: 'Suggestion', icon: '' },
  { id: 'recharge', label: 'Recharge', icon: '' },
  { id: 'others', label: 'Others', icon: '' }
]

// 🌍 FULL COUNTRY LIST
const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
]

// 🔢 8-Digit Generator (Dono UID se 8 digit number banayega)
const generate8DigitId = (uid: string): string => {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    const char = uid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; 
  }
  const eightDigit = Math.abs(hash) % 90000000 + 10000000;
  return eightDigit.toString();
}

// 🔥 Sync to Firestore (Dono Firebase/Supabase users yahan save honge)
const syncUserToFirestore = async (uid: string, name: string, email: string, photo: string) => {
  try {
    const shortAccountId = generate8DigitId(uid); 

    const userRef = doc(db, 'users', uid);
    const globalRoomRef = doc(db, 'global_rooms', uid);

    const userData = {
      name: name || email.split('@')[0] || 'User',
      email: email || '',
      country: '🇮🇳',
      avatar_url: photo || '/default-avatar.png',
      account_id: shortAccountId, // ✅ Sirf 8 digit save hoga
      updated_at: serverTimestamp()
    };

    await setDoc(userRef, userData, { merge: true });
    await setDoc(globalRoomRef, userData, { merge: true });

    localStorage.setItem("accountNumber", shortAccountId);
    return shortAccountId;
  } catch (err) {
    console.error("Error syncing to Firestore:", err);
    return generate8DigitId(uid);
  }
}

// 🟢 Check if user is new
const checkIfNewUser = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return !(data.gender && data.setup_complete);
    }
    return true;
  } catch (error) {
    return !localStorage.getItem("userGender");
  }
}

// 👧 Gender Selection Page
function GenderSelectionPage({ userData, onComplete }: { userData: any, onComplete: (gender: string, country: string) => void }) {
  const [selectedGender, setSelectedGender] = useState<string>('')
  const [selectedCountry, setSelectedCountry] = useState<string>('IN')
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = async () => {
    if (!selectedGender || isSubmitting) return
    setIsSubmitting(true)
    
    try {
      const defaultData = selectedGender === 'female' 
        ? { name: 'Barrey', avatar_url: '/IMG_20260804_211013.jpg', gender: 'female' }
        : { name: 'Simpson', avatar_url: '/IMG_20260804_211031.jpg', gender: 'male' }

      const countryFlag = COUNTRIES.find(c => c.code === selectedCountry)?.flag || '🇮🇳'
      const userId = userData.id || userData.uid

      const shortAccountId = generate8DigitId(userId); 

      const userDocData = {
        name: defaultData.name,
        avatar_url: defaultData.avatar_url,
        gender: selectedGender,
        country: countryFlag,
        country_code: selectedCountry,
        email: userData.email || '',
        account_id: shortAccountId, // ✅ Sirf 8 digit
        updated_at: serverTimestamp(),
        setup_complete: true
      };

      await setDoc(doc(db, 'users', userId), userDocData, { merge: true });
      await setDoc(doc(db, 'global_rooms', userId), { id: userId, name: defaultData.name, avatar_url: defaultData.avatar_url, gender: selectedGender, country: countryFlag, account_id: shortAccountId }, { merge: true });

      localStorage.setItem("userName", defaultData.name);
      localStorage.setItem("userPhoto", defaultData.avatar_url);
      localStorage.setItem("userGender", selectedGender);
      localStorage.setItem("userCountry", countryFlag);
      localStorage.setItem("userCountryCode", selectedCountry);
      localStorage.setItem("accountNumber", shortAccountId);

      onComplete(selectedGender, selectedCountry);
    } catch (error) {
      console.error(error);
      onComplete(selectedGender, selectedCountry);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountry)

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="px-4 pt-12 pb-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome! 🎉</h1>
        <p className="text-sm text-gray-500 mt-2">Select your gender to get started</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <button onClick={() => setSelectedGender('female')} className={`relative w-full max-w-xs transition-all duration-300 transform ${selectedGender === 'female' ? 'scale-105 ring-4 ring-pink-400 shadow-2xl shadow-pink-400/30' : 'ring-2 ring-gray-200 shadow-lg hover:shadow-xl'}`}>
          <div className="rounded-3xl overflow-hidden relative p-6 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(244, 114, 182, 0.2) 50%, rgba(251, 207, 232, 0.3) 100%)' }}>
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-pink-300 shadow-lg mb-4"><img src="/IMG_20260804_211013.jpg" alt="Female" className="w-full h-full object-cover" /></div>
            <div className="bg-pink-500/80 backdrop-blur-sm px-6 py-2 rounded-full"><span className="text-white font-bold text-lg">Female</span></div>
          </div>
        </button>

        <div className="flex items-center gap-3 w-full max-w-xs"><div className="flex-1 h-px bg-gray-300"></div><span className="text-sm text-gray-400 font-medium">OR</span><div className="flex-1 h-px bg-gray-300"></div></div>

        <button onClick={() => setSelectedGender('male')} className={`relative w-full max-w-xs transition-all duration-300 transform ${selectedGender === 'male' ? 'scale-105 ring-4 ring-blue-400 shadow-2xl shadow-blue-400/30' : 'ring-2 ring-gray-200 shadow-lg hover:shadow-xl'}`}>
          <div className="rounded-3xl overflow-hidden relative p-6 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.2) 50%, rgba(191, 219, 254, 0.3) 100%)' }}>
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-blue-300 shadow-lg mb-4"><img src="/IMG_20260804_211031.jpg" alt="Male" className="w-full h-full object-cover" /></div>
            <div className="bg-blue-500/80 backdrop-blur-sm px-6 py-2 rounded-full"><span className="text-white font-bold text-lg">Male</span></div>
          </div>
        </button>
      </div>

      <div className="px-4 pb-8 pt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Country</label>
          <button onClick={() => setShowCountryPicker(!showCountryPicker)} className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white hover:border-gray-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-3"><span className="text-2xl">{selectedCountryData?.flag}</span><span className="text-gray-800 font-medium">{selectedCountryData?.name}</span></div>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {showCountryPicker && (
            <div className="mt-2 border-2 border-gray-200 rounded-2xl bg-white max-h-48 overflow-y-auto shadow-lg">
              {COUNTRIES.map((country) => (
                <button key={country.code} onClick={() => { setSelectedCountry(country.code); setShowCountryPicker(false); }} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${selectedCountry === country.code ? 'bg-blue-50' : ''}`}>
                  <span className="text-2xl">{country.flag}</span>
                  <span className={`text-sm ${selectedCountry === country.code ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleContinue} disabled={!selectedGender || isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 cursor-pointer shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3">
          {isSubmitting ? <span className="animate-pulse">Setting up...</span> : <><span className="text-lg">Let's Go!</span><ArrowRight size={24} /></>}
        </button>
      </div>
    </div>
  )
}

// 🔥 MAIN LOGIN PAGE
export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showLoginPage, setShowLoginPage] = useState(false)
  const [showFeedbackPage, setShowFeedbackPage] = useState(false)
  const [showGenderPage, setShowGenderPage] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [pendingUserData, setPendingUserData] = useState<any>(null)
  const [checkingNewUser, setCheckingNewUser] = useState(false)
  const [showGoogleSheet, setShowGoogleSheet] = useState(false)

  // Feedback States
  const [selectedType, setSelectedType] = useState<string>('')
  const [problemDescription, setProblemDescription] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  // MOBILE FORCE VIEWPORT
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    if (!meta) { meta = document.createElement('meta'); meta.name = 'viewport'; document.head.appendChild(meta) }
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    document.documentElement.style.setProperty('max-width', '480px'); document.documentElement.style.setProperty('margin', '0 auto')
    document.body.style.setProperty('max-width', '480px'); document.body.style.setProperty('margin', '0 auto')
    document.body.style.setProperty('overflow-x', 'hidden')
  }, [])

  // Preload video
  useEffect(() => {
    const video = document.createElement('video'); video.src = '/VID_20260804_011114_027_bsl.mp4'; video.preload = 'auto';
  }, []);

  // 🔥 Firebase Session Check (Firebase Email Login ke liye)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userName = user.displayName || user.email?.split('@')[0] || "User";
        const userUID = user.uid;

        await syncUserToFirestore(userUID, userName, user.email || "", user.photoURL || "");
        localStorage.setItem("userName", userName);
        localStorage.setItem("userUID", userUID);

        await processLoginSuccess(user);
      }
    });
    return () => unsubscribe();
  }, []);

  // ⚡ Google Login (Supabase use karega)
  const handleActualGmailLogin = async () => {
    setShowGoogleSheet(false);
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    } catch (error) { console.error(error); }
  };

  // Common Success Logic (Dono Firebase aur Supabase ke liye)
  const processLoginSuccess = async (userData: any) => {
    const userId = userData?.uid || userData?.id;
    if (!userId) return onLoginSuccess?.(userData);

    setCheckingNewUser(true);
    const isNew = await checkIfNewUser(userId);
    
    if (isNew) {
      setPendingUserData(userData);
      setShowGenderPage(true);
    } else {
      // Fetch existing data from Firestore for local storage
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
          const data = userSnap.data();
          if(data.account_id) localStorage.setItem("accountNumber", data.account_id);
          if(data.name) localStorage.setItem("userName", data.name);
          if(data.avatar_url) localStorage.setItem("userPhoto", data.avatar_url);
      }
      onLoginSuccess?.(userData);
    }
    setCheckingNewUser(false);
  };

  // Firebase Email Login
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userName = user.displayName || email.split('@')[0];
      await syncUserToFirestore(user.uid, userName, user.email || "", user.photoURL || "");
      localStorage.setItem("userName", userName);
      localStorage.setItem("userUID", user.uid);
      await processLoginSuccess(user);
    } catch (error: any) {
      setAuthError(error.code === "auth/invalid-credential" ? "Invalid email/password." : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (emailStr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);

  // Firebase Feedback Submit
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    if (!selectedType || !problemDescription.trim() || !contactInfo.trim()) {
      setFeedbackError("Please fill all fields"); return;
    }
    setFeedbackSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        type: selectedType,
        type_label: FEEDBACK_TYPES.find(t => t.id === selectedType)?.label || selectedType,
        description: problemDescription.trim(),
        contact_info: contactInfo.trim(),
        created_at: serverTimestamp(),
        status: 'pending'
      });
      setFeedbackSuccess(true);
      setTimeout(() => { setShowFeedbackPage(false); setFeedbackSuccess(false); }, 2000);
    } catch (error) {
      setFeedbackError("Failed to submit feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // ---------- RENDER PAGES ----------

  if (checkingNewUser) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (showGenderPage && pendingUserData) return <GenderSelectionPage userData={pendingUserData} onComplete={() => { setShowGenderPage(false); onLoginSuccess?.(pendingUserData); }} />;
  
  if (showFeedbackPage) return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="flex items-center p-4 bg-white border-b border-gray-200">
        <button onClick={() => { setShowFeedbackPage(false); setFeedbackSuccess(false); setFeedbackError(null); }} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"><ArrowLeft size={24} className="text-gray-700" /></button>
        <h1 className="text-lg font-semibold text-gray-900 ml-3">Feedback</h1>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {feedbackSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"><div className="text-4xl mb-4">✅</div><h2 className="text-xl font-bold text-green-700 mb-2">Thank You!</h2><p className="text-green-600">Your feedback has been submitted.</p></div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div><h2 className="text-base font-semibold text-gray-800 mb-3">Type of Issue</h2>
                <div className="grid grid-cols-2 gap-3">
                  {FEEDBACK_TYPES.map((type) => (
                    <button key={type.id} type="button" onClick={() => setSelectedType(type.id)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedType === type.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <div className="text-2xl mb-1">{type.icon}</div><div className={`text-sm font-medium ${selectedType === type.id ? 'text-blue-700' : 'text-gray-700'}`}>{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div><h2 className="text-base font-semibold text-gray-800 mb-3">Problem Description</h2>
                <textarea value={problemDescription} onChange={(e) => { if (e.target.value.length <= 400) setProblemDescription(e.target.value); }} placeholder="Describe your issue..." maxLength={400} rows={5} className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 text-gray-900 bg-white resize-none" />
                <div className="text-right text-xs text-gray-400 mt-1">{problemDescription.length}/400</div>
              </div>
              <div><h2 className="text-base font-semibold text-gray-800 mb-3">Contact Information</h2>
                <input type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Enter your email or App ID" className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 text-gray-900 bg-white" />
              </div>
              {feedbackError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{feedbackError}</div>}
              <button type="submit" disabled={feedbackSubmitting} className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-lg">{feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  if (showPrivacyPolicy) return (
    <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="flex items-center p-4 border-b border-gray-100">
        <button onClick={() => setShowPrivacyPolicy(false)} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"><ArrowLeft size={24} className="text-gray-700" /></button>
        <h1 className="text-lg font-semibold text-gray-900 ml-3">Privacy Policy</h1>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6 text-gray-700">
          <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          <section><h3 className="text-lg font-semibold text-gray-900 mb-2">1. Information We Collect</h3><p>We collect information you provide directly to us, including your name, email address, and profile information.</p></section>
          <section><h3 className="text-lg font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3><p>We use the information to provide, maintain, and improve our services.</p></section>
          <section><h3 className="text-lg font-semibold text-gray-900 mb-2">3. Contact Us</h3><p>If you have any questions, contact us at support@hawaapp.com.</p></section>
        </div>
      </div>
    </div>
  );

  if (showLoginPage) return (
    <div className="min-h-screen relative flex flex-col bg-gray-900 px-6" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <button onClick={() => setShowLoginPage(false)} className="absolute top-4 left-4 text-white p-2 cursor-pointer"><ArrowLeft /></button>
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8"><h1 className="text-white text-2xl font-bold">Welcome Back!</h1><p className="text-white/70 text-sm mt-1">Sign in to your account</p></div>
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {authError && <div className="bg-red-500/20 text-white p-3 rounded-xl text-center text-sm">{authError}</div>}
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/50 focus:border-white focus:outline-none" required />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/50 pr-10 focus:border-white focus:outline-none" required minLength={6} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-white/60 cursor-pointer">{showPassword ? <EyeOff /> : <Eye />}</button>
          </div>
          <button type="submit" disabled={loading || !isValidEmail(email)} className="w-full bg-white text-blue-600 font-bold p-3 rounded-xl disabled:opacity-50">{loading ? "Logging in..." : "Login"}</button>
        </form>
      </div>
    </div>
  );

  // 📱 MAIN LANDING PAGE
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between px-4 bg-gray-900 overflow-hidden" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <video autoPlay loop muted playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"><source src="/VID_20260804_011114_027_bsl.mp4" /></video>
      
      <div className="relative z-10 w-full flex flex-col items-center min-h-screen">
        <div className="w-full flex justify-end pt-4"><button onClick={() => setShowFeedbackPage(true)} className="text-sm font-medium text-white/90 hover:text-white cursor-pointer">Feedback</button></div>
        
        <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm mt-[-40px]">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 rounded-3xl shadow-2xl mb-6" />
          
          <button onClick={() => setShowGoogleSheet(true)} className="w-full bg-white/90 backdrop-blur-md p-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xl text-gray-800 font-semibold">
            <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <button onClick={() => setShowLoginPage(true)} className="w-full bg-gradient-to-b from-blue-500 to-blue-700 p-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-white font-semibold shadow-lg shadow-blue-900/50">
            <User size={22} /> Login with Account
          </button>
          
          <div className="text-center mt-4"><p className="text-xs text-white/80 drop-shadow">Login means you agree to the Terms of Service, <button type="button" onClick={() => setShowPrivacyPolicy(true)} className="text-blue-300 hover:text-blue-200 font-medium cursor-pointer">Privacy Policy</button></p></div>
        </div>
      </div>

      {/* Google Bottom Sheet */}
      {showGoogleSheet && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-800 text-lg">Choose an account</h3><button onClick={() => setShowGoogleSheet(false)} className="text-gray-500 cursor-pointer"><ArrowLeft /></button></div>
            <div onClick={handleActualGmailLogin} className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border cursor-pointer transition-colors">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">G</div>
              <span className="font-semibold text-gray-700">Continue with Google</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
      }
