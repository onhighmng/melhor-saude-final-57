import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import Portuguese translations
import commonPt from './locales/pt/common.json';
import navigationPt from './locales/pt/navigation.json';
import userPt from './locales/pt/user.json';
import companyPt from './locales/pt/company.json';
import errorsPt from './locales/pt/errors.json';
import toastsPt from './locales/pt/toasts.json';
import specialistPt from './locales/pt/specialist.json';
import adminPt from './locales/pt/admin.json';
import providerPt from './locales/pt/provider.json';

// Import English translations
import commonEn from './locales/en/common.json';
import navigationEn from './locales/en/navigation.json';
import userEn from './locales/en/user.json';
import companyEn from './locales/en/company.json';
import errorsEn from './locales/en/errors.json';
import toastsEn from './locales/en/toasts.json';
import specialistEn from './locales/en/specialist.json';
import adminEn from './locales/en/admin.json';
import providerEn from './locales/en/provider.json';

const resources = {
  pt: {
    common: commonPt,
    navigation: navigationPt,
    user: userPt,
    company: companyPt,
    errors: errorsPt,
    toasts: toastsPt,
    specialist: specialistPt,
    admin: adminPt,
    provider: providerPt,
  },
  en: {
    common: commonEn,
    navigation: navigationEn,
    user: userEn,
    company: companyEn,
    errors: errorsEn,
    toasts: toastsEn,
    specialist: specialistEn,
    admin: adminEn,
    provider: providerEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded', // Re-render on language change
      bindI18nStore: 'added removed',
    },
    
    // Add language normalization
    load: 'languageOnly', // Load 'pt' instead of 'pt-BR'
    
    // Development-only debugging
    debug: import.meta.env.DEV,
  });

// Normalize language on initialization
const currentLang = i18n.language || 'pt';
const normalizedLang = currentLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';

if (normalizedLang !== i18n.language) {
  i18n.changeLanguage(normalizedLang);
}

// Simple initialization without aggressive cache busting
if (typeof window !== 'undefined') {
  console.log('[i18n] Initializing with language:', i18n.language);
  
  // Verify critical keys are loaded
  const criticalKeys = [
    'booking.providerAssignment.title',
    'assessment.chat.backButton',
    'navigation.help'
  ];
  
  // Check keys after a brief delay to ensure resources are loaded
  setTimeout(() => {
    const missingKeys = criticalKeys.filter(key => {
      const value = i18n.t(key);
      return value === key || value.includes('.');
    });
    
    if (missingKeys.length > 0) {
      console.warn('[i18n] Some keys may not be loaded:', missingKeys);
    } else {
      console.log('[i18n] All critical keys verified');
    }
  }, 100);
}

export default i18n;
