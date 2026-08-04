'use client'

import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  
  const [showGoogleSheet, setShowGoogleSheet] = useState(false)
  const [showEmailSheet, setShowEmailSheet] = useState(false)

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
    
    if (!agreedToTerms) {
      setAuthError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    
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
        setShowEmailSheet(false);
        return;
      }

      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

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
      setShowEmailSheet(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-100 to-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Main Card - Compact */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-6">
          {/* Row 1: Logo and Welcome Back */}
          <div className="flex items-center gap-2 mb-1">
            <img 
              src="/logo.png" 
              alt="Hawa" 
              className="w-8 h-8 rounded-lg" 
            />
            <h1 className="text-xl font-bold text-gray-900">Welcome Back!</h1>
          </div>

          {/* Row 2: Subtitle */}
          <p className="text-gray-500 text-sm mb-5">Sign in to enjoy Hawa</p>

          {/* Login Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs">
                {authError}
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                E-mail Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 text-sm"
                required
              />
              {email && !isValidEmail(email) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid email</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 pr-10 text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Do you have account? Sign In - Compact, right aligned */}
            <div className="text-right">
              <p className="text-xs text-gray-500">
                Do you have account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setEmail('');
                    setPassword('');
                    setAuthError(null);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>

            {/* Sign In Button - Compact */}
            <button
              type="submit"
              disabled={loading || !email || !password || !isValidEmail(email) || !agreedToTerms}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-blue-600/20 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">Or</span>
            </div>
          </div>

          {/* Google Sign In Button - Compact */}
          <button
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full border-2 border-gray-200 rounded-xl p-2.5 flex items-center justify-center gap-2.5 transition-all hover:border-gray-300 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-semibold text-gray-700 text-sm">
              Sign in with Google
            </span>
          </button>

          {/* Terms and Privacy Checkbox - Compact, sabse niche */}
          <div className="mt-3 flex items-start gap-1.5">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-500">
              You agree to our{' '}
              <span className="text-gray-700 font-medium">Terms</span>
              {', '}
              <button
                type="button"
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Privacy Policy
              </button>
            </label>
          </div>
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

      {/* Email Sign Up Sheet Modal */}
      {showEmailSheet && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button
              onClick={() => {
                setShowEmailSheet(false);
                setEmail('');
                setPassword('');
                setIsSignUp(false);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
              <form onSubmit={handleEmailAuth} className="space-y-5">
                {authError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {authError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                    required
                  />
                  {email && !isValidEmail(email) && (
                    <p className="text-sm text-red-500 mt-1">Please enter a valid email</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 pr-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    Do you have account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setEmail('');
                        setPassword('');
                        setAuthError(null);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password || !isValidEmail(email) || !agreedToTerms}
                  className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-blue-600/20 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </span>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setEmail('');
                    setPassword('');
                    setAuthError(null);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
      }
