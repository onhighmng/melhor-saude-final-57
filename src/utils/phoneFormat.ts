/**
 * Phone number formatting utilities for Mozambique (+258)
 * Format: +258 ** *** ****
 */

/**
 * Formats a phone number to Mozambique standard format
 * @param value - Raw phone number input
 * @returns Formatted phone number: +258 ** *** ****
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // Extract only digits (remove + for processing)
  const digits = cleaned.replace(/\+/g, '');
  
  // If starts with 258, use those digits, otherwise start fresh
  let phoneDigits = digits;
  if (digits.startsWith('258')) {
    phoneDigits = digits.substring(3); // Remove 258 prefix
  }
  
  // Limit to 9 digits (Mozambique phone numbers are 9 digits after country code)
  phoneDigits = phoneDigits.substring(0, 9);
  
  // Format: +258 ** *** ****
  let formatted = '+258';
  
  if (phoneDigits.length > 0) {
    formatted += ' ' + phoneDigits.substring(0, 2);
  }
  if (phoneDigits.length > 2) {
    formatted += ' ' + phoneDigits.substring(2, 5);
  }
  if (phoneDigits.length > 5) {
    formatted += ' ' + phoneDigits.substring(5, 9);
  }
  
  return formatted;
};

/**
 * Validates if a phone number is complete (has all 9 digits)
 * @param value - Formatted phone number
 * @returns true if valid, false otherwise
 */
export const isValidPhoneNumber = (value: string): boolean => {
  const digits = value.replace(/[^\d]/g, '');
  // Should have 258 (country code) + 9 digits = 12 digits total
  return digits.length === 12 && digits.startsWith('258');
};

/**
 * Gets the raw phone number (digits only) from formatted string
 * @param value - Formatted phone number
 * @returns Raw digits including country code
 */
export const getRawPhoneNumber = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

/**
 * Gets international format (+258...)
 * @param value - Phone number in any format
 * @returns International format with + prefix
 */
export const getInternationalFormat = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '');
  if (digits.startsWith('258')) {
    return '+' + digits;
  }
  return '+258' + digits;
};

/**
 * Placeholder for phone input fields
 */
export const PHONE_PLACEHOLDER = '+258 ** *** ****';

/**
 * Default value for empty phone fields
 */
export const PHONE_DEFAULT = '+258 ';

