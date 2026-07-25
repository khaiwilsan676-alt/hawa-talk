import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hawa.app',
  appName: 'Hawa',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
