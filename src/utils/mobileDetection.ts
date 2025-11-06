/**
 * Mobile detection utilities for responsive design
 */

export const MOBILE_BREAKPOINT = 768; // Same as Tailwind 'md' breakpoint

/**
 * Check if the current viewport is mobile size
 */
export const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
};

/**
 * Check if device is actually a mobile device (not just small viewport)
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for mobile user agents
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  return mobileRegex.test(userAgent.toLowerCase());
};

/**
 * Combined check: Is mobile viewport OR mobile device
 */
export const shouldUseMobileUI = (): boolean => {
  return isMobileViewport() || isMobileDevice();
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return ('ontouchstart' in window) || 
         (navigator.maxTouchPoints > 0) || 
         ((navigator as any).msMaxTouchPoints > 0);
};

