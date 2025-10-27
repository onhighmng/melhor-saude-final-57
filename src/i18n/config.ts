import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18next properly (stub translations return the key)
i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: {
        translation: {}
      },
      en: {
        translation: {}
      }
    },
    lng: 'pt',
    fallbackLng: 'pt',
    returnNull: false,
    returnEmptyString: false,
    keySeparator: '.',
    interpolation: {
      escapeValue: false
    },
    // Return the key if translation is missing
    parseMissingKeyHandler: (key) => key
  });

export default i18n;
