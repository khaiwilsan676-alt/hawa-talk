import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

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
        {/* Ensure Android status bar color hint for PWAs */}
        <meta name="theme-color" content="#3b82f6" />
        {/* Inline script: hide accidental top "Hurry" text nodes and force transparent backgrounds in WebView */}
        <script dangerouslySetInnerHTML={{__html: `
          (function(){
            try{
              function hideHurryText(){
                // Hide any single-node elements that contain only the word "Hurry"
                var nodes = document.querySelectorAll('h1,h2,div,span');
                nodes.forEach(function(el){
                  if(!el) return;
                  var text = (el.textContent || '').trim();
                  if(text === 'Hurry'){
                    el.style.display = 'none';
                  }
                });

                // Make sure document background is transparent so native status bar shows through
                document.documentElement.style.background = 'transparent';
                document.body.style.background = 'transparent';

                // Add app-root class if not present
                document.body.classList.add('app-root');
              }

              if(document.readyState === 'loading'){
                document.addEventListener('DOMContentLoaded', hideHurryText);
              } else {
                hideHurryText();
              }
            }catch(e){console.warn('statusbar-helper', e)}
          })();
        `}} />
      </head>
      <body className="antialiased app-root bg-transparent" style={{paddingTop: 'env(safe-area-inset-top)'}}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
