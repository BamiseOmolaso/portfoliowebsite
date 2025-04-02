export function measurePerformance() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const timing = window.performance.timing;
    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    const metrics = {
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnection: timing.connectEnd - timing.connectStart,
      serverResponse: timing.responseEnd - timing.requestStart,
      domProcessing: timing.domComplete - timing.domLoading,
      pageLoad: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      loadEventEnd: timing.loadEventEnd - timing.navigationStart,
    };

    // Send metrics to your analytics service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      }).catch(console.error);
    }

    return metrics;
  }
  return null;
}

export function startPerformanceObserver() {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          // Send LCP metric to your analytics service
          if (process.env.NODE_ENV === 'production') {
            fetch('/api/performance/lcp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                value: entry.startTime,
                url: window.location.href,
              }),
            }).catch(console.error);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }
} 