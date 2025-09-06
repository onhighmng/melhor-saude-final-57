import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export const PerformanceMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'performance' in window) {
      const metrics: PerformanceMetrics = {};

      // Measure Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
              break;
            case 'largest-contentful-paint':
              metrics.lcp = entry.startTime;
              break;
            case 'first-input':
              metrics.fid = (entry as any).processingStart - entry.startTime;
              break;
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                metrics.cls = (metrics.cls || 0) + (entry as any).value;
              }
              break;
            case 'navigation':
              const navEntry = entry as PerformanceNavigationTiming;
              metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
              break;
          }
        });

        // Log metrics periodically
        setTimeout(() => {
          console.group('🚀 Performance Metrics');
          console.log('First Contentful Paint:', metrics.fcp?.toFixed(2), 'ms');
          console.log('Largest Contentful Paint:', metrics.lcp?.toFixed(2), 'ms');
          console.log('First Input Delay:', metrics.fid?.toFixed(2), 'ms');
          console.log('Cumulative Layout Shift:', metrics.cls?.toFixed(4));
          console.log('Time to First Byte:', metrics.ttfb?.toFixed(2), 'ms');
          console.groupEnd();
        }, 3000);
      });

      // Observe different entry types
      try {
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });
      } catch (e) {
        // Fallback for browsers that don't support all entry types
        observer.observe({ entryTypes: ['paint', 'navigation'] });
      }

      return () => observer.disconnect();
    }
  }, []);

  return null; // This component doesn't render anything
};