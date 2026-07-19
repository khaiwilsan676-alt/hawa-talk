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

      {/* Patli Si White Patti */}
      <div className="px-4 pt-4 pb-24">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 cursor-pointer">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="Hawa Logo" 
              width={40} 
              height={40} 
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm">Hawa Team</h3>
          </div>
        </div>
      </div>
    </div>
  )
}
