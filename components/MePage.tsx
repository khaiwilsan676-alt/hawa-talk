'use client' 

import React, { useEffect, useState } from 'react'
import { ChevronRight, Copy, ArrowLeft } from 'lucide-react'
import SettingPage from './settingpage'
import PublicProfile from './PublicProfile'
import HurrySupport from './HurrySupport'
import LanguagePage from './LanguagePage'
import { translations, getTranslation, LanguageCode } from '../lib/translations'

import { doc, getDoc, onSnapshot, collection, addDoc , db} from "../src/lib/supabase"

interface MenuItem {
  id: string
  labelKey: keyof typeof translations['en']
  src?: string
  icon?: React.ReactNode
  action?: string
  badge?: string
}

interface MePageProps {
  onLogout?: () => void
  onPublicProfileChange?: (isOpen: boolean) => void
}

const menuItems: MenuItem[] = [
  { id: '1', labelKey: 'inviteFriends', src: '/1784562849790.png' },
  { id: '2', labelKey: 'family', src: '/IMG_20260720_142354.png' },
  { id: '3', labelKey: 'level', src: '/IMG_20260720_211413.png' },
  { id: '4', labelKey: 'medal', src: '/1784621763019.png' },
  { id: '5', labelKey: 'store', src: '/IMG_20260720_142332.png' },
  { id: '6', labelKey: 'bag', src: '/IMG_20260720_142227.png' }
]

const bottomMenuItems: MenuItem[] = [
  {
    id: '7',
    labelKey: 'languageSetting',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"></path>
      </svg>
    )
  },
  {
    id: '8',
    labelKey: 'settings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4.67v9.33L12 22l-8-4.67V6.67L12 2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  },
  {
    id: '9',
    labelKey: 'customerService',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.5 11 V8.5 C5.5 5 8.2 3 12 3 C15.8 3 18.5 5 18.5 8.5 V15.2 C18.5 18.5 16.2 21 12 21"/>
        <path d="M3 10.2 V13.8 C3 14.6 3.5 15.2 4.2 15.2 H5.5 V9 H4.2 C3.5 9 3 9.5 3 10.2 Z"/>
        <path d="M18.5 9 V15.2 H19.8 C20.5 15.2 21 14.6 21 13.8 V10.2 C21 9.4 20.5 9 19.8 9 H18.5"/>
        <path d="M9.2 13.8 C9.2 15 10.3 16 12 16 C13.7 16 14.8 15 14.8 13.8"/>
      </svg>
    )
  },
  {
    id: '10',
    labelKey: 'helpFeedback',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )
  }
]

// Official/Admin IDs list
const OFFICIAL_IDS = ['500001', '500002', '500003', '500004', '500005']
const ADMIN_IDS = ['700001', '700002', '700003']

// Feedback Types
const FEEDBACK_TYPES = [
  { id: 'app_bug', label: 'App Bug', icon: '' },
  { id: 'suggestion', label: 'Suggestion', icon: '' },
  { id: 'recharge', label: 'Recharge', icon: '' },
  { id: 'others', label: 'Others', icon: '' }
]

export const getOrCreateAccountNumber = (uid: string) => {
  if (!uid || uid === 'N/A') return { fullAccNum: 'N/A', displayAccNum: 'N/A' }

  // Check if it's an official or admin ID
  if (OFFICIAL_IDS.includes(uid) || ADMIN_IDS.includes(uid)) {
    return { fullAccNum: uid, displayAccNum: uid }
  }

  // Check stored account number first
  const savedAcc = localStorage.getItem('accountNumber')
  if (savedAcc) {
    return { fullAccNum: savedAcc, displayAccNum: savedAcc }
  }

  // Consistent 8-digit calculation based on UID
  let hash = 0
  for (let i = 0; i < uid.length; i++) {
    hash = (hash << 5) - hash + uid.charCodeAt(i)
    hash |= 0
  }
  const positiveHash = Math.abs(hash)
  const generated = String(10000000 + (positiveHash % 90000000))
  
  return { fullAccNum: generated, displayAccNum: generated }
}

export default function MePage({ onLogout, onPublicProfileChange }: MePageProps) {
  const [currentView, setCurrentView] = useState<'me' | 'settings' | 'public_profile' | 'customer_service' | 'language'>('me')
  const [appLang, setAppLang] = useState<LanguageCode>('en')
  
  // Feedback States
  const [showFeedbackPage, setShowFeedbackPage] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')
  const [problemDescription, setProblemDescription] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage') as LanguageCode
    if (savedLang) {
      setAppLang(savedLang)
    }

    const handleLangChange = (e: CustomEvent) => {
      if (e.detail && e.detail.lang) {
        setAppLang(e.detail.lang)
      }
    }

    window.addEventListener('languageChange', handleLangChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLangChange as EventListener)
  }, [])

  const t = getTranslation(appLang)

  const [user, setUser] = useState({
    name: "Guest",
    uid: "",
    accountNumber: "",
    displayAccountNumber: "",
    phone: "",
    photo: "",
  })

  const switchView = (view: 'me' | 'settings' | 'public_profile' | 'customer_service' | 'language') => {
    setCurrentView(view)
    if (onPublicProfileChange) {
      onPublicProfileChange(view !== 'me')
    }
  }

  // Handle Feedback Submit
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);

    if (!selectedType) {
      setFeedbackError("Please select a type of issue");
      return;
    }
    if (!problemDescription.trim()) {
      setFeedbackError("Please describe your problem");
      return;
    }
    if (!contactInfo.trim()) {
      setFeedbackError("Please enter your contact information");
      return;
    }

    setFeedbackSubmitting(true);

    try {
      const feedbackData = {
        type: selectedType,
        typeLabel: FEEDBACK_TYPES.find(t => t.id === selectedType)?.label || selectedType,
        description: problemDescription.trim(),
        contactInfo: contactInfo.trim(),
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
        status: 'pending'
      };

      await addDoc(collection(db, "feedbacks"), feedbackData);
      
      setFeedbackSuccess(true);
      setSelectedType('');
      setProblemDescription('');
      setContactInfo('');
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setShowFeedbackPage(false);
        setFeedbackSuccess(false);
      }, 2000);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackError("Failed to submit feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const name = localStorage.getItem("userName") || "Guest"
      const uid = localStorage.getItem("userUID") || localStorage.getItem("userPhone") || "N/A"
      const phone = localStorage.getItem("userPhone") || ""
      const photo = localStorage.getItem("userPhoto") || ""

      let finalAccNum = localStorage.getItem("accountNumber") || ""

      // 1. Fetch exact accountId directly from Firestore 'users' collection
      if (uid && uid !== "N/A") {
        try {
          const userDocRef = doc(db, "users", uid)
          const docSnap = await getDoc(userDocRef)
          if (docSnap.exists() && docSnap.data().accountId) {
            finalAccNum = String(docSnap.data().accountId)
            localStorage.setItem("accountNumber", finalAccNum)
          }
        } catch (err) {
          console.warn("Firestore user fetch error in MePage:", err)
        }
      }

      // Fallback calculation if no Firestore accountId exists
      if (!finalAccNum) {
        const { fullAccNum } = getOrCreateAccountNumber(uid)
        finalAccNum = fullAccNum
      }

      setUser({ 
        name, 
        uid, 
        accountNumber: finalAccNum, 
        displayAccountNumber: finalAccNum, 
        phone, 
        photo
      })
    }

    fetchUserData()

    window.addEventListener("storage", fetchUserData)
    return () => window.removeEventListener("storage", fetchUserData)
  }, [])

  const handleCopyAccountNumber = () => {
    if (user.displayAccountNumber && user.displayAccountNumber !== 'N/A') {
      navigator.clipboard.writeText(user.displayAccountNumber)
      alert("ID Copied to clipboard!")
    }
  }

  const isSpecialUID = user.uid === 'HUSxSvQnabgU029dWYt1TUV04hd2' || user.uid === 'ADqW31RGBMaosOzy0HiqexKSD7h1'

  // Feedback Page View
  if (showFeedbackPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => {
              setShowFeedbackPage(false);
              setFeedbackSuccess(false);
              setFeedbackError(null);
              setSelectedType('');
              setProblemDescription('');
              setContactInfo('');
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 ml-3">{t.helpFeedback}</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-md mx-auto">
            {feedbackSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-green-700 mb-2">Thank You!</h2>
                <p className="text-green-600">Your feedback has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                {/* Type of Issue */}
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-3">Type of Issue</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {FEEDBACK_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          selectedType === type.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className={`text-sm font-medium ${
                          selectedType === type.id ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-3">Problem Description</h2>
                  <div className="relative">
                    <textarea
                      value={problemDescription}
                      onChange={(e) => {
                        if (e.target.value.length <= 400) {
                          setProblemDescription(e.target.value);
                        }
                      }}
                      placeholder="Describe your issue or suggestion..."
                      maxLength={400}
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 bg-white resize-none"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {problemDescription.length}/400
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-3">Contact Information</h2>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Enter your email, Gmail or App ID"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 bg-white"
                  />
                </div>

                {/* Error Message */}
                {feedbackError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {feedbackError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-2xl transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-blue-600/20 text-base"
                >
                  {feedbackSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'language') {
    return <LanguagePage onBack={() => switchView('me')} />
  }

  if (currentView === 'customer_service') {
    return <HurrySupport onBack={() => switchView('me')} />
  }

  if (currentView === 'settings') {
    return <SettingPage onBack={() => switchView('me')} onLogout={onLogout} />
  }

  if (currentView === 'public_profile') {
    return <PublicProfile onBack={() => switchView('me')} />
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Profile Header */}
      <div
        className="px-4 pb-6 relative"
        style={{
          background: 'linear-gradient(to bottom, #3b82f6 0%, #eff6ff 70%, #ffffff 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)'
        }}
      >
        {/* User Card */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {user.photo ? (
              <img
                src={user.photo}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/60 shadow-sm"
                alt="Profile"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-4xl text-white font-bold border-2 border-white/60 shadow-sm">
                {user.name.charAt(0).toUpperCase() || "G"}
              </div>
            )}

            <div className="flex flex-col">
              {/* Name */}
              <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{user.name}</h2>

              {/* Account Number Display */}
              <div className="flex items-center gap-1 mt-1">
                {isSpecialUID ? (
                  <div className="relative inline-block w-22">
                    <img
                      src="/1785138451098~2.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain rounded-md"
                    />
                    <p className="relative text-white font-bold px-3 py-1.5 z-10 text-xs" style={{ paddingLeft: '30px' }}>
                      {user.accountNumber}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-700 text-xs font-semibold">
                    ID: {user.displayAccountNumber}
                  </p>
                )}

                {user.accountNumber !== 'N/A' && (
                  <button
                    onClick={handleCopyAccountNumber}
                    className="text-gray-600 hover:text-blue-900 transition-colors p-1 cursor-pointer"
                    title="Copy ID"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>

              {user.phone && (
                <p className="text-gray-600 text-xs mt-0.5 font-semibold">
                  {user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Top Right Arrow - View Public Profile */}
          <button
            onClick={() => switchView('public_profile')}
            className="p-2 hover:bg-white/20 rounded-full transition-colors mt-2 cursor-pointer"
            title="View Public Profile"
          >
            <ChevronRight className="text-gray-700" size={24} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-600 mt-1">{t.followers}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-600 mt-1">{t.following}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-600 mt-1">{t.visitors}</div>
          </div>
        </div>

        {/* Banner Images */}
        <div className="flex gap-1 mt-6">
          <div className="flex-1 rounded-lg overflow-hidden">
            <img
              src="/1784480382765~2.jpg"
              alt="Feature 1"
              className="w-full h-14 object-cover"
            />
          </div>
          <div className="flex-1 rounded-lg overflow-hidden">
            <img
              src="/1784480368941~2.jpg"
              alt="Feature 2"
              className="w-full h-14 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Menu Items */}
      <div className="px-4 mt-1">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {menuItems.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <img
                    src={item.src}
                    alt={t[item.labelKey]}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t[item.labelKey]}</p>
                </div>
                {item.action && (
                  <span className="text-sm font-medium text-gray-500">{item.action}</span>
                )}
                {item.badge && (
                  <span className="bg-blue-300 text-xs font-bold px-2 py-1 rounded-full text-gray-900">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={20} className="text-gray-400" />
              </div>
              {index < menuItems.length - 1 && (
                <div className="h-[0.5px] bg-gray-200 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Menu Items */}
      <div className="px-4 mt-4 mb-6">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {bottomMenuItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.id === '7') switchView('language')
                if (item.id === '8') switchView('settings')
                if (item.id === '9') switchView('customer_service')
                if (item.id === '10') setShowFeedbackPage(true)
              }}
            >
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 text-gray-700">
                  {item.icon}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t[item.labelKey]}</p>
                </div>
                {item.action && (
                  <span className="text-sm font-medium text-gray-500">{item.action}</span>
                )}
                {item.badge && (
                  <span className="bg-blue-300 text-xs font-bold px-2 py-1 rounded-full text-gray-900">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={20} className="text-gray-400" />
              </div>
              {index < bottomMenuItems.length - 1 && (
                <div className="h-[0.5px] bg-gray-200 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recharge Event Floating Card */}
      <div className="fixed bottom-24 right-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-md cursor-pointer">
        <div className="text-center text-sm">
          <div className="text-2xl mb-1"></div>
          <div className="text-xs font-bold text-blue-800">Recharge</div>
          <div className="text-xs font-bold text-blue-800">Event</div>
        </div>
      </div>
    </div>
  )
    }
