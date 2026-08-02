import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hawa.app',
  appName: 'Hawa',
  webDir: 'out',
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#282c34'
    }
  }
};

export default config;
