'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'

export default function LoginPage({ onLoginSuccess }) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | null>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGmailLogin = async () => {
    setLoading(true)
    try {
      // Simulate Gmail login
      if (email.trim()) {
        localStorage.setItem('userEmail', email)
        onLoginSuccess(email)
      }
    } catch (error) {
      console.error('Gmail login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneLogin = async () => {
    setLoading(true)
    try {
      // Simulate Phone login
      if (phone.trim()) {
        localStorage.setItem('userPhone', phone)
        onLoginSuccess(phone)
      }
    } catch (error) {
      console.error('Phone login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-100 to-white flex items-center justify-center px-4">
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

            {/* Gmail Login Button */}
            <button
              onClick={() => setLoginMethod('email')}
              className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 flex items-center gap-3 transition-all hover:border-blue-500 hover:shadow-lg"
            >
              {/* Original Google G Icon */}
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900">Google</p>
                <p className="text-sm text-gray-600">Sign in with your Google account</p>
              </div>
            </button>

            {/* Phone Login Button */}
            <button
              onClick={() => setLoginMethod('phone')}
              className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 flex items-center gap-3 transition-all hover:border-blue-500 hover:shadow-lg"
            >
              <Phone className="text-blue-500" size={32} />
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900">Phone Number</p>
                <p className="text-sm text-gray-600">Sign in with your mobile number</p>
              </div>
            </button>
          </div>
        ) : loginMethod === 'email' ? (
          /* Gmail Login Form */
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button
              onClick={() => setLoginMethod(null)}
              className="text-blue-500 font-semibold mb-4 flex items-center gap-1"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Google Login</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                onClick={handleGmailLogin}
                disabled={!email || loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>
            </div>
          </div>
        ) : (
          /* Phone Login Form */
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button
              onClick={() => setLoginMethod(null)}
              className="text-blue-500 font-semibold mb-4 flex items-center gap-1"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Phone Number Login</h2>

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
                    className="w-20 px-3 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-center"
                  />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handlePhoneLogin}
                disabled={!phone || loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Continue with Phone'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  )
}
