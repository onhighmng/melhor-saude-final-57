import { AdminUser, AdminPrestador, SessionAllocation, Company, UserBooking, ChangeRequest, Feedback, EmailAlert } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

class AdminAccountService {
  // User management
  async getUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getActiveUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email, role, company, phone, is_active, created_at')
        .eq('is_active', true)
        .neq('role', 'admin');

      if (error) throw error;

      // Get session data for all users
      const userIds = data?.map(profile => profile.user_id) || [];
      const sessionData = new Map();

      if (userIds.length > 0) {
        const { data: sessions, error: sessionError } = await supabase
          .from('session_allocations')
          .select('user_id, allocation_type, sessions_allocated, sessions_used')
          .in('user_id', userIds)
          .eq('is_active', true);

        if (!sessionError && sessions) {
          sessions.forEach(session => {
            if (!sessionData.has(session.user_id)) {
              sessionData.set(session.user_id, { company: 0, companyUsed: 0, personal: 0, personalUsed: 0 });
            }
            const userData = sessionData.get(session.user_id);
            if (session.allocation_type === 'company') {
              userData.company += session.sessions_allocated;
              userData.companyUsed += session.sessions_used;
            } else if (session.allocation_type === 'personal') {
              userData.personal += session.sessions_allocated;
              userData.personalUsed += session.sessions_used;
            }
          });
        }
      }

      return (data || []).map(profile => {
        const userSessions = sessionData.get(profile.user_id) || { company: 0, companyUsed: 0, personal: 0, personalUsed: 0 };
        return {
          id: profile.user_id,
          name: profile.name,
          email: profile.email,
          company: profile.company || '',
          isActive: profile.is_active,
          createdAt: new Date(profile.created_at).toISOString().split('T')[0],
          companySessions: userSessions.company,
          usedCompanySessions: userSessions.companyUsed,
          bookingHistory: []
        };
      });
    } catch (error) {
      console.error('Error fetching active users:', error);
      return [];
    }
  }

  async getInactiveUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email, role, company, phone, is_active, created_at')
        .eq('is_active', false);

      if (error) throw error;

      return (data || []).map(profile => ({
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        company: profile.company || '',
        isActive: profile.is_active,
        createdAt: new Date(profile.created_at).toISOString().split('T')[0],
        companySessions: 0,
        usedCompanySessions: 0,
        bookingHistory: []
      }));
    } catch (error) {
      console.error('Error fetching inactive users:', error);
      return [];
    }
  }

  async createUser(userData: Omit<AdminUser, 'id' | 'createdAt' | 'usedCompanySessions' | 'bookingHistory'>): Promise<AdminUser> {
    try {
      const { data, error } = await supabase.functions.invoke('create-company-user', {
        body: {
          name: userData.name,
          email: userData.email,
          password: userData.password || this.generatePassword(),
          role: userData.role || 'user',
          company: userData.company,
          companySessions: userData.companySessions || 0
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        // Try to detect duplicate email and provide a friendly message
        try {
          const { data: existing } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('email', userData.email)
            .maybeSingle();
          if (existing) {
            throw new Error('Já existe um utilizador com este email.');
          }
        } catch (_) {}
        throw new Error('Erro ao criar utilizador. Tente novamente.');
      }

      if (!data.success) {
        throw new Error(data.error || 'User creation failed');
      }

      return {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        company: data.user.company,
        role: data.user.role,
        isActive: data.user.isActive,
        createdAt: new Date(data.user.createdAt).toISOString().split('T')[0],
        companySessions: data.user.companySessions || 0,
        usedCompanySessions: 0,
        bookingHistory: []
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          email: updates.email,
          company: updates.company,
          is_active: updates.isActive
        })
        .eq('user_id', id)
        .select()
        .maybeSingle();

      if (error) throw error;

      return {
        id: data.user_id,
        name: data.name,
        email: data.email,
        company: data.company || '',
        isActive: data.is_active,
        createdAt: new Date(data.created_at).toISOString().split('T')[0],
        companySessions: updates.companySessions || 0,
        usedCompanySessions: updates.usedCompanySessions || 0,
        bookingHistory: updates.bookingHistory || []
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async deactivateUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('admin-user-deactivate', {
        body: { userId: id }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      return false;
    }
  }

  async reactivateUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('user_id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error reactivating user:', error);
      return false;
    }
  }

  async updateUserSessions(id: string, companySessions: number): Promise<boolean> {
    if (companySessions < 0) {
      throw new Error('Session count cannot be negative');
    }

    try {
      // Get current user for allocated_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use a transaction-like approach with error handling
      // Step 1: Deactivate existing company allocations for this user
      const { error: deactivateError } = await supabase
        .from('session_allocations')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', id)
        .eq('allocation_type', 'company')
        .eq('is_active', true);

      if (deactivateError) {
        console.error('Error deactivating existing allocations:', deactivateError);
        throw new Error(`Failed to deactivate existing allocations: ${deactivateError.message}`);
      }

      // Step 2: Insert new active allocation
      const { error: insertError, data: newAllocation } = await supabase
        .from('session_allocations')
        .insert({
          user_id: id,
          allocation_type: 'company',
          sessions_allocated: companySessions,
          sessions_used: 0,
          allocated_by: user.id,
          reason: 'Admin session update',
          is_active: true
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error creating new allocation:', insertError);
        throw new Error(`Failed to create new allocation: ${insertError.message}`);
      }

      console.log(`Successfully updated sessions for user ${id}: ${companySessions} sessions allocated`);
      return true;

    } catch (error) {
      console.error('Error in updateUserSessions:', error);
      // Re-throw with more context for the UI
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Session update failed: ${errorMessage}`);
    }
  }

  async useUserSession(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('use_session', {
        p_user_id: id,
        p_allocation_type: 'company'
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error using user session:', error);
      return false;
    }
  }

  // Prestador management
  async getPrestadores(): Promise<AdminPrestador[]> {
    const activePrestadores = await this.getActivePrestadores();
    const inactivePrestadores = await this.getInactivePrestadores();
    return [...activePrestadores, ...inactivePrestadores];
  }

  async getActivePrestadores(): Promise<AdminPrestador[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-prestadores', {
        body: { action: 'list', active: true }
      });

      if (error) throw error;
      
      return (data?.prestadores || []).map((prestador: any) => ({
        id: prestador.id,
        name: prestador.name,
        email: prestador.email,
        specialty: prestador.specialties?.[0] || 'General',
        token: `prestador_${prestador.id}`,
        isActive: prestador.is_active,
        createdAt: prestador.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        totalBookings: prestador.total_bookings || 0
      }));
    } catch (error) {
      console.error('Error fetching active prestadores:', error);
      return [];
    }
  }

  async getInactivePrestadores(): Promise<AdminPrestador[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-prestadores', {
        body: { action: 'list', active: false }
      });

      if (error) throw error;
      
      return (data?.prestadores || []).map((prestador: any) => ({
        id: prestador.id,
        name: prestador.name,
        email: prestador.email,
        specialty: prestador.specialties?.[0] || 'General',
        token: `prestador_${prestador.id}`,
        isActive: prestador.is_active,
        createdAt: prestador.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        totalBookings: prestador.total_bookings || 0
      }));
    } catch (error) {
      console.error('Error fetching inactive prestadores:', error);
      return [];
    }
  }

  async createPrestador(prestadorData: any): Promise<AdminPrestador> {
    try {
      console.log('Creating prestador with data:', prestadorData);
      
      const { data, error } = await supabase.functions.invoke('create-prestador-with-pillar', {
        body: {
          name: prestadorData.name,
          email: prestadorData.email,
          password: prestadorData.password || this.generatePassword(),
          pillar: prestadorData.pillar,
          fullBio: prestadorData.fullBio || null,
          experience: prestadorData.experience || null,
          education: prestadorData.education || [],
          specialties: prestadorData.specialties || []
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create prestador account');
      }

      if (!data || !data.prestador) {
        throw new Error('Invalid response from server');
      }
      
      const prestador = data.prestador;
      
      return {
        id: prestador.id,
        name: prestador.name,
        email: prestador.email,
        specialty: prestador.specialties?.[0] || prestadorData.specialty || prestador.pillar,
        token: `prestador_${prestador.id}`,
        isActive: prestador.is_active,
        createdAt: prestador.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        totalBookings: 0
      };
    } catch (error: any) {
      console.error('Error creating prestador:', error);
      
      // Re-throw with a more specific error message
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to create prestador account');
      }
    }
  }

  async updatePrestador(id: string, updates: Partial<AdminPrestador>): Promise<AdminPrestador | null> {
    try {
      const { data, error } = await supabase
        .from('prestadores')
        .update({
          name: updates.name,
          email: updates.email,
          is_active: updates.isActive
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        specialty: data.specialties?.[0] || 'General',
        token: `prestador_${data.id}`,
        isActive: data.is_active,
        createdAt: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        totalBookings: updates.totalBookings || 0
      };
    } catch (error) {
      console.error('Error updating prestador:', error);
      return null;
    }
  }

  async deactivatePrestador(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('admin-prestador-status', {
        body: { prestadorId: id, isActive: false }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deactivating prestador:', error);
      return false;
    }
  }

  async reactivatePrestador(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('admin-prestador-status', {
        body: { prestadorId: id, isActive: true }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error reactivating prestador:', error);
      return false;
    }
  }

  // Company management
  async getCompanieWithUsers(): Promise<Company[]> {
    try {
      // Use edge function with service role to bypass RLS and include users per company
      const { data, error } = await supabase.functions.invoke('admin-companies', {
        body: { action: 'list_with_users' }
      });

      if (error) {
        console.error('Error invoking admin-companies list_with_users:', error);
        throw error;
      }

      const companies = (data?.companies || []).map((org: any) => ({
        id: org.id,
        name: org.name,
        contact_email: org.contact_email,
        contact_phone: org.contact_phone,
        plan_type: org.plan_type,
        sessions_allocated: org.sessions_allocated || 0,
        sessions_used: org.sessions_used || 0,
        is_active: org.is_active,
        final_notes: org.final_notes,
        users: (org.users || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          company: u.company,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt,
          companySessions: u.companySessions || 0,
          usedCompanySessions: u.usedCompanySessions || 0,
          bookingHistory: u.bookingHistory || []
        })),
        totalSessions: org.totalSessions || org.sessions_allocated || 0,
        usedSessions: org.usedSessions || org.sessions_used || 0
      }));

      console.log('Companies with users (via edge func):', companies);
      return companies;
    } catch (error) {
      console.error('Error in getCompanieWithUsers:', error);
      return [];
    }
  }

  async getIndividualUsers(): Promise<AdminUser[]> {
    const activeUsers = await this.getActiveUsers();
    return activeUsers.filter(user => !user.company);
  }

  async getUsersByPrestador(prestadorId: string): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          user_id,
          profiles!inner(user_id, name, email, company, is_active, created_at)
        `)
        .eq('prestador_id', prestadorId);

      if (error) throw error;

      const uniqueUsers = new Map();
      data?.forEach((booking: any) => {
        const profile = booking.profiles;
        if (profile && !uniqueUsers.has(profile.user_id)) {
          uniqueUsers.set(profile.user_id, {
            id: profile.user_id,
            name: profile.name,
            email: profile.email,
            company: profile.company || '',
            isActive: profile.is_active,
            createdAt: new Date(profile.created_at).toISOString().split('T')[0],
            companySessions: 0,
            usedCompanySessions: 0,
            bookingHistory: []
          });
        }
      });

      return Array.from(uniqueUsers.values());
    } catch (error) {
      console.error('Error fetching users by prestador:', error);
      return [];
    }
  }

  async getPrestadorsByUser(userId: string): Promise<AdminPrestador[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          prestador_id,
          prestadores!inner(id, name, email, specialties, is_active, created_at)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const uniquePrestadores = new Map();
      data?.forEach((booking: any) => {
        const prestador = booking.prestadores;
        if (prestador && !uniquePrestadores.has(prestador.id)) {
          uniquePrestadores.set(prestador.id, {
            id: prestador.id,
            name: prestador.name,
            email: prestador.email,
            specialty: prestador.specialties?.[0] || 'General',
            token: `prestador_${prestador.id}`,
            isActive: prestador.is_active,
            createdAt: prestador.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            totalBookings: 0
          });
        }
      });

      return Array.from(uniquePrestadores.values());
    } catch (error) {
      console.error('Error fetching prestadores by user:', error);
      return [];
    }
  }

  // Change Request management
  async getChangeRequests(): Promise<ChangeRequest[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-change-requests', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data?.requests || [];
    } catch (error) {
      console.error('Error fetching change requests:', error);
      return [];
    }
  }

  async getPendingChangeRequests(): Promise<ChangeRequest[]> {
    const requests = await this.getChangeRequests();
    return requests.filter(request => request.status === 'pending');
  }

  async createChangeRequest(requestData: Omit<ChangeRequest, 'id' | 'createdAt' | 'status'>): Promise<ChangeRequest> {
    try {
      const { data, error } = await supabase
        .from('change_requests')
        .insert({
          prestador_id: requestData.prestadorId,
          prestador_name: requestData.prestadorName,
          field: requestData.field,
          field_label: requestData.fieldLabel,
          current_value: requestData.currentValue,
          requested_value: requestData.requestedValue,
          reason: requestData.reason
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      return {
        id: data.id,
        prestadorId: data.prestador_id,
        prestadorName: data.prestador_name,
        field: data.field,
        fieldLabel: data.field_label,
        currentValue: data.current_value,
        requestedValue: data.requested_value,
        reason: data.reason || '',
        status: data.status as 'pending' | 'approved' | 'rejected',
        createdAt: data.created_at,
        reviewedAt: data.reviewed_at || undefined,
        reviewedBy: data.reviewed_by || undefined
      };
    } catch (error) {
      console.error('Error creating change request:', error);
      throw error;
    }
  }

  async approveChangeRequest(requestId: string, reviewedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('admin-change-request-approve', {
        body: { requestId, reviewedBy }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error approving change request:', error);
      return false;
    }
  }

  async rejectChangeRequest(requestId: string, reviewedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('admin-change-request-reject', {
        body: { requestId, reviewedBy }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error rejecting change request:', error);
      return false;
    }
  }

  // Feedback management
  async getFeedback(): Promise<Feedback[]> {
    try {
      // Using a simple mock implementation for now since feedback is complex
      return [];
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }
  }

  // Email alert management - using local storage for simplicity
  private emailAlerts: EmailAlert[] = [];

  async getEmailAlerts(): Promise<EmailAlert[]> {
    return this.emailAlerts;
  }

  async sendEmailAlert(alertId: string): Promise<boolean> {
    try {
      console.log('🔍 Looking for alert ID:', alertId);
      console.log('📋 Current alerts:', this.emailAlerts);
      
      // Find the alert first
      const alert = this.emailAlerts.find(a => a.id === alertId);
      
      if (!alert) {
        console.log('❌ Alert not found! Available alert IDs:', this.emailAlerts.map(a => a.id));
        throw new Error('Alert not found');
      }

      console.log('✅ Alert found:', alert);
      console.log('📧 Calling edge function with:', {
        to: alert.recipientEmail,
        subject: alert.subject,
        message: alert.message,
        type: alert.type
      });

      // Send email using edge function
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: alert.recipientEmail,
          subject: alert.subject,
          message: alert.message,
          type: alert.type
        }
      });

      console.log('📨 Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      // Update alert status
      const alertIndex = this.emailAlerts.findIndex(a => a.id === alertId);
      if (alertIndex !== -1) {
        this.emailAlerts[alertIndex] = {
          ...this.emailAlerts[alertIndex],
          status: 'sent',
          sentAt: new Date().toISOString()
        };
      }

      console.log('✅ Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('❌ Error sending email alert:', error);
      
      // Update alert status to failed
      const alertIndex = this.emailAlerts.findIndex(a => a.id === alertId);
      if (alertIndex !== -1) {
        this.emailAlerts[alertIndex] = {
          ...this.emailAlerts[alertIndex],
          status: 'failed'
        };
      }
      
      throw error;
    }
  }

  async createEmailAlert(alertData: Omit<EmailAlert, 'id' | 'createdAt' | 'status'>): Promise<EmailAlert> {
    try {
      const newAlert: EmailAlert = {
        id: Date.now().toString(),
        type: alertData.type,
        subject: alertData.subject,
        message: alertData.message,
        recipientId: alertData.recipientId,
        recipientEmail: alertData.recipientEmail,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      this.emailAlerts.push(newAlert);
      return newAlert;
    } catch (error) {
      console.error('Error creating email alert:', error);
      throw error;
    }
  }

  generateProfileLink(token: string): string {
    return `${window.location.origin}/prestador/dashboard/${token}`;
  }
}

export const adminAccountService = new AdminAccountService();