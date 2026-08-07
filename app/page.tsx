'use client'

import { useState, useEffect } from 'react'
import HomePage from '@/components/HomePage'
import LoginPage from '@/components/LoginPage'

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

  useEffect(() => {
    // Poll for forceLogout from owner panel
    const intervalId = setInterval(() => {
      const uid = localStorage.getItem("userUID")
      if (uid) {
        const forceLogout = localStorage.getItem(`forceLogout_${uid}`)
        if (forceLogout) {
          // Detected a force logout
          handleLogout()
        }
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const handleLoginSuccess = (credentials?: any) => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    const uid = localStorage.getItem("userUID")

    localStorage.removeItem('userEmail')
    localStorage.removeItem('userPhone')
    localStorage.removeItem("userName")
    localStorage.removeItem("userUID")
    localStorage.removeItem("userPhoto")

    if (uid) {
      localStorage.removeItem(`user_data_${uid}`)
      localStorage.removeItem(`session_${uid}`)
      localStorage.removeItem(`forceLogout_${uid}`)

      const loggedInSessions = JSON.parse(localStorage.getItem('loggedInSessions') || '{}')
      delete loggedInSessions[uid]
      localStorage.setItem('loggedInSessions', JSON.stringify(loggedInSessions))
    }

    setIsLoggedIn(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-100 to-white flex items-center justify-center">
        <div className="text-center">
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
