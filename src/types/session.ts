
export interface EmployerQuota {
  totalSessions: number;
  usedSessions: number;
  companyName: string;
}

export interface PersonalPlan {
  totalSessions: number;
  usedSessions: number;
  planType: string;
}

export interface UserSessionData {
  userId: string;
  employerQuota: EmployerQuota | null;
  personalPlan: PersonalPlan | null;
}

export interface SessionBalance {
  totalRemaining: number;
  employerRemaining: number;
  personalRemaining: number;
  hasActiveSessions: boolean;
}
