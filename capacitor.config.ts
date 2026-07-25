import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hawa.app',
  appName: 'Hawa',
  webDir: 'out',
  server: {
    url: 'https://jb-hm.vercel.app', // Yaha apna actual Vercel wala link daal de
    cleartext: true
  }
};

export default config;

