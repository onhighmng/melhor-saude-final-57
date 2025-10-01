// Mock navigation service for demo
export const trackPageView = (path: string) => {
  console.log('Page view:', path);
};

export const navigationService = {
  trackPageView,
  setCurrentPage: (pathname: string, pageName: string) => {
    console.log('Current page:', pathname, pageName);
  }
};