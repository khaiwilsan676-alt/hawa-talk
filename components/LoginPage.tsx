'use client'

import { useState, useEffect } from 'react'
import { Phone, X } from 'lucide-react'
import { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth, provider } from "../src/lib/firebase"; 

interface LoginPageProps {
  onLoginSuccess?: (data?: any) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | null>(null)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  
  // State for the 40vh Google Account Bottom Sheet mockup/picker
  const [showGoogleSheet, setShowGoogleSheet] = useState(false)
  const [mockAccounts] = useState([
    { name: 'User Account', email: 'user@gmail.com', photo: '' },
    { name: 'Developer Account', email: 'dev.hawa@gmail.com', photo: '' }
  ])

  // Initialize reCAPTCHAVerifier safely
  useEffect(() => {
    if (loginMethod === 'phone' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber
          },
        });
      } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
      }
    }
  }, [loginMethod]);

  const handleGoogleClick = () => {
    // Open the 40vh glossy sheet instead of direct popup if you want simulated picker, 
    // or call handleGmailLogin directly. As requested: "40Vh sheet aaygi Google P tab kerne s"
    setShowGoogleSheet(true);
  };

  const handleActualGmailLogin = async () => {
    setShowGoogleSheet(false);
    setLoading(true);
    try {
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
      alert(error.code + "\n" + error.message);
    } finally { 
      setLoading(false);
    }
  };

  // Step 1: Send OTP to Phone Number
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) return;
    setLoading(true);

    try {
      const formattedPhone = `+91${phone.trim()}`;
      const appVerifier = window.recaptchaVerifier;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp'); // Switch to OTP input view
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      alert(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Complete Login
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6 || !confirmationResult) return;
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      localStorage.clear();
      localStorage.setItem('userName', user.displayName || `User ${phone.slice(-4)}`);
      localStorage.setItem('userPhone', user.phoneNumber || phone);
      localStorage.setItem('userUID', user.uid);
      localStorage.setItem('userPhoto', '');

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error: any) {
      console.error('Invalid OTP:', error);
      alert('Invalid OTP. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
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

        {/* Login Method Selection */}
        {!loginMethod ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Login with</h2>

            {/* Google Login Button - Glossy White Patti with only G logo and Google */}
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

            {/* Phone Login Button */}
            <button
              onClick={() => setLoginMethod('phone')}
              className="w-full bg-white/80 backdrop-blur-md border border-white/40 shadow-md rounded-2xl p-4 flex items-center justify-center gap-3 transition-all hover:bg-white hover:shadow-lg cursor-pointer"
            >
              <Phone className="text-blue-500" size={24} />
              <span className="font-semibold text-gray-800 text-lg">Phone Number</span>
            </button>
          </div>
        ) : (
          /* Phone Login & OTP Form */
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/50">
            <button
              onClick={() => {
                setLoginMethod(null);
                setStep('phone');
              }}
              className="text-blue-500 font-semibold mb-4 flex items-center gap-1 cursor-pointer"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {step === 'phone' ? 'Phone Number Login' : 'Enter OTP'}
            </h2>

            {step === 'phone' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="+91"
                      disabled
                      className="w-20 px-3 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-center font-semibold text-gray-700"
                    />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={!phone || loading || phone.length < 10}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter 6-digit OTP sent to +91 {phone}
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-center tracking-widest text-lg font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={!otp || loading || otp.length < 6}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </div>
            )}

            {/* Invisible reCAPTCHA container required by Firebase */}
            <div id="recaptcha-container"></div>
          </div>
        )}

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
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <h3 className="font-bold text-gray-800 text-lg">Choose an account</h3>
                </div>
                <button 
                  onClick={() => setShowGoogleSheet(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">to continue to Hawa</p>

              {/* Account List */}
              <div className="space-y-2 overflow-y-auto max-h-[16vh]">
                {mockAccounts.map((acc, index) => (
                  <div
                    key={index}
                    onClick={handleActualGmailLogin}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 border border-gray-100 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                      {acc.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{acc.name}</p>
                      <p className="text-xs text-gray-500">{acc.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom action within sheet */}
            <button
              onClick={handleActualGmailLogin}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all hover:bg-blue-700 shadow-md cursor-pointer"
            >
              Sign in with Google Account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

