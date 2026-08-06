import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hawa.app',
  appName: 'Hawa',
  webDir: 'out',
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
      backgroundColor: '#80000000'
    }
  }
};

export default config;
