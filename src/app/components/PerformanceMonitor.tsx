'use client';

import { useEffect } from 'react';
import { measurePerformance, startPerformanceObserver } from '@/lib/performance';

export function PerformanceMonitor(): null {
  useEffect(() => {
    try {
      // Start performance monitoring
      measurePerformance();
      startPerformanceObserver();
    } catch (error) {
      console.error('Error in performance monitoring:', error);
    }

    // Cleanup
    return () => {
      // Any cleanup if needed
    };
  }, []);

  return null; // This component doesn't render anything
} 