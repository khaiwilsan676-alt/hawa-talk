'use client'

import { useState, useEffect } from 'react'
import HomePage from '@/components/HomePage'
import LoginPage from '@/components/LoginPage'
import { account } from '@/src/lib/appwrite' // Path updated to @/src/lib/appwrite

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Appwrite Active Session Check (Specially for OAuth/Google Redirects)
        const user = await account.get()
        if (user) {
          setIsLoggedIn(true)
          setLoading(false)
          return
        }
      } catch (error) {
        // Appwrite active session nahi mila
      }

      // 2. LocalStorage Fallback Check
      const userUID = localStorage.getItem('userUID')
      const userEmail = localStorage.getItem('userEmail')
      const userPhone = localStorage.getItem('userPhone')

      if (userUID || userEmail || userPhone) {
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
      }

      setLoading(false)
    }

    initAuth()
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

  const handleLogout = async () => {
    const uid = localStorage.getItem("userUID")

    try {
      // Clear Appwrite Session
      await account.deleteSession('current')
    } catch (error) {
      console.log("Appwrite logout error:", error)
    }

    // Clear Local Storage
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userPhone')
    localStorage.removeItem("userName")
    localStorage.removeItem("userUID")
    localStorage.removeItem("userPhoto")
    localStorage.removeItem("accountNumber")

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
          <img src="/logo.png" alt="Hurry" className="w-20 h-20 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return <HomePage onLogout={handleLogout} />
}

