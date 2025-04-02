'use client';

import { useEffect } from 'react';
import { measurePerformance, startPerformanceObserver } from '@/lib/performance';

export function PerformanceMonitor() {
  useEffect(() => {
    // Start performance monitoring
    measurePerformance();
    startPerformanceObserver();

    // Cleanup
    return () => {
      // Any cleanup if needed
    };
  }, []);

  return null; // This component doesn't render anything
} 