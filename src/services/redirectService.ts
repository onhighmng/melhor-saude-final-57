// Mock redirect service for demo
export const redirectTo = (path: string) => {
  window.location.href = path;
};

export const redirectService = {
  redirectTo,
  setRedirectIntent: (intent: string) => {
    localStorage.setItem('redirect_intent', intent);
  }
};