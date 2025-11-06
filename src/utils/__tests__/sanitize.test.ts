import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '../sanitize';

describe('Sanitize Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should remove dangerous HTML', () => {
      const input = '<img src=x onerror="alert(1)">';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onerror');
    });

    it('should preserve safe text', () => {
      const input = 'This is safe text with numbers 123';
      const result = sanitizeInput(input);
      expect(result).toBe(input);
    });

    it('should handle empty strings', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    it('should handle special characters safely', () => {
      const input = 'Text with & < > " \' characters';
      const result = sanitizeInput(input);
      expect(result).toBeDefined();
    });

    it('should remove onclick handlers', () => {
      const input = '<div onclick="malicious()">Click me</div>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onclick');
    });

    it('should preserve line breaks', () => {
      const input = 'Line 1\nLine 2\nLine 3';
      const result = sanitizeInput(input);
      expect(result).toContain('\n');
    });
  });
});

