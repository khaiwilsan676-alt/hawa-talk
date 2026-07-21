import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myproject.app',
  appName: 'my-project',
  webDir: 'out', // Next.js Static Export path
  server: {
    androidScheme: 'https'
  }
};

export default config;

