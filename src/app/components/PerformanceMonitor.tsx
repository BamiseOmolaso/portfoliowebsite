'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function PerformanceMonitor() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Track LCP
    const trackLCP = () => {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const lastEntry = lcpEntries[lcpEntries.length - 1];
      
      if (lastEntry) {
        supabase
          .from('lcp_metrics')
          .insert([
            {
              value: lastEntry.startTime,
              url: window.location.href,
              user_agent: navigator.userAgent,
            },
          ])
          .then(({ error }) => {
            if (error) console.error('Error tracking LCP:', error);
          });
      }
    };

    // Track other performance metrics
    const trackPerformance = () => {
      const metrics = {
        fcp: performance.getEntriesByType('paint')
          .find(entry => entry.name === 'first-contentful-paint')?.startTime,
        ttfb: performance.timing.responseStart - performance.timing.requestStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        load: performance.timing.loadEventEnd - performance.timing.navigationStart,
      };

      supabase
        .from('performance_metrics')
        .insert([
          {
            metrics,
            url: window.location.href,
            user_agent: navigator.userAgent,
          },
        ])
        .then(({ error }) => {
          if (error) console.error('Error tracking performance:', error);
        });
    };

    // Set up observers
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          trackLCP();
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // Track initial performance metrics
    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      window.addEventListener('load', trackPerformance);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('load', trackPerformance);
    };
  }, []);

  return null;
} 