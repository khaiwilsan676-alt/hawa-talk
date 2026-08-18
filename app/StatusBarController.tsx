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

        // set style dark so icons remain visible on status bar
        if ((StatusBar as any).setStyle) {
          await StatusBar.setStyle({ style: Style.Dark })
        }

        // Get status bar height and set CSS custom property
        if ((StatusBar as any).getInfo) {
          const info = await StatusBar.getInfo()
          if (info && typeof info.height === 'number' && info.height > 0) {
            document.documentElement.style.setProperty('--status-bar-height', `${info.height}px`)
          }
        }
      } catch (e) {
        console.warn('StatusBar plugin not available or failed:', e)
      }
    }

    applyStatusBar()
  }, [])

  return null
}
