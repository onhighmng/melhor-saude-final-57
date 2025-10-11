import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useTranslationDebug = (namespace: string, keys: string[]) => {
  const { t, i18n } = useTranslation(namespace);
  
  useEffect(() => {
    if (import.meta.env.DEV) {
      keys.forEach(key => {
        const value = t(key);
        if (value === key) {
          console.warn(`[Translation Debug] Missing key: ${namespace}:${key}`);
          console.log('[Translation Debug] Available namespaces:', Object.keys(i18n.services.resourceStore.data[i18n.language] || {}));
        }
      });
    }
  }, [t, i18n, namespace, keys]);
};
