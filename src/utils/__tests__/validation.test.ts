import { describe, it, expect } from 'vitest';

// Email validation function
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation function
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 9;
};

// Access code validation function
const validateAccessCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

// Password strength validation
const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('user_name@example.com')).toBe(true);
      expect(validateEmail('user123@test-domain.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
    });

    it('should reject emails with multiple @ symbols', () => {
      expect(validateEmail('test@@example.com')).toBe(false);
      expect(validateEmail('test@test@example.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone formats', () => {
      expect(validatePhone('+351912345678')).toBe(true);
      expect(validatePhone('912345678')).toBe(true);
      expect(validatePhone('+351 912 345 678')).toBe(true);
      expect(validatePhone('(21) 12345678')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(validatePhone('12345')).toBe(false);
      expect(validatePhone('abcdefghi')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });

    it('should handle international formats', () => {
      expect(validatePhone('+1-234-567-8900')).toBe(true);
      expect(validatePhone('+44 20 1234 5678')).toBe(true);
    });
  });

  describe('validateAccessCode', () => {
    it('should validate 6-digit access codes', () => {
      expect(validateAccessCode('123456')).toBe(true);
      expect(validateAccessCode('000000')).toBe(true);
      expect(validateAccessCode('999999')).toBe(true);
    });

    it('should reject invalid access codes', () => {
      expect(validateAccessCode('12345')).toBe(false);
      expect(validateAccessCode('1234567')).toBe(false);
      expect(validateAccessCode('abcdef')).toBe(false);
      expect(validateAccessCode('12345a')).toBe(false);
      expect(validateAccessCode('')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords that are too short', () => {
      const result = validatePasswordStrength('Short1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePasswordStrength('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePasswordStrength('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePasswordStrength('NoNumbers');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return multiple errors for weak passwords', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});

