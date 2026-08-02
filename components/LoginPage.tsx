'use client'

import { useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, provider, db } from "../src/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface LoginPageProps {
  onLoginSuccess?: (data?: any) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // State for the 40vh Google Account Bottom Sheet
  const [showGoogleSheet, setShowGoogleSheet] = useState(false)
  // State for email password full sheet
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

      localStorage.setItem("userName", user.displayName || "Google User");
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userPhoto", user.photoURL || "");
      localStorage.setItem("userUID", user.uid || "");

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error: any) {
      console.error(error);
      // Silent error - no alert
    } finally { 
      setLoading(false);
    }
  };

  // Check if credentials match official/admin IDs
  const checkOfficialCredentials = async (email: string, password: string) => {
    try {
      const docRef = doc(db, "adminSettings", "credentials");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().officialCredentials) {
        const credentials = docSnap.data().officialCredentials;
        const matched = credentials.find(
          (cred: any) => cred.email === email && cred.password === password
        );
        if (matched) return matched;
      }

      // Fallback to local storage just in case
      const savedCredentials = localStorage.getItem('officialCredentials');
      if (savedCredentials) {
        const credentials = JSON.parse(savedCredentials);
        const matched = credentials.find(
          (cred: any) => cred.email === email && cred.password === password
        );
        return matched || null;
      }
    } catch (error) {
      console.error("Error checking official credentials:", error);
    }
    return null;
  };

  // Email/Password Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return; // Silent - no error message
    }
    
    if (password.length < 6) {
      return; // Silent - no error message
    }

    setLoading(true);

    try {
      // First check if it's an official/admin ID
      const officialCred = await checkOfficialCredentials(email, password);
      
      if (officialCred) {
        // Set online status in firestore
        try {
          const sessionRef = doc(db, "adminSettings", `sessions_${officialCred.id}`);
          await setDoc(sessionRef, {
            isLoggedIn: true,
            lastLogin: Date.now()
          }, { merge: true });
        } catch (err) {
          console.error("Error updating session status:", err);
        }

        const userData = {
          id: officialCred.id,
          email: officialCred.email,
          type: officialCred.type,
          isOfficial: true
        };

        localStorage.setItem("userName", `${officialCred.type.toUpperCase()} - ${officialCred.id}`);
        localStorage.setItem("userEmail", officialCred.email);
        localStorage.setItem("userUID", officialCred.id);
        localStorage.setItem("userType", officialCred.type);
        localStorage.setItem("userPhoto", "");

        // Also add to loggedInSessions for local device tracking
        const loggedInSessions = JSON.parse(localStorage.getItem('loggedInSessions') || '{}');
        loggedInSessions[officialCred.id] = true;
        localStorage.setItem('loggedInSessions', JSON.stringify(loggedInSessions));

        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
        setLoading(false);
        setShowEmailSheet(false);
        return;
      }

      // If not official, try Firebase auth
      let userCredential;
      
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;

      localStorage.setItem("userName", user.displayName || email.split('@')[0]);
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userPhoto", user.photoURL || "");
      localStorage.setItem("userUID", user.uid || "");

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      setShowEmailSheet(false);
    } catch (error: any) {
      console.error('Auth error:', error);
      // Silent - no error messages shown to user
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-100 to-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Hawa" 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl" 
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hawa</h1>
          <p className="text-gray-600">Welcome to Hawa - Chat & Connect</p>
        </div>

        {/* Login Buttons */}
        <div className="space-y-4">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleClick}
            className="w-full bg-white/80 backdrop-blur-md border border-white/40 shadow-md rounded-2xl p-4 flex items-center justify-center gap-3 transition-all hover:bg-white hover:shadow-lg cursor-pointer"
            disabled={loading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-semibold text-gray-800 text-lg">
              {loading ? 'Signing in...' : 'Google'}
            </span>
          </button>

          {/* Email Login Button */}
          <button
            onClick={() => setShowEmailSheet(true)}
            className="w-full bg-white/80 backdrop-blur-md border border-white/40 shadow-md rounded-2xl p-4 flex items-center justify-center gap-3 transition-all hover:bg-white hover:shadow-lg cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="font-semibold text-gray-800 text-lg">Email</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          By signing in, you agree to our Terms of Service
        </p>
      </div>

      {/* 40vh Glossy White Bottom Sheet for Google Account Picker */}
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

              {/* Account Selection Box */}
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

            {/* Bottom action within sheet */}
            <button
              onClick={handleActualGmailLogin}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm transition-all hover:bg-blue-700 shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              Sign in with Google Account
            </button>
          </div>
        </div>
      )}

      {/* Full Sheet for Email/Password Login */}
      {showEmailSheet && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header */}
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
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          {/* Form Content */}
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
              <form onSubmit={handleEmailAuth} className="space-y-5">
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
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password || !isValidEmail(email)}
                  className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-blue-600/20 mt-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setEmail('');
                    setPassword('');
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
