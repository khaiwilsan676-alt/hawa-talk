'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { translations, LanguageCode } from '../lib/translations'

interface LanguagePageProps {
  onBack: () => void
}

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe' },
]

export default function LanguagePage({ onBack }: LanguagePageProps) {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en')
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage') as LanguageCode
    if (savedLang && Object.keys(translations).includes(savedLang)) {
      setSelectedLang(savedLang)
    }
  }, [])

  const handleLanguageSelect = (code: string) => {
    const langCode = code as LanguageCode
    setSelectedLang(langCode)
    localStorage.setItem('appLanguage', langCode)

    // Dispatch a custom event to notify other components (e.g. HomePage, MePage)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { lang: langCode } }))

    handleClose()
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onBack()
    }, 300) // matches animation duration
  }

  const t = translations[selectedLang]

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: isClosing ? 0 : 1 }}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className="relative bg-white w-full rounded-t-3xl overflow-hidden shadow-2xl transition-transform duration-300 ease-in-out"
        style={{
          transform: isClosing ? 'translateY(100%)' : 'translateY(0)',
          maxHeight: '80vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
            >
              <ChevronLeft size={24} className="text-gray-900" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">{t.languageSetting || 'Language'}</h2>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          {/* Language List */}
          <div className="overflow-y-auto px-4 py-2 bg-gray-50 flex-1 hide-scrollbar">
            <div className="bg-white rounded-2xl overflow-hidden mt-2 mb-6 border border-gray-100">
              {LANGUAGES.map((lang, index) => (
                <div key={lang.code}>
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 transition-colors active:bg-blue-100"
                    onClick={() => handleLanguageSelect(lang.code)}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{lang.native}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{lang.label}</span>
                    </div>

                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center transition-colors">
                      {selectedLang === lang.code && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  {index < LANGUAGES.length - 1 && (
                    <div className="h-[1px] bg-gray-100 mx-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
