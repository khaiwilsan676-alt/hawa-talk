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
          await StatusBar.setStyle({ style: Style.Dark })
        }
      } catch (e) {
        console.warn('StatusBar plugin not available or failed:', e)
      }
    }

    applyStatusBar()

    // Robust DOM hide for any top "Hurry" node (runs client-side)
    function hideHurryNodes() {
      try {
        const candidates = Array.from(document.querySelectorAll('h1,h2,h3,div,span'))
        candidates.forEach((el) => {
          const text = (el.textContent || '').trim()
          if (!text) return
          // match the word Hurry (case-insensitive)
          if (/\bHurry\b/i.test(text)) {
            const rect = (el as HTMLElement).getBoundingClientRect()
            // only hide if near top of the viewport (likely header)
            if (rect.top >= 0 && rect.top < 160) {
              (el as HTMLElement).style.display = 'none'
            }
          }
        })
      } catch (err) {
        console.warn('hideHurryNodes error', err)
      }
    }

    // initial run
    hideHurryNodes()

    // observe DOM changes (for dynamic rendering)
    const mo = new MutationObserver(() => {
      hideHurryNodes()
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => mo.disconnect()
  }, [])

  return null
}
