import { Capacitor } from '@capacitor/core'

/**
 * Initialize Capacitor-specific startup behavior.
 * Native status bar styling is handled by Android MainActivity and capacitor.config.ts.
 */
export async function initializeCapacitor(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
}
