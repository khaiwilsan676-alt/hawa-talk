import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hawa.app',
  appName: 'Hawa',
  webDir: 'out',
  plugins: {
    StatusBar: {
      overlay: false,
      style: 'DARK',
      backgroundColor: '#3b82f6'
    }
  }
};

export default config;
