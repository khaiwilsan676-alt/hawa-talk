'use client'

import { useEffect } from 'react'
import { StatusBar, Style } from '@capacitor/status-bar'

export default function StatusBarController() {
  useEffect(() => {
    const setup = async () => {
      try {
        // Status bar overlays the WebView = TRUE fullscreen/edge-to-edge
        await StatusBar.setOverlaysWebView({ overlay: true })

        // Transparent status bar
        await StatusBar.setBackgroundColor({
          color: '#00000000',
        })

        // Dark Android status-bar icons
        await StatusBar.setStyle({
          style: Style.Dark,
        })
      } catch (error) {
        console.warn('StatusBar setup failed:', error)
      }
    }

    setup()
  }, [])

  return null
}
