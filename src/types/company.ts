export interface Company {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string | null;
  sessions_allocated: number;
  sessions_used: number;
  is_active: boolean;
  plan_type: string;
  final_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyEmployee {
  id: string;
  company_id: string;
  user_id: string;
  sessions_allocated: number;
  sessions_used: number;
  is_active: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Invite {
  id: string;
  company_id: string;
  email: string;
  invite_code: string;
  status: 'pending' | 'accepted' | 'expired';
  sessions_allocated: number;
  invited_by: string | null;
  expires_at: string | null;
  accepted_at: string | null;
  created_at: string;
}
