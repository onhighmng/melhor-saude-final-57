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

// Aggressively force reload translations to prevent cache issues
if (typeof window !== 'undefined') {
  // Clear localStorage i18n cache
  const i18nKeys = Object.keys(localStorage).filter(key => key.startsWith('i18next'));
  i18nKeys.forEach(key => localStorage.removeItem(key));
  
  // Clear resource store
  i18n.services.resourceStore.data = {};
  
  console.log('[i18n] Clearing cache and reloading resources...');
  console.log('[i18n] Current language:', i18n.language);
  
  // Reload all resources with retry logic
  const reloadWithRetry = async (attempt = 1) => {
    try {
      await i18n.reloadResources(
        ['pt', 'en'], 
        ['user', 'common', 'navigation', 'company', 'admin', 'provider', 'specialist', 'errors', 'toasts']
      );
      
      console.log('[i18n] Resources reloaded successfully');
      
      // Verify booking keys loaded
      const testKey = i18n.t('user:booking.providerAssignment.title');
      console.log('[i18n] Test key value:', testKey);
      
      if (testKey === 'booking.providerAssignment.title') {
        console.warn('[i18n] Keys still not loading, forcing language toggle...');
        const currentLang = i18n.language;
        await i18n.changeLanguage(currentLang === 'pt' ? 'en' : 'pt');
        await i18n.changeLanguage(currentLang);
      }
      
      // Force re-render
      i18n.changeLanguage(i18n.language);
      
    } catch (error) {
      console.error(`[i18n] Reload attempt ${attempt} failed:`, error);
      if (attempt < 3) {
        setTimeout(() => reloadWithRetry(attempt + 1), 1000);
      }
    }
  };
  
  reloadWithRetry();
}

export default i18n;
