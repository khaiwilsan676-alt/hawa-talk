import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hawa.app',
  appName: 'Hurry',
  webDir: 'out',

  plugins: {
    StatusBar: {
      style: 'LIGHT',
      overlaysWebView: false,
      backgroundColor: '#ffffff'
    }
  }
};

export default config;
