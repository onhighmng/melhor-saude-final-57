
export interface RedirectIntent {
  path: string;
  timestamp: number;
}

const REDIRECT_INTENT_KEY = 'auth_redirect_intent';
const INTENT_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

export const redirectService = {
  setRedirectIntent: (path: string) => {
    const intent: RedirectIntent = {
      path,
      timestamp: Date.now()
    };
    localStorage.setItem(REDIRECT_INTENT_KEY, JSON.stringify(intent));
    console.log('🎯 Redirect intent set:', path);
  },

  getRedirectIntent: (): string | null => {
    try {
      const stored = localStorage.getItem(REDIRECT_INTENT_KEY);
      if (!stored) return null;

      const intent: RedirectIntent = JSON.parse(stored);
      
      // Check if intent has expired
      if (Date.now() - intent.timestamp > INTENT_EXPIRY_TIME) {
        localStorage.removeItem(REDIRECT_INTENT_KEY);
        return null;
      }

      return intent.path;
    } catch (error) {
      console.error('Error getting redirect intent:', error);
      return null;
    }
  },

  clearRedirectIntent: () => {
    localStorage.removeItem(REDIRECT_INTENT_KEY);
    console.log('🧹 Redirect intent cleared');
  },

  getDefaultRedirect: (): string => {
    return '/user/dashboard';
  }
};
