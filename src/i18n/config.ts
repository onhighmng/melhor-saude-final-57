// Stub i18n to prevent build errors - all text is hardcoded Portuguese in components
export default {
  t: (key: string) => key,
  language: 'pt',
  changeLanguage: () => Promise.resolve()
};
