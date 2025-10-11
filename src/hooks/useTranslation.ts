// Stub useTranslation hook to prevent build errors
// All text is hardcoded Portuguese in components
export const useTranslation = (namespace?: string) => {
  return {
    t: (key: string, options?: any) => key,
    i18n: {
      language: 'pt',
      changeLanguage: () => Promise.resolve(),
      services: { resourceStore: { data: {} } },
      exists: () => false
    }
  };
};
