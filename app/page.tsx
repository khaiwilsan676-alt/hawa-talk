'use client'

import { useState, useEffect } from 'react'
import HomePage from '@/components/HomePage'
import LoginPage from '@/components/LoginPage'
import { auth } from '@/src/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true)
        setLoading(false)
      } else {
        // Fallback to LocalStorage Check
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
    });

    return () => unsubscribe();
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
      // Clear Firebase Session
      await signOut(auth)
    } catch (error) {
      console.log("Firebase logout error:", error)
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
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-100 to-white flex flex-col items-center pt-[15vh]">
        <img
          src="/logo.png"
          alt="Hurry Logo"
          className="w-24 h-24 rounded-2xl object-cover shadow-md"
        />
        <h1 className="mt-[0.5rem] text-2xl font-bold text-white tracking-wide">
          Hurry
        </h1>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return <HomePage onLogout={handleLogout} />
}

