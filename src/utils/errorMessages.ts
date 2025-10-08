import i18n from '@/i18n/config';

/**
 * Get localized error message based on error code or message
 * @param error - Error object with code or message
 * @returns Localized error message
 */
export const getErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (error?.code) {
    // Map error codes to translation keys
    const errorKeyMap: Record<string, string> = {
      'auth/invalid-email': 'errors.auth.invalidEmail',
      'auth/user-not-found': 'errors.auth.userNotFound',
      'auth/wrong-password': 'errors.auth.wrongPassword',
      'auth/too-many-requests': 'errors.auth.tooManyRequests',
      'network-error': 'errors.network',
      'permission-denied': 'errors.permissionDenied',
      'not-found': 'errors.notFound',
    };
    
    const translationKey = errorKeyMap[error.code];
    return translationKey ? i18n.t(translationKey) : i18n.t('errors.unknown');
  }
  
  return i18n.t('errors.unknown');
};