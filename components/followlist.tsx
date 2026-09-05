'use client'

import React from 'react'

interface FollowListProps {
  onBack: () => void
  type: 'followers' | 'following' | 'visitors'
}

export default function FollowList({ onBack, type }: FollowListProps) {
  // Get the heading based on type
  const getHeading = () => {
    switch (type) {
      case 'followers':
        return 'Followers'
      case 'following':
        return 'Following'
      case 'visitors':
        return 'Visitors'
    }
  }

  // Get content based on type
  const getContent = () => {
    switch (type) {
      case 'followers':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <div key={item} className="flex items-center gap-4 py-3 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-gray-900">User {item}</div>
                  <div className="text-sm text-gray-500">@user{item}</div>
                </div>
              </div>
            ))}
          </div>
        )
      case 'following':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div key={item} className="flex items-center gap-4 py-3 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-gray-900">Following {item}</div>
                  <div className="text-sm text-gray-500">@following{item}</div>
                </div>
              </div>
            ))}
          </div>
        )
      case 'visitors':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-4 py-3 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-gray-900">Visitor {item}</div>
                  <div className="text-sm text-gray-500">Visited 2 hours ago</div>
                </div>
              </div>
            ))}
          </div>
        )
    }
  }

  // Handle back button click - calls the onBack prop
  const handleBack = () => {
    if (onBack) {
      onBack()
    }
  }

  return (
    <div 
      className="min-h-screen bg-white flex flex-col select-none"
      style={{ 
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--status-bar-height, 0px)) + 12px)',
        touchAction: 'manipulation',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Header - Only Back Arrow and Heading */}
      <div className="relative flex items-center justify-center w-full h-[56px] px-4 shrink-0">
        {/* Back Button - Left Corner */}
        <button
          onClick={handleBack}
          className="absolute left-4 flex items-center justify-center active:opacity-70 transition-opacity p-1 cursor-pointer"
          aria-label="Back"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-900"
          >
            <path 
              d="M15 18L9 12L15 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Heading - Center */}
        <h1 className="text-[17px] font-semibold text-gray-900">
          {getHeading()}
        </h1>
      </div>

      {/* Content */}
      {getContent()}
    </div>
  )
}
