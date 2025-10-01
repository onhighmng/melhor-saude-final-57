import { NavigateFunction } from 'react-router-dom';

// Navigation function to be set by the app
let navigateFunction: NavigateFunction | null = null;

export const setNavigateFunction = (navigate: NavigateFunction) => {
  navigateFunction = navigate;
};

export const redirectTo = (path: string) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    // Fallback to window.location for external URLs or if navigate not set
    window.location.href = path;
  }
};

export const redirectService = {
  redirectTo,
  setRedirectIntent: (intent: string) => {
    localStorage.setItem('redirect_intent', intent);
  }
};