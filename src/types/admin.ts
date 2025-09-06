
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional for creation
  role?: 'user' | 'hr' | 'admin'; // Optional, defaults to 'user'
  company: string | null; // null for individual users
  companySessions: number;
  usedCompanySessions: number;
  createdAt: string;
  isActive: boolean;
  bookingHistory: UserBooking[];
}

export interface AdminPrestador {
  id: string;
  name: string;
  email: string;
  specialty: string;
  token: string;
  isActive: boolean;
  createdAt: string;
  totalBookings: number;
}

export interface UserBooking {
  prestadorId: string;
  prestadorName: string;
  sessionDate: string;
  sessionType: string;
}

export interface Company {
  name: string;
  contact_email?: string;
  contact_phone?: string;
  plan_type?: string;
  sessions_allocated?: number;
  sessions_used?: number;
  final_notes?: string;
  users: AdminUser[];
  totalSessions: number;
  usedSessions: number;
}

export interface SessionAllocation {
  userId: string;
  totalSessions: number;
  usedSessions: number;
  companyName: string;
  allocatedBy: string;
  allocatedAt: string;
}

export interface ChangeRequest {
  id: string;
  prestadorId: string;
  prestadorName: string;
  field: string;
  fieldLabel: string;
  currentValue: string;
  requestedValue: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  prestadorId: string;
  prestadorName: string;
  rating: number; // 1-5 stars
  comment: string;
  sessionDate: string;
  createdAt: string;
  isAnonymous: boolean;
}

export interface EmailAlert {
  id: string;
  type: 'low_sessions' | 'inactive_account' | 'booking_reminder' | 'feedback_received';
  recipientId: string;
  recipientEmail: string;
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
}

export interface FeedbackData {
  id: string;
  userId: string;
  userName: string;
  prestadorId: string;
  prestadorName: string;
  rating: number;
  comment: string;
  sessionDate: string;
  createdAt: string;
}
