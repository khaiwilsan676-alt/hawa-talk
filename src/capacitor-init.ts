import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

/**
 * Initialize Capacitor plugins on app startup
 */
export async function initializeCapacitor(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      // Hide status bar completely for full screen experience
      await StatusBar.hide();
    } catch (error) {
      console.warn('Failed to initialize Capacitor plugins:', error);
    }
  }
}
