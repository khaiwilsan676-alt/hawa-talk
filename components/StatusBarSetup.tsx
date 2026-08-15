'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'

export default function StatusBarSetup() {
  useEffect(() => {
    try {
      const platform = (Capacitor as any).getPlatform ? (Capacitor as any).getPlatform() : (Capacitor as any).platform
      if (platform && platform !== 'web') {
        // Overlay webview so app content can draw behind status bar
        StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {})
        // Transparent background
        StatusBar.setBackgroundColor({ color: '#00000000' }).catch(() => {})
        // Use dark icons - change to 'LIGHT' if you want white icons
        StatusBar.setStyle({ style: 'DARK' }).catch(() => {})
      }
    } catch (e) {
      // ignore on web
    }
  }, [])

  return null
}
