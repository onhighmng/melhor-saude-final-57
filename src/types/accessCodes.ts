export type UserType = 'personal' | 'hr' | 'user' | 'prestador' | 'specialist';

export interface AccessCode {
  id: string;
  invite_code: string;
  user_type: UserType;
  company_id?: string;
  expires_at: string;
  status: 'pending' | 'used' | 'expired' | 'revoked';
  created_by?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  company_name?: string;
  email?: string;
  accepted_at?: string;
}

export interface CodeValidationResult {
  isValid: boolean;
  isLoading: boolean;
  userType?: UserType;
  companyName?: string;
  companyId?: string;
  error?: string;
  expiresAt?: string;
}

export interface CodeGenerationResult {
  invite_code: string;
  expires_at: string;
}

export interface CodeStats {
  total: number;
  active: number;
  used: number;
  expired: number;
}
