/**
 * Normalizes a meeting link URL to ensure it has a proper protocol
 * Prevents browser from treating it as a relative path
 * 
 * @param url - The URL to normalize
 * @returns Normalized URL with https:// protocol
 */
export function normalizeMeetingLink(url: string): string {
  if (!url || url.trim() === '') {
    return '';
  }

  const trimmedUrl = url.trim();

  // If URL already has a protocol (http:// or https://), return as-is
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // If URL starts with //, add https:
  if (trimmedUrl.startsWith('//')) {
    return `https:${trimmedUrl}`;
  }

  // Otherwise, add https:// prefix
  return `https://${trimmedUrl}`;
}

/**
 * Validates if a string is a valid meeting link URL
 * 
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidMeetingLink(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }

  try {
    const normalized = normalizeMeetingLink(url);
    const urlObj = new URL(normalized);
    
    // Must have http or https protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }

    // Must have a hostname
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}


