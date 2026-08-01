import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Initialize Capacitor plugins on app startup
 */
export async function initializeCapacitor(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      // Ensure the status bar overlays the webview and is transparent so the
      // app's header reaches the very top (full-screen look).
      // Keep Style.Light so icons/text are light (white) for dark header backgrounds.
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#00000000' }); // transparent
      // Overlay the web content so pages are full-screen under the status bar
      await StatusBar.setOverlaysWebView({ overlay: true });

      // Hide the status bar entirely so the app header is truly full-screen
      // (This uses the Capacitor StatusBar plugin at runtime.)
      await StatusBar.hide();
    } catch (error) {
      console.warn('Failed to initialize Capacitor plugins:', error);
    }
  }
}
