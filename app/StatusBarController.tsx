'use client'

import { useEffect } from 'react'
import { StatusBar, Style } from '@capacitor/status-bar'

export default function StatusBarController() {
  useEffect(() => {
    // Capacitor status bar runtime calls
    async function applyStatusBar() {
      try {
        // overlay webview so content can draw behind status bar
        if ((StatusBar as any).setOverlaysWebView) {
          await StatusBar.setOverlaysWebView({ overlay: true })
        }

        // set transparent background
        if ((StatusBar as any).setBackgroundColor) {
          await StatusBar.setBackgroundColor({ color: '#00000000' })
        }

        // set style dark so icons remain visible (adjust if needed)
        if ((StatusBar as any).setStyle) {
          await StatusBar.setStyle({ style: Style.Light })
        }
      } catch (e) {
        console.warn('StatusBar plugin not available or failed:', e)
      }
    }

    applyStatusBar()


  }, [])

  return null
}
