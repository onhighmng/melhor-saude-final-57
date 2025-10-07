import i18n from '@/i18n/config';

/**
 * Formats a date string to locale-aware date format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted date string based on current locale (pt-PT or en-US)
 */
export const formatDate = (dateString: string | Date): string => {
  const locale = i18n.language === 'pt' ? 'pt-PT' : 'en-US';
  return new Date(dateString).toLocaleDateString(locale);
};

/**
 * Formats a date string to locale-aware date and time format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted date and time string based on current locale
 */
export const formatDateTime = (dateString: string | Date): string => {
  const locale = i18n.language === 'pt' ? 'pt-PT' : 'en-US';
  return new Date(dateString).toLocaleString(locale);
};

/**
 * Formats a date string to locale-aware time format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted time string based on current locale
 */
export const formatTime = (dateString: string | Date): string => {
  const locale = i18n.language === 'pt' ? 'pt-PT' : 'en-US';
  return new Date(dateString).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};
