/**
<<<<<<< HEAD
 * Formats a date string to Portuguese locale date format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted date string in Portuguese format (pt-PT)
=======
 * Formats a date string to Portuguese date format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted date string in pt-PT format
>>>>>>> 27a8624a17f72448b31e25b6a54f683078672cdc
 */
export const formatDate = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleDateString('pt-PT');
};

/**
<<<<<<< HEAD
 * Formats a date string to Portuguese locale date and time format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted date and time string in Portuguese format
=======
 * Formats a date string to Portuguese date and time format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted date and time string in pt-PT format
>>>>>>> 27a8624a17f72448b31e25b6a54f683078672cdc
 */
export const formatDateTime = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleString('pt-PT');
};

/**
<<<<<<< HEAD
 * Formats a date string to Portuguese locale time format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted time string in Portuguese format
=======
 * Formats a date string to Portuguese time format
 * @param dateString - ISO date string or Date-compatible string
 * @returns Formatted time string in pt-PT format
>>>>>>> 27a8624a17f72448b31e25b6a54f683078672cdc
 */
export const formatTime = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
