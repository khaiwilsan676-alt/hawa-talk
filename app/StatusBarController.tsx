'use client'

import { useEffect } from 'react'
import { StatusBar, Style } from '@capacitor/status-bar'

export default function StatusBarController() {
  useEffect(() => {
    const setup = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false })
        await StatusBar.setStyle({ style: Style.Dark })
      } catch (error) {
        console.warn('StatusBar setup failed:', error)
      }
    }

    setup()
  }, [])

  return null
}
