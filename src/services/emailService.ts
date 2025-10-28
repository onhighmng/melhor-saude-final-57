import { supabase } from '@/integrations/supabase/client';
import { 
  getBookingConfirmationEmail, 
  getBookingCancellationEmail, 
  getBookingReminderEmail 
} from '@/utils/emailTemplates';

interface BookingEmailData {
  userName: string;
  providerName: string;
  date: string;
  time: string;
  pillar: string;
  meetingLink?: string;
  meetingType: string;
}

export const emailService = {
  async sendBookingConfirmation(to: string, data: BookingEmailData) {
    const html = getBookingConfirmationEmail(data);
    return supabase.functions.invoke('send-booking-email', {
      body: {
        to,
        subject: 'Confirmação de Sessão - Melhor Saúde',
        html,
        type: 'booking_confirmation'
      }
    });
  },
  
  async sendBookingCancellation(to: string, data: Omit<BookingEmailData, 'meetingLink' | 'meetingType'>) {
    const html = getBookingCancellationEmail(data);
    return supabase.functions.invoke('send-booking-email', {
      body: {
        to,
        subject: 'Sessão Cancelada - Melhor Saúde',
        html,
        type: 'booking_cancellation'
      }
    });
  },
  
  async sendBookingReminder(to: string, data: BookingEmailData) {
    const html = getBookingReminderEmail(data);
    return supabase.functions.invoke('send-booking-email', {
      body: {
        to,
        subject: 'Lembrete de Sessão - Melhor Saúde',
        html,
        type: 'booking_reminder'
      }
    });
  }
};
