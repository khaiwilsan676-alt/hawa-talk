import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myproject.app',
  appName: 'my-project',
  webDir: 'out', // Next.js Static Export path - matches next.config.mjs distDir
  server: {
    androidScheme: 'https'
  }
};

export default config;