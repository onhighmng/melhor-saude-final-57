export type Pillar = 'mental_health' | 'physical_wellness' | 'financial_assistance' | 'legal_assistance';

export type SessionType = 'virtual' | 'presential' | 'both';

export type ProviderStatus = 'active' | 'busy' | 'inactive';

export interface Provider {
  id: string;
  name: string;
  email: string;
  specialty: string;
  pillar: Pillar;
  costPerSession: number;
  avgSatisfaction: number;
  totalSessions: number;
  status: ProviderStatus;
  sessionType: SessionType;
  availability?: string;
  photoUrl?: string;
}

export interface ProviderMetrics {
  sessionsCompleted: number;
  avgSatisfaction: number;
  sessionsThisMonth: number;
  companiesServed: number;
  costPerSession: number;
  platformMargin: number;
  netToProvider: number;
  totalPaidThisMonth: number;
}

export interface ProviderHistoryItem {
  id: string;
  date: string;
  collaborator: string;
  rating: number;
  sessionType: SessionType;
}

export interface CalendarSlot {
  id: string;
  date: Date;
  isAvailable: boolean;
  bookingId?: string;
  collaboratorName?: string;
  company?: string;
  sessionType?: SessionType;
}

export interface BookingFormData {
  collaboratorId: string;
  collaboratorName: string;
  sessionType: SessionType;
  notes?: string;
}
