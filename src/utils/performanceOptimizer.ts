// Mock performance optimizer for demo
export const optimizePerformance = () => {
  // No-op for demo
};

export const createIntersectionObserver = (callback: any, options?: any) => {
  return new IntersectionObserver(callback, options);
};