/**
 * Formats a date string to Portuguese date format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted date string in pt-PT format
 */
export const formatDate = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleDateString('pt-PT');
};

/**
 * Formats a date string to Portuguese date and time format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted date and time string in pt-PT format
 */
export const formatDateTime = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleString('pt-PT');
};

/**
 * Formats a date string to Portuguese time format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted time string in pt-PT format
 */
export const formatTime = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
