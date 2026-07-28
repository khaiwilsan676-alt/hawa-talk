import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hawa.app',
  appName: 'Hawa',
  webDir: 'out',

  server: {
    url: 'https://jb-hm.vercel.app', // Apna Vercel URL
    cleartext: false
  }
};

export default config;
