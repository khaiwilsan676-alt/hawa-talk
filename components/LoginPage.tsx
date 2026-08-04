'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Eye, EyeOff, User } from 'lucide-react'
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth, provider, db } from "../src/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface LoginPageProps {
  onLoginSuccess?: (data?: any) => void
}

// Special Accounts Mapping
const SPECIAL_ACCOUNTS: { [key: string]: string } = {
  'HUSxSvQnabgU029dWYt1TUV04hd2': '100002',
  'ADqW31RGBMaosOzy0HiqexKSD7h1': '100003',
  '100002': '100002',
  '100003': '100003'
}

// Official & Admin IDs List
const OFFICIAL_IDS = ['500001', '500002', '500003', '500004', '500005']
const ADMIN_IDS = ['700001', '700002', '700003']

// HELPER: Account ID Generator
export const getOrCreateAccountNumber = (uid: string) => {
  if (!uid || uid === 'N/A') return '100379620'

  if (OFFICIAL_IDS.includes(uid) || ADMIN_IDS.includes(uid)) {
    return uid
  }

  if (SPECIAL_ACCOUNTS[uid]) {
    return SPECIAL_ACCOUNTS[uid]
  }

  let hash = 0
  for (let i = 0; i < uid.length; i++) {
    hash = (hash << 5) - hash + uid.charCodeAt(i)
    hash |= 0
  }
  const positiveHash = Math.abs(hash)
  return String(10000000 + (positiveHash % 90000000))
}

// HELPER: Sync and Lock User Profile in Firestore
const syncUserToFirestore = async (uid: string, name: string, email: string, photo: string) => {
  try {
    let finalAccountId = ""

    if (OFFICIAL_IDS.includes(uid) || ADMIN_IDS.includes(uid) || SPECIAL_ACCOUNTS[uid]) {
      finalAccountId = SPECIAL_ACCOUNTS[uid] || uid
    } else {
      const userDocRef = doc(db, "users", uid)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists() && userDocSnap.data().accountId) {
        finalAccountId = String(userDocSnap.data().accountId)
      } else {
        finalAccountId = getOrCreateAccountNumber(uid)
      }
    }

    const userData = {
      id: uid,
      name: name || email.split('@')[0] || 'User',
      country: '🇮🇳',
      image: photo || '/default-avatar.png',
      accountId: finalAccountId,
      createdAt: Date.now()
    }

    await setDoc(doc(db, "users", uid), userData, { merge: true })
    await setDoc(doc(db, "globalRooms", uid), userData, { merge: true })

    localStorage.setItem("accountNumber", finalAccountId)
    localStorage.setItem(`user_account_number_${uid}`, finalAccountId)

    console.log("User synced successfully with ID:", finalAccountId)
    return finalAccountId
  } catch (err) {
    console.error("Error syncing user to Firestore:", err)
    return getOrCreateAccountNumber(uid)
  }
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showLoginPage, setShowLoginPage] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  
  const [showGoogleSheet, setShowGoogleSheet] = useState(false)

  // Preload video
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/VID_20260804_011114_027_bsl.mp4';
    video.preload = 'auto';
  }, []);

  const handleGoogleClick = () => {
    setShowGoogleSheet(true);
  };

  const handleActualGmailLogin = async () => {
    setShowGoogleSheet(false);
    setLoading(true);
    try {
      if (provider instanceof GoogleAuthProvider) {
        provider.setCustomParameters({ prompt: 'select_account' });
      }

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userName = user.displayName || "Google User"
      const userEmail = user.email || ""
      const userPhoto = user.photoURL || "/default-avatar.png"
      const userUID = user.uid

      const accNum = await syncUserToFirestore(userUID, userName, userEmail, userPhoto)

      localStorage.setItem("userName", userName);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("userPhoto", userPhoto);
      localStorage.setItem("userUID", userUID);
      localStorage.setItem("accountNumber", accNum);

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error: any) {
      console.error(error);
    } finally { 
      setLoading(false);
    }
  };

  const checkOfficialCredentials = async (emailStr: string, passwordStr: string) => {
    try {
      const docRef = doc(db, "adminSettings", "credentials");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().officialCredentials) {
        const credentials = docSnap.data().officialCredentials;
        const matched = credentials.find(
          (cred: any) => cred.email === emailStr && cred.password === passwordStr
        );
        if (matched) return matched;
      }

      const savedCredentials = localStorage.getItem('officialCredentials');
      if (savedCredentials) {
        const credentials = JSON.parse(savedCredentials);
        const matched = credentials.find(
          (cred: any) => cred.email === emailStr && cred.password === passwordStr
        );
        return matched || null;
      }
    } catch (error) {
      console.error("Error checking official credentials:", error);
    }
    return null;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!email || !password || password.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const officialCred = await checkOfficialCredentials(email, password);
      
      if (officialCred) {
        try {
          const sessionRef = doc(db, "adminSettings", `sessions_${officialCred.id}`);
          await setDoc(sessionRef, {
            isLoggedIn: true,
            lastLogin: Date.now()
          }, { merge: true });
        } catch (err) {
          console.error("Error updating session status:", err);
        }

        const userName = `${officialCred.type.toUpperCase()} - ${officialCred.id}`
        const officialID = officialCred.id

        await syncUserToFirestore(officialID, userName, officialCred.email, "")

        const userData = {
          id: officialID,
          email: officialCred.email,
          type: officialCred.type,
          isOfficial: true
        };

        localStorage.setItem("userName", userName);
        localStorage.setItem("userEmail", officialCred.email);
        localStorage.setItem("userUID", officialID);
        localStorage.setItem("accountNumber", officialID);
        localStorage.setItem("userType", officialCred.type);
        localStorage.setItem("userPhoto", "");

        const loggedInSessions = JSON.parse(localStorage.getItem('loggedInSessions') || '{}')
        loggedInSessions[officialID] = true
        localStorage.setItem('loggedInSessions', JSON.stringify(loggedInSessions));

        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
        setLoading(false);
        return;
      }

      let userCredential;
      userCredential = await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;
      const userName = user.displayName || email.split('@')[0]
      const userEmail = user.email || ""
      const userPhoto = user.photoURL || "/default-avatar.png"
      const userUID = user.uid

      const accNum = await syncUserToFirestore(userUID, userName, userEmail, userPhoto)

      localStorage.setItem("userName", userName);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("userPhoto", userPhoto);
      localStorage.setItem("userUID", userUID);
      localStorage.setItem("accountNumber", accNum);

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = "Authentication failed. Please check your credentials.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account already exists with this email address.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  // Privacy Policy Page
  if (showPrivacyPolicy) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center p-4 border-b border-gray-100">
          <button
            onClick={() => setShowPrivacyPolicy(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 ml-3">Privacy Policy</h1>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6 text-gray-700">
            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
              <p>We collect information you provide directly to us, including your name, email address, and profile information when you create an account. We also collect information about your use of our services.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
              <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to develop new features.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Information Sharing</h3>
              <p>We do not share your personal information with third parties except as described in this privacy policy or with your consent.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Data Security</h3>
              <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Your Choices</h3>
              <p>You can access, update, or delete your account information at any time through your account settings. You may also opt out of receiving promotional communications from us.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us at support@hawaapp.com.</p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Login Page (Account Button click - Video Background, No Card Logo)
  if (showLoginPage) {
    return (
      <div className="min-h-screen relative flex flex-col bg-gray-900">
        {/* Video Background */}
        <video 
          autoPlay 
          loop  
          playsInline
          preload="auto"
          poster="/video-thumbnail.jpg"
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src="/VID_20260804_011114_027_bsl.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header with back button */}
          <div className="flex items-center p-4">
            <button
              onClick={() => {
                setShowLoginPage(false);
                setEmail('');
                setPassword('');
                setAuthError(null);
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
          </div>

          {/* Form Content - Moved Up */}
          <div className="flex-1 flex flex-col items-center justify-start px-6 pt-8">
            <div className="w-full max-w-sm">
              {/* Logo without Card */}
              <div className="text-center mb-6">
                <img 
                  src="/logo.png" 
                  alt="Hawa" 
                  className="w-16 h-16 rounded-2xl mx-auto mb-3 drop-shadow-lg" 
                />
                <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
                <p className="text-white/70 text-sm mt-1">Sign in to your account</p>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authError && (
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-300/30 text-white px-4 py-3 rounded-xl text-sm">
                    {authError}
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    E-mail Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:border-white/50 transition-colors text-white placeholder-white/50"
                    required
                  />
                  {email && !isValidEmail(email) && (
                    <p className="text-xs text-red-300 mt-1">Please enter a valid email</p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:border-white/50 transition-colors text-white placeholder-white/50 pr-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Do you have account? Sign In */}
                <div className="text-center">
                  <p className="text-sm text-white/70">
                    Do you have account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('');
                        setPassword('');
                        setAuthError(null);
                      }}
                      className="text-blue-300 hover:text-blue-200 font-semibold cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading || !email || !password || !isValidEmail(email)}
                  className="w-full bg-white text-blue-600 font-semibold py-3 rounded-xl transition-all hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-black/20 text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Landing Page with Video Background
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between px-4 overflow-hidden bg-gray-900">
      
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        preload="auto"
        poster="/video-thumbnail.jpg"
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src="/VID_20260804_011114_027_bsl.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      {/* Content - Above Video */}
      <div className="relative z-10 w-full flex flex-col items-center justify-between min-h-screen">
        
        {/* Top Right - Feedback Text Only (No Card, No Icon) */}
        <div className="w-full flex justify-end pt-4">
          <button className="text-sm font-medium text-white/90 hover:text-white transition-all cursor-pointer">
            Feedback
          </button>
        </div>

        {/* 10VH Gap between Feedback and Logo */}
        <div className="flex flex-col items-center" style={{ marginTop: '10vh' }}>
          {/* Logo Image */}
          <div className="mb-0.5">
            <img 
              src="/logo.png" 
              alt="Hawa" 
              className="w-20 h-20 rounded-2xl drop-shadow-lg" 
            />
          </div>
          {/* Hawa Text - Smaller size */}
          <h1 className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">Hawa</h1>
        </div>

        {/* 15VH Gap between Logo and Buttons */}
        <div style={{ marginTop: '15vh' }}></div>

        {/* Buttons Section */}
        <div className="w-full max-w-sm space-y-3 mb-6">
          {/* 3D Glossy White Google Button */}
          <button
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              boxShadow: '0 4px 0 #e0e0e0, 0 6px 20px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.8)',
              background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-semibold text-gray-800 text-base">
              Continue with Google
            </span>
          </button>

          {/* 3D Blue Account Button */}
          <button
            onClick={() => setShowLoginPage(true)}
            className="w-full rounded-2xl p-3.5 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-white"
            style={{
              boxShadow: '0 4px 0 #1d4ed8, 0 6px 20px rgba(37,99,235,0.4), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2)',
              background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
            }}
          >
            <User size={22} />
            <span className="font-semibold text-base">
              Login with Account
            </span>
          </button>
        </div>

        {/* Bottom Text */}
        <div className="w-full max-w-sm text-center pb-8">
          <p className="text-xs text-white/80 drop-shadow">
            Login means you agree to the{' '}
            <span className="text-white font-medium">Terms of Service</span>
            {', '}
            <button
              type="button"
              onClick={() => setShowPrivacyPolicy(true)}
              className="text-blue-300 hover:text-blue-200 font-medium cursor-pointer"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>

      {/* Google Sheet Modal */}
      {showGoogleSheet && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50 transition-all">
          <div className="w-full max-w-md h-[40vh] bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl p-6 flex flex-col justify-between border-t border-white animate-in slide-in-from-bottom duration-300">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowGoogleSheet(false)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <h3 className="font-bold text-gray-800 text-lg">Choose an account</h3>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">to continue to Hawa</p>

              <div className="space-y-2 overflow-y-auto max-h-[16vh]">
                <div
                  onClick={handleActualGmailLogin}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 border border-gray-100 transition-all cursor-pointer shadow-sm bg-white"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-inner">
                    G
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Continue with Google Account</p>
                    <p className="text-xs text-gray-500">Tap to pick your account</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleActualGmailLogin}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm transition-all hover:bg-blue-700 shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              Sign in with Google Account
            </button>
          </div>
        </div>
      )}
    </div>
  )
              }
