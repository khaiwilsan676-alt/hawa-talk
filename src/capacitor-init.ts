import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Initialize Capacitor plugins on app startup
 */
export async function initializeCapacitor(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      // Configure status bar for edge to edge
      await StatusBar.setOverlaysWebView({ overlay: true });
      // In light mode we want dark icons
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (error) {
      console.warn('Failed to initialize Capacitor plugins:', error);
    }
  }
}
