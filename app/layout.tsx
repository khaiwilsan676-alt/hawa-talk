import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import StatusBarController from './StatusBarController'

export const metadata: Metadata = {
  title: 'Hurry - Chat & Connect',
  description: 'Connect with friends on Hurry. Chat, share moments, and discover popular content.',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png?v=2',
    apple: '/logo.png?v=2',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Hurry" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="antialiased app-root bg-transparent" style={{paddingTop: 'env(safe-area-inset-top)'}}>
        {/* Client runtime controller: StatusBar plugin + DOM fixes */}
        <StatusBarController />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
