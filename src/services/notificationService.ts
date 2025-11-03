import { supabase } from '@/integrations/supabase/client';

/**
 * Notification Service
 * 
 * Provides easy-to-use methods for creating notifications from the frontend.
 * All notifications are automatically created via database triggers for most events,
 * but this service provides manual notification creation when needed.
 */

export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedBookingId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

class NotificationService {
  /**
   * Create a notification for a user
   */
  async create(data: NotificationData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        related_booking_id: data.relatedBookingId || null,
        priority: data.priority || 'normal',
        metadata: data.metadata || {},
        is_read: false,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error('[NotificationService] Error creating notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('[NotificationService] Unexpected error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Create a notification using the database function
   * (Bypasses RLS if called from authenticated context)
   */
  async createViaRPC(data: NotificationData): Promise<{ success: boolean; error?: string; notificationId?: string }> {
    try {
      const { data: result, error } = await supabase.rpc('create_notification', {
        p_user_id: data.userId,
        p_type: data.type,
        p_title: data.title,
        p_message: data.message,
        p_related_booking_id: data.relatedBookingId || null,
        p_priority: data.priority || 'normal',
        p_metadata: data.metadata || {}
      });

      if (error) {
        console.error('[NotificationService] Error creating notification via RPC:', error);
        return { success: false, error: error.message };
      }

      return { success: true, notificationId: result };
    } catch (error: any) {
      console.error('[NotificationService] Unexpected error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Notify user that meeting link is ready
   */
  async notifyMeetingLinkReady(userId: string, bookingId: string, meetingLink: string, bookingDate: string, startTime: string) {
    return this.create({
      userId,
      type: 'meeting_link_ready',
      title: 'Link da Sessão Disponível',
      message: 'O link para a sua sessão já está disponível. Pode aceder através das suas sessões agendadas.',
      relatedBookingId: bookingId,
      priority: 'high',
      metadata: {
        meeting_link: meetingLink,
        booking_date: bookingDate,
        start_time: startTime
      }
    });
  }

  /**
   * Notify user that session is starting soon
   */
  async notifySessionReminder(userId: string, bookingId: string, bookingDate: string, startTime: string, minutesUntilStart: number) {
    return this.create({
      userId,
      type: 'session_reminder',
      title: `Sessão em ${minutesUntilStart} minutos`,
      message: `A sua sessão começa às ${startTime}. Não se esqueça de entrar!`,
      relatedBookingId: bookingId,
      priority: 'urgent',
      metadata: {
        booking_date: bookingDate,
        start_time: startTime,
        minutes_until_start: minutesUntilStart
      }
    });
  }

  /**
   * Notify specialist of new booking
   */
  async notifyNewBooking(specialistUserId: string, bookingId: string, userEmail: string, bookingDate: string, startTime: string) {
    return this.create({
      userId: specialistUserId,
      type: 'new_booking',
      title: 'Nova Sessão Agendada',
      message: `Nova sessão agendada com ${userEmail} para ${bookingDate} às ${startTime}.`,
      relatedBookingId: bookingId,
      priority: 'high',
      metadata: {
        user_email: userEmail,
        booking_date: bookingDate,
        start_time: startTime
      }
    });
  }

  /**
   * Notify that session was completed
   */
  async notifySessionCompleted(userId: string, bookingId: string) {
    return this.create({
      userId,
      type: 'session_completed',
      title: 'Sessão Concluída',
      message: 'A sua sessão foi marcada como concluída. Pode agora deixar feedback.',
      relatedBookingId: bookingId,
      priority: 'normal'
    });
  }

  /**
   * Notify about chat escalation
   */
  async notifyChatEscalated(specialistUserId: string, chatSessionId: string, userEmail: string, reason: string) {
    return this.create({
      userId: specialistUserId,
      type: 'chat_escalation',
      title: 'Novo Pedido de Chamada',
      message: `${userEmail} solicitou um contacto telefónico: ${reason}`,
      priority: 'urgent',
      metadata: {
        chat_session_id: chatSessionId,
        user_email: userEmail,
        escalation_reason: reason
      }
    });
  }

  /**
   * Notify about milestone achievement
   */
  async notifyMilestoneAchieved(userId: string, milestoneTitle: string, points: number) {
    return this.create({
      userId,
      type: 'milestone_achieved',
      title: '🎉 Milestone Alcançado!',
      message: `Parabéns! Completou: ${milestoneTitle}. Ganhou ${points} pontos!`,
      priority: 'normal',
      metadata: {
        milestone_title: milestoneTitle,
        points_earned: points
      }
    });
  }
}

export const notificationService = new NotificationService();


