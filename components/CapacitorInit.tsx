'use client';

import { useEffect } from 'react';
import { initializeCapacitor } from '../src/capacitor-init';

export function CapacitorInit() {
  useEffect(() => {
    initializeCapacitor();
  }, []);

  return null;
}
