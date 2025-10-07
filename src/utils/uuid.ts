/**
 * UUID utility functions for generating and validating UUIDs
 */

/**
 * Generates a valid UUID v4
 * @returns A valid UUID string
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * Validates if a string is a valid UUID
 * @param uuid - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export const isValidUUID = (uuid: string | undefined | null): boolean => {
  if (!uuid) return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
