'use client'

import { useState } from 'react'
import { Mail, Phone } from 'lucide-react'

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
          <img src="/logo.png" alt="Hawa" className="w-20 h-20 mx-auto mb-4" />
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
              <Mail className="text-red-500" size={32} />
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900">Gmail</p>
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

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gmail Login</h2>

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
                {loading ? 'Signing in...' : 'Continue with Gmail'}
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
