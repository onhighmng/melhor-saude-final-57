
export interface PageInfo {
  path: string;
  name: string;
  timestamp: number;
}

const NAVIGATION_HISTORY_KEY = 'navigation_history';
const MAX_HISTORY_SIZE = 10;

export const navigationService = {
  setCurrentPage: (path: string, name: string) => {
    try {
      const history = navigationService.getHistory();
      const newPage: PageInfo = {
        path,
        name,
        timestamp: Date.now()
      };

      // Remove if already exists to avoid duplicates
      const filteredHistory = history.filter(page => page.path !== path);
      
      // Add to beginning and limit size
      const updatedHistory = [newPage, ...filteredHistory].slice(0, MAX_HISTORY_SIZE);
      
      localStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(updatedHistory));
      console.log('📍 Navigation: Set current page:', name, 'at', path);
    } catch (error) {
      console.error('Error setting current page:', error);
    }
  },

  getPreviousPage: (): PageInfo | null => {
    try {
      const history = navigationService.getHistory();
      // Return the second item (index 1) as the previous page
      return history[1] || null;
    } catch (error) {
      console.error('Error getting previous page:', error);
      return null;
    }
  },

  getHistory: (): PageInfo[] => {
    try {
      const stored = localStorage.getItem(NAVIGATION_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting navigation history:', error);
      return [];
    }
  },

  clearHistory: () => {
    localStorage.removeItem(NAVIGATION_HISTORY_KEY);
    console.log('🧹 Navigation history cleared');
  },

  getDefaultBackPage: (): PageInfo => {
    return {
      path: '/',
      name: 'Início',
      timestamp: Date.now()
    };
  }
};
