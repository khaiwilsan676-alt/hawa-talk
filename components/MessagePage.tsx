'use client'

import { CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function MessagePage() {
  return (
    <div className="w-full bg-gradient-to-b from-blue-100 to-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-400 to-blue-100 px-4 pt-6 pb-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-gray-800">Message</h1>
        <CheckCircle size={28} className="text-green-500" />
      </div>

      {/* Messages List - Single Compact Patti */}
      <div className="px-4 pb-24 pt-4">
        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="Hawa Logo" 
              width={56} 
              height={56} 
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg">Hawa</h3>
          </div>
        </div>
      </div>
    </div>
  )
}
