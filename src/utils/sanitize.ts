import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * Strips all HTML tags and returns plain text
 */
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML
    KEEP_CONTENT: true
  }).trim();
};

/**
 * Sanitize HTML content, allowing only safe formatting tags
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

