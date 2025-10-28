import { supabase } from '@/integrations/supabase/client';
import { Pillar } from '@/integrations/supabase/types-unified';

interface Provider {
  id: string;
  user_id: string;
  specialty: string;
  specialization: string[];
  pillars: Pillar[];
  languages: string[];
  rating: number;
  total_sessions: number;
  experience_years: number;
  session_type: 'virtual' | 'presential' | 'both';
  is_active: boolean;
  is_approved: boolean;
}

interface UserCase {
  id: string;
  user_id: string;
  pillar: Pillar;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  case_type: 'escalated_chat' | 'session_request' | 'follow_up';
  user_preferences?: {
    language?: string;
    session_type?: 'virtual' | 'presential';
    time_preference?: string[];
  };
  case_details: {
    description: string;
    urgency_level: number;
    previous_sessions?: number;
    user_rating?: number;
  };
  created_at: string;
}

interface AssignmentResult {
  provider_id: string;
  match_score: number;
  reasons: string[];
  estimated_response_time: number;
}

interface AssignmentLog {
  case_id: string;
  provider_id: string;
  match_score: number;
  assignment_reason: string;
  assigned_at: string;
  status: 'assigned' | 'accepted' | 'declined' | 'timeout';
}

export class CaseAssignmentService {
  private static instance: CaseAssignmentService;
  private assignmentCache: Map<string, AssignmentResult[]> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CaseAssignmentService {
    if (!CaseAssignmentService.instance) {
      CaseAssignmentService.instance = new CaseAssignmentService();
    }
    return CaseAssignmentService.instance;
  }

  /**
   * Main method to assign a case to the best available provider
   */
  async assignCase(userCase: UserCase): Promise<AssignmentResult | null> {
    try {
      // Get all active and approved providers
      const providers = await this.getAvailableProviders();
      
      if (providers.length === 0) {
        console.warn('No available providers found');
        return null;
      }

      // Filter providers by pillar compatibility
      const compatibleProviders = providers.filter(provider => 
        provider.pillars.includes(userCase.pillar)
      );

      if (compatibleProviders.length === 0) {
        console.warn(`No providers found for pillar: ${userCase.pillar}`);
        return null;
      }

      // Calculate match scores for each provider
      const assignments = await Promise.all(
        compatibleProviders.map(provider => 
          this.calculateMatchScore(provider, userCase)
        )
      );

      // Sort by match score (highest first)
      assignments.sort((a, b) => b.match_score - a.match_score);

      // Filter out providers with very low scores
      const viableAssignments = assignments.filter(a => a.match_score >= 0.3);

      if (viableAssignments.length === 0) {
        console.warn('No viable assignments found');
        return null;
      }

      // Select the best match
      const bestMatch = viableAssignments[0];

      // Log the assignment
      await this.logAssignment(userCase.id, bestMatch.provider_id, bestMatch.match_score);

      // Notify the provider
      await this.notifyProvider(bestMatch.provider_id, userCase);

      return bestMatch;

    } catch (error) {
      console.error('Error assigning case:', error);
      return null;
    }
  }

  /**
   * Get all available providers
   */
  private async getAvailableProviders(): Promise<Provider[]> {
    try {
      const { data, error } = await supabase
        .from('prestadores')
        .select(`
          id,
          user_id,
          specialty,
          specialization,
          pillars,
          languages,
          rating,
          total_sessions,
          experience_years,
          session_type,
          is_active,
          is_approved
        `)
        .eq('is_active', true)
        .eq('is_approved', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching providers:', error);
      return [];
    }
  }

  /**
   * Calculate match score between provider and case
   */
  private async calculateMatchScore(
    provider: Provider, 
    userCase: UserCase
  ): Promise<AssignmentResult> {
    let score = 0;
    const reasons: string[] = [];

    // Base score for pillar compatibility (already filtered)
    score += 0.3;
    reasons.push('Pilar compatível');

    // Rating score (0-0.2)
    const ratingScore = (provider.rating / 5) * 0.2;
    score += ratingScore;
    if (provider.rating >= 4) {
      reasons.push('Alta avaliação');
    }

    // Experience score (0-0.15)
    const experienceScore = Math.min(provider.experience_years / 10, 1) * 0.15;
    score += experienceScore;
    if (provider.experience_years >= 5) {
      reasons.push('Experiência sólida');
    }

    // Session count score (0-0.1)
    const sessionScore = Math.min(provider.total_sessions / 100, 1) * 0.1;
    score += sessionScore;
    if (provider.total_sessions >= 50) {
      reasons.push('Muitas sessões realizadas');
    }

    // Language compatibility (0-0.1)
    if (userCase.user_preferences?.language) {
      if (provider.languages.includes(userCase.user_preferences.language)) {
        score += 0.1;
        reasons.push('Idioma compatível');
      }
    }

    // Session type compatibility (0-0.1)
    if (userCase.user_preferences?.session_type) {
      if (provider.session_type === 'both' || 
          provider.session_type === userCase.user_preferences.session_type) {
        score += 0.1;
        reasons.push('Tipo de sessão compatível');
      }
    }

    // Specialty match (0-0.05)
    if (provider.specialization.includes(userCase.pillar)) {
      score += 0.05;
      reasons.push('Especialização específica');
    }

    // Priority boost for urgent cases
    if (userCase.priority === 'urgent') {
      score += 0.1;
      reasons.push('Caso urgente - prioridade alta');
    }

    // Availability check (would integrate with calendar)
    const isAvailable = await this.checkProviderAvailability(provider.id);
    if (!isAvailable) {
      score *= 0.5; // Reduce score if not available
      reasons.push('Disponibilidade limitada');
    }

    // Calculate estimated response time
    const estimatedResponseTime = this.calculateResponseTime(provider, userCase);

    return {
      provider_id: provider.id,
      match_score: Math.min(score, 1), // Cap at 1.0
      reasons,
      estimated_response_time: estimatedResponseTime
    };
  }

  /**
   * Check if provider is available (simplified)
   */
  private async checkProviderAvailability(providerId: string): Promise<boolean> {
    try {
      // Check for existing bookings in the next 2 hours
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('prestador_id', providerId)
        .in('status', ['confirmed', 'pending'])
        .gte('date', now.toISOString().split('T')[0])
        .lte('start_time', twoHoursFromNow.toTimeString().split(' ')[0]);

      if (error) throw error;

      // If less than 3 bookings in next 2 hours, consider available
      return (count || 0) < 3;
    } catch (error) {
      console.error('Error checking availability:', error);
      return true; // Default to available if check fails
    }
  }

  /**
   * Calculate estimated response time in minutes
   */
  private calculateResponseTime(provider: Provider, userCase: UserCase): number {
    let baseTime = 30; // Base 30 minutes

    // Adjust based on provider rating
    if (provider.rating >= 4.5) {
      baseTime -= 10;
    } else if (provider.rating < 3.5) {
      baseTime += 15;
    }

    // Adjust based on experience
    if (provider.experience_years >= 5) {
      baseTime -= 5;
    }

    // Adjust based on priority
    if (userCase.priority === 'urgent') {
      baseTime -= 15;
    } else if (userCase.priority === 'high') {
      baseTime -= 10;
    }

    // Adjust based on session count
    if (provider.total_sessions >= 100) {
      baseTime -= 5;
    }

    return Math.max(baseTime, 5); // Minimum 5 minutes
  }

  /**
   * Log assignment for tracking and analytics
   */
  private async logAssignment(
    caseId: string, 
    providerId: string, 
    matchScore: number
  ): Promise<void> {
    try {
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: 'system', // System assignment
          action: 'case_assigned',
          entity_type: 'case_assignment',
          entity_id: caseId,
          details: {
            case_id: caseId,
            provider_id: providerId,
            match_score: matchScore,
            assignment_method: 'automatic',
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error logging assignment:', error);
    }
  }

  /**
   * Notify provider about new assignment
   */
  private async notifyProvider(providerId: string, userCase: UserCase): Promise<void> {
    try {
      // Create notification record
      await supabase
        .from('notifications')
        .insert({
          user_id: providerId,
          type: 'case_assigned',
          title: 'Novo Caso Atribuído',
          message: `Um novo caso de ${userCase.pillar} foi atribuído a si`,
          metadata: {
            case_id: userCase.id,
            pillar: userCase.pillar,
            priority: userCase.priority,
            case_type: userCase.case_type
          },
          is_read: false
        });

      // In a real implementation, you would also:
      // - Send push notification
      // - Send email notification
      // - Send SMS for urgent cases
      // - Update provider dashboard in real-time

    } catch (error) {
      console.error('Error notifying provider:', error);
    }
  }

  /**
   * Get assignment statistics for a provider
   */
  async getProviderStats(providerId: string, days: number = 30): Promise<{
    total_assignments: number;
    accepted_assignments: number;
    average_response_time: number;
    assignment_rate: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .eq('action', 'case_assigned')
        .eq('details->provider_id', providerId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const assignments = data || [];
      const totalAssignments = assignments.length;
      
      // This would need additional tracking for acceptance/rejection
      const acceptedAssignments = Math.floor(totalAssignments * 0.8); // Simulated
      const averageResponseTime = 25; // Simulated

      return {
        total_assignments: totalAssignments,
        accepted_assignments: acceptedAssignments,
        average_response_time: averageResponseTime,
        assignment_rate: totalAssignments > 0 ? acceptedAssignments / totalAssignments : 0
      };
    } catch (error) {
      console.error('Error getting provider stats:', error);
      return {
        total_assignments: 0,
        accepted_assignments: 0,
        average_response_time: 0,
        assignment_rate: 0
      };
    }
  }

  /**
   * Get assignment history for analytics
   */
  async getAssignmentHistory(days: number = 7): Promise<AssignmentLog[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .eq('action', 'case_assigned')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(log => ({
        case_id: log.entity_id,
        provider_id: log.details?.provider_id || '',
        match_score: log.details?.match_score || 0,
        assignment_reason: log.details?.assignment_method || 'automatic',
        assigned_at: log.created_at,
        status: 'assigned' // Would need additional tracking
      }));
    } catch (error) {
      console.error('Error getting assignment history:', error);
      return [];
    }
  }

  /**
   * Reassign case if provider declines or times out
   */
  async reassignCase(caseId: string, reason: 'declined' | 'timeout'): Promise<AssignmentResult | null> {
    try {
      // Get the case details
      const { data: caseData, error: caseError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', caseId)
        .single();

      if (caseError) throw caseError;

      const userCase: UserCase = {
        id: caseId,
        user_id: caseData.user_id,
        pillar: caseData.pillar as Pillar,
        priority: 'normal', // Would need to determine from context
        case_type: 'escalated_chat',
        case_details: {
          description: caseData.phone_escalation_reason || '',
          urgency_level: 5
        },
        created_at: caseData.created_at
      };

      // Log the reassignment reason
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: 'system',
          action: 'case_reassigned',
          entity_type: 'case_assignment',
          entity_id: caseId,
          details: {
            case_id: caseId,
            reassignment_reason: reason,
            timestamp: new Date().toISOString()
          }
        });

      // Attempt reassignment
      return await this.assignCase(userCase);

    } catch (error) {
      console.error('Error reassigning case:', error);
      return null;
    }
  }
}

// Export singleton instance
export const caseAssignmentService = CaseAssignmentService.getInstance();
