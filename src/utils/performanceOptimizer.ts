// Performance optimization utilities

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Image lazy loading helper
export const lazyLoadImage = (img: HTMLImageElement, src: string) => {
  const observer = createIntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        target.src = src;
        target.classList.add('loaded');
        observer.unobserve(target);
      }
    });
  });
  
  observer.observe(img);
  return observer;
};

// Resource prefetching
export const prefetchResource = (href: string, as: string = 'fetch') => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
};

// Critical resource preloading
export const preloadResource = (href: string, as: string, type?: string) => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  }
};

// Bundle size analyzer helper
export const logBundleSize = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Loaded component: ${componentName}`);
  }
};

// Memory cleanup helper
export const createCleanupHelper = () => {
  const observers: IntersectionObserver[] = [];
  const timeouts: NodeJS.Timeout[] = [];
  const intervals: NodeJS.Timeout[] = [];
  
  return {
    addObserver: (observer: IntersectionObserver) => observers.push(observer),
    addTimeout: (timeout: NodeJS.Timeout) => timeouts.push(timeout),
    addInterval: (interval: NodeJS.Timeout) => intervals.push(interval),
    cleanup: () => {
      observers.forEach(observer => observer.disconnect());
      timeouts.forEach(timeout => clearTimeout(timeout));
      intervals.forEach(interval => clearInterval(interval));
    }
  };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development' && 'performance' in window) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`⚡ ${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

// Critical CSS inlining helper
export const inlineCriticalCSS = (css: string) => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
};