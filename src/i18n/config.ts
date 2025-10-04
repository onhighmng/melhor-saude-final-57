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

// Import English translations
import commonEn from './locales/en/common.json';
import navigationEn from './locales/en/navigation.json';
import userEn from './locales/en/user.json';
import companyEn from './locales/en/company.json';
import errorsEn from './locales/en/errors.json';
import toastsEn from './locales/en/toasts.json';

const resources = {
  pt: {
    common: commonPt,
    navigation: navigationPt,
    user: userPt,
    company: companyPt,
    errors: errorsPt,
    toasts: toastsPt,
  },
  en: {
    common: commonEn,
    navigation: navigationEn,
    user: userEn,
    company: companyEn,
    errors: errorsEn,
    toasts: toastsEn,
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
    },
  });

export default i18n;
