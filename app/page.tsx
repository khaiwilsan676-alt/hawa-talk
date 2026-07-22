'use client'

import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const userEmail = localStorage.getItem('userEmail')
    const userPhone = localStorage.getItem('userPhone')
    
    if (userEmail || userPhone) {
      setIsLoggedIn(true)
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (credentials?: any) => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userPhone')
    setIsLoggedIn(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-100 to-white flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.png" alt="Hawa" className="w-20 h-20 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return <HomePage onLogout={handleLogout} />
}
