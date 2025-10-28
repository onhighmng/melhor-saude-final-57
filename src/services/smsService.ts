import { supabase } from '@/integrations/supabase/client';

interface SMSData {
  to: string;
  message: string;
  template_id?: string;
  variables?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  scheduled_at?: string;
}

interface SMSDelivery {
  id: string;
  sms_id: string;
  recipient: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
  retry_count: number;
}

interface SMSStats {
  total_sent: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
}

export class SMSService {
  private static instance: SMSService;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  /**
   * Send SMS using template
   */
  async sendTemplateSMS(smsData: SMSData): Promise<string | null> {
    try {
      if (!smsData.template_id) {
        throw new Error('Template ID is required for template SMS');
      }

      // Get template
      const template = await this.getTemplate(smsData.template_id);
      if (!template) {
        throw new Error('Template not found');
      }

      // Replace variables in template
      const processedMessage = this.replaceVariables(template.message, smsData.variables || {});

      // Create SMS record
      const smsId = await this.createSMSRecord({
        to: smsData.to,
        message: processedMessage,
        template_id: smsData.template_id,
        variables: smsData.variables,
        priority: smsData.priority || 'normal',
        scheduled_at: smsData.scheduled_at
      });

      // Send SMS
      await this.sendSMS(smsId);

      return smsId;

    } catch (error) {
      console.error('Error sending template SMS:', error);
      return null;
    }
  }

  /**
   * Send custom SMS
   */
  async sendCustomSMS(smsData: SMSData): Promise<string | null> {
    try {
      if (!smsData.message) {
        throw new Error('Message is required for custom SMS');
      }

      // Create SMS record
      const smsId = await this.createSMSRecord({
        to: smsData.to,
        message: smsData.message,
        variables: smsData.variables,
        priority: smsData.priority || 'normal',
        scheduled_at: smsData.scheduled_at
      });

      // Send SMS
      await this.sendSMS(smsId);

      return smsId;

    } catch (error) {
      console.error('Error sending custom SMS:', error);
      return null;
    }
  }

  /**
   * Send session reminder SMS
   */
  async sendSessionReminderSMS(
    phoneNumber: string,
    userName: string,
    sessionDate: string,
    sessionTime: string,
    pillar: string,
    reminderType: '24h' | '1h'
  ): Promise<string | null> {
    return this.sendTemplateSMS({
      to: phoneNumber,
      template_id: `sms_reminder_${reminderType}`,
      variables: {
        user_name: userName,
        session_date: sessionDate,
        session_time: sessionTime,
        pillar: pillar,
        reminder_type: reminderType
      },
      priority: 'normal'
    });
  }

  /**
   * Send verification code SMS
   */
  async sendVerificationCodeSMS(
    phoneNumber: string,
    code: string,
    purpose: 'login' | 'password_reset' | 'phone_verification'
  ): Promise<string | null> {
    return this.sendTemplateSMS({
      to: phoneNumber,
      template_id: 'verification_code',
      variables: {
        code: code,
        purpose: purpose,
        expiry_minutes: 10
      },
      priority: 'high'
    });
  }

  /**
   * Send emergency notification SMS
   */
  async sendEmergencyNotificationSMS(
    phoneNumber: string,
    message: string,
    priority: 'low' | 'normal' | 'high' = 'high'
  ): Promise<string | null> {
    return this.sendCustomSMS({
      to: phoneNumber,
      message: message,
      priority: priority
    });
  }

  /**
   * Get SMS template
   */
  private async getTemplate(templateId: string): Promise<any> {
    try {
      // In a real implementation, this would fetch from database
      // For now, we'll use predefined templates
      const templates: Record<string, any> = {
        sms_reminder_24h: {
          id: 'sms_reminder_24h',
          name: 'Lembrete SMS 24h',
          message: 'Olá {{user_name}}! Lembrete: tem uma sessão de {{pillar}} agendada para amanhã às {{session_time}}. Melhor Saúde',
          variables: ['user_name', 'session_date', 'session_time', 'pillar'],
          category: 'reminder'
        },
        sms_reminder_1h: {
          id: 'sms_reminder_1h',
          name: 'Lembrete SMS 1h',
          message: 'Olá {{user_name}}! Sua sessão de {{pillar}} começa em 1 hora ({{session_time}}). Prepare-se! Melhor Saúde',
          variables: ['user_name', 'session_date', 'session_time', 'pillar'],
          category: 'reminder'
        },
        verification_code: {
          id: 'verification_code',
          name: 'Código de Verificação',
          message: 'Seu código de verificação Melhor Saúde: {{code}}. Válido por {{expiry_minutes}} minutos. Não partilhe este código.',
          variables: ['code', 'purpose', 'expiry_minutes'],
          category: 'verification'
        },
        session_confirmation: {
          id: 'session_confirmation',
          name: 'Confirmação de Sessão',
          message: 'Sua sessão de {{pillar}} foi confirmada para {{session_date}} às {{session_time}}. Melhor Saúde',
          variables: ['user_name', 'session_date', 'session_time', 'pillar'],
          category: 'confirmation'
        },
        session_cancelled: {
          id: 'session_cancelled',
          name: 'Sessão Cancelada',
          message: 'Sua sessão de {{pillar}} para {{session_date}} foi cancelada. Entre em contacto para reagendar. Melhor Saúde',
          variables: ['user_name', 'session_date', 'session_time', 'pillar'],
          category: 'notification'
        },
        feedback_request: {
          id: 'feedback_request',
          name: 'Pedido de Feedback',
          message: 'Como foi sua sessão de {{pillar}}? Dê-nos o seu feedback: {{feedback_url}} Melhor Saúde',
          variables: ['user_name', 'pillar', 'feedback_url'],
          category: 'notification'
        }
      };

      return templates[templateId] || null;
    } catch (error) {
      console.error('Error getting SMS template:', error);
      return null;
    }
  }

  /**
   * Create SMS record in database
   */
  private async createSMSRecord(smsData: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('sms')
        .insert({
          to: smsData.to,
          message: smsData.message,
          template_id: smsData.template_id,
          variables: smsData.variables,
          priority: smsData.priority,
          scheduled_at: smsData.scheduled_at,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating SMS record:', error);
      throw error;
    }
  }

  /**
   * Send SMS via external service
   */
  private async sendSMS(smsId: string): Promise<void> {
    try {
      // Get SMS data
      const { data: sms, error: fetchError } = await supabase
        .from('sms')
        .select('*')
        .eq('id', smsId)
        .single();

      if (fetchError) throw fetchError;

      // Create delivery record
      const { data: delivery, error: deliveryError } = await supabase
        .from('sms_deliveries')
        .insert({
          sms_id: smsId,
          recipient: sms.to,
          status: 'pending',
          retry_count: 0
        })
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      // Send via external service (Twilio, AWS SNS, etc.)
      await this.sendViaExternalService(sms, delivery.id);

      // Update SMS status
      await supabase
        .from('sms')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', smsId);

    } catch (error) {
      console.error('Error sending SMS:', error);
      
      // Update SMS status to failed
      await supabase
        .from('sms')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', smsId);
      
      throw error;
    }
  }

  /**
   * Send SMS via external service (Twilio, AWS SNS, etc.)
   */
  private async sendViaExternalService(sms: any, deliveryId: string): Promise<void> {
    try {
      // This would integrate with Twilio, AWS SNS, or similar service
      // For now, we'll simulate the process
      
      const smsPayload = {
        to: sms.to,
        message: sms.message
      };

      // Simulate API call
      console.log('Sending SMS via external service:', smsPayload);

      // Update delivery status
      await supabase
        .from('sms_deliveries')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', deliveryId);

    } catch (error) {
      console.error('Error sending via external service:', error);
      
      // Update delivery status to failed
      await supabase
        .from('sms_deliveries')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', deliveryId);
      
      throw error;
    }
  }

  /**
   * Replace variables in template content
   */
  private replaceVariables(content: string, variables: Record<string, any>): string {
    let processedContent = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, String(value || ''));
    });

    return processedContent;
  }

  /**
   * Get SMS statistics
   */
  async getSMSStats(days: number = 30): Promise<SMSStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('sms_deliveries')
        .select('status')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const deliveries = data || [];
      const totalSent = deliveries.length;
      const delivered = deliveries.filter(d => d.status === 'delivered').length;
      const failed = deliveries.filter(d => d.status === 'failed').length;

      return {
        total_sent: totalSent,
        delivered,
        failed,
        delivery_rate: totalSent > 0 ? (delivered / totalSent) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting SMS stats:', error);
      return {
        total_sent: 0,
        delivered: 0,
        failed: 0,
        delivery_rate: 0
      };
    }
  }

  /**
   * Retry failed SMS
   */
  async retryFailedSMS(): Promise<void> {
    try {
      const { data: failedDeliveries, error } = await supabase
        .from('sms_deliveries')
        .select(`
          *,
          sms(*)
        `)
        .eq('status', 'failed')
        .lt('retry_count', this.MAX_RETRIES);

      if (error) throw error;

      for (const delivery of failedDeliveries || []) {
        try {
          await this.sendViaExternalService(delivery.sms, delivery.id);
          
          // Update retry count
          await supabase
            .from('sms_deliveries')
            .update({ retry_count: delivery.retry_count + 1 })
            .eq('id', delivery.id);

        } catch (retryError) {
          console.error('Error retrying SMS:', retryError);
        }
      }
    } catch (error) {
      console.error('Error retrying failed SMS:', error);
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation (Portuguese format)
    const phoneRegex = /^(\+351|351)?[0-9]{9}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  /**
   * Format phone number for international use
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 351, keep it
    if (digits.startsWith('351')) {
      return `+${digits}`;
    }
    
    // If it starts with 9, add 351 prefix
    if (digits.startsWith('9') && digits.length === 9) {
      return `+351${digits}`;
    }
    
    // If it's 9 digits, add 351 prefix
    if (digits.length === 9) {
      return `+351${digits}`;
    }
    
    return phoneNumber;
  }
}

// Export singleton instance
export const smsService = SMSService.getInstance();
