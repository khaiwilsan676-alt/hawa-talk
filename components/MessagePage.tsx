'use client'

import { CheckCircle } from 'lucide-react'

interface Message {
  id: string
  title: string
  subtitle: string
  date: string
  icon: string
  color: string
}

const messages: Message[] = [
  {
    id: '1',
    title: 'Activity',
    subtitle: '🏝️ Island Holiday Lucky Draw is Li...',
    date: '15/7/2026',
    icon: '🚩',
    color: 'bg-orange-500'
  },
  {
    id: '2',
    title: 'Family',
    subtitle: '',
    date: '',
    icon: '👨‍👩‍👧‍👦',
    color: 'bg-blue-500'
  },
  {
    id: '3',
    title: 'Feedback',
    subtitle: '',
    date: '',
    icon: '💬',
    color: 'bg-blue-500'
  }
]

export default function MessagePage() {
  return (
    <div className="w-full bg-gradient-to-b from-blue-100 to-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-400 to-blue-100 px-4 pt-6 pb-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-gray-800">Message</h1>
        <CheckCircle size={28} className="text-green-500" />
      </div>

      {/* Messages List */}
      <div className="px-4 space-y-4 pb-24">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex items-center gap-4 bg-white rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className={`w-16 h-16 ${message.color} rounded-full flex items-center justify-center text-2xl flex-shrink-0`}>
              {message.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg">{message.title}</h3>
              {message.subtitle && (
                <p className="text-gray-600 text-sm truncate">{message.subtitle}</p>
              )}
            </div>
            {message.date && (
              <div className="text-gray-400 text-sm whitespace-nowrap">{message.date}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
