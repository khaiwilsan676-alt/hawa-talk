import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hawa.app',
  appName: 'Hurry',
  webDir: 'out',

  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
      backgroundColor: '#00000000'
    }
  }
};

export default config;
