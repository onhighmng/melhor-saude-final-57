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

// Version-based cache busting - increment when translations change
const TRANSLATION_VERSION = '2.0.1';

if (typeof window !== 'undefined') {
  const sessionKey = 'i18n_loaded_v' + TRANSLATION_VERSION;
  
  // Check if we've already loaded this version in this session
  if (!sessionStorage.getItem(sessionKey)) {
    console.log('[i18n] New translation version detected, clearing all caches...');
    
    // Nuclear option: clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Mark this version as being loaded
    sessionStorage.setItem(sessionKey, 'true');
    
    // Force page reload to get fresh resources (only once)
    if (!window.location.search.includes('i18n_reloaded')) {
      window.location.search = '?i18n_reloaded=true';
      throw new Error('Reloading for i18n cache clear'); // Prevent further execution
    }
  }
  
  // Clear resource store for regular reloads
  i18n.services.resourceStore.data = {};
  
  console.log('[i18n] Reloading resources...');
  console.log('[i18n] Current language:', i18n.language);
  console.log('[i18n] Translation version:', TRANSLATION_VERSION);
  
  // Reload all resources with retry logic
  const reloadWithRetry = async (attempt = 1) => {
    try {
      await i18n.reloadResources(
        ['pt', 'en'], 
        ['user', 'common', 'navigation', 'company', 'admin', 'provider', 'specialist', 'errors', 'toasts']
      );
      
      console.log('[i18n] Resources reloaded successfully');
      
      // Verify critical keys loaded
      const criticalKeys = [
        'user:booking.providerAssignment.title',
        'user:assessment.chat.backButton',
        'navigation:user.help'
      ];
      
      const missingKeys = criticalKeys.filter(key => {
        const value = i18n.t(key);
        return value === key || value.includes('.');
      });
      
      if (missingKeys.length > 0) {
        console.error('[i18n] CRITICAL: Keys still missing after reload:', missingKeys);
      } else {
        console.log('[i18n] All critical keys verified');
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
