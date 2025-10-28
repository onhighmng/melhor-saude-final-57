import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  category: 'invitation' | 'confirmation' | 'reminder' | 'report' | 'notification';
}

interface EmailData {
  to: string | string[];
  template_id?: string;
  subject?: string;
  html_content?: string;
  text_content?: string;
  variables?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
  priority?: 'low' | 'normal' | 'high';
  scheduled_at?: string;
}

interface EmailDelivery {
  id: string;
  email_id: string;
  recipient: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
  retry_count: number;
}

interface EmailStats {
  total_sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

export class EmailService {
  private static instance: EmailService;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send email using template
   */
  async sendTemplateEmail(emailData: EmailData): Promise<string | null> {
    try {
      if (!emailData.template_id) {
        throw new Error('Template ID is required for template emails');
      }

      // Get template
      const template = await this.getTemplate(emailData.template_id);
      if (!template) {
        throw new Error('Template not found');
      }

      // Replace variables in template
      const processedSubject = this.replaceVariables(template.subject, emailData.variables || {});
      const processedHtml = this.replaceVariables(template.html_content, emailData.variables || {});
      const processedText = this.replaceVariables(template.text_content, emailData.variables || {});

      // Create email record
      const emailId = await this.createEmailRecord({
        to: emailData.to,
        subject: processedSubject,
        html_content: processedHtml,
        text_content: processedText,
        template_id: emailData.template_id,
        variables: emailData.variables,
        priority: emailData.priority || 'normal',
        scheduled_at: emailData.scheduled_at
      });

      // Send email
      await this.sendEmail(emailId);

      return emailId;

    } catch (error) {
      console.error('Error sending template email:', error);
      return null;
    }
  }

  /**
   * Send custom email
   */
  async sendCustomEmail(emailData: EmailData): Promise<string | null> {
    try {
      if (!emailData.subject || !emailData.html_content) {
        throw new Error('Subject and HTML content are required for custom emails');
      }

      // Create email record
      const emailId = await this.createEmailRecord({
        to: emailData.to,
        subject: emailData.subject,
        html_content: emailData.html_content,
        text_content: emailData.text_content,
        variables: emailData.variables,
        priority: emailData.priority || 'normal',
        scheduled_at: emailData.scheduled_at
      });

      // Send email
      await this.sendEmail(emailId);

      return emailId;

    } catch (error) {
      console.error('Error sending custom email:', error);
      return null;
    }
  }

  /**
   * Send invitation email
   */
  async sendInvitationEmail(
    email: string,
    inviteCode: string,
    companyName: string,
    inviterName: string
  ): Promise<string | null> {
    return this.sendTemplateEmail({
      to: email,
      template_id: 'invitation',
      variables: {
        invite_code: inviteCode,
        company_name: companyName,
        inviter_name: inviterName,
        invitation_url: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteCode}`,
        expiry_days: 30
      },
      priority: 'normal'
    });
  }

  /**
   * Send session confirmation email
   */
  async sendSessionConfirmationEmail(
    email: string,
    userName: string,
    sessionDate: string,
    sessionTime: string,
    pillar: string,
    sessionType: string,
    meetingLink?: string
  ): Promise<string | null> {
    return this.sendTemplateEmail({
      to: email,
      template_id: 'session_confirmation',
      variables: {
        user_name: userName,
        session_date: sessionDate,
        session_time: sessionTime,
        pillar: pillar,
        session_type: sessionType,
        meeting_link: meetingLink || '',
        calendar_url: this.generateCalendarUrl(sessionDate, sessionTime, pillar)
      },
      priority: 'normal'
    });
  }

  /**
   * Send session reminder email
   */
  async sendSessionReminderEmail(
    email: string,
    userName: string,
    sessionDate: string,
    sessionTime: string,
    pillar: string,
    reminderType: '24h' | '1h'
  ): Promise<string | null> {
    return this.sendTemplateEmail({
      to: email,
      template_id: `reminder_${reminderType}`,
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
   * Send feedback request email
   */
  async sendFeedbackRequestEmail(
    email: string,
    userName: string,
    sessionDate: string,
    pillar: string,
    feedbackUrl: string
  ): Promise<string | null> {
    return this.sendTemplateEmail({
      to: email,
      template_id: 'feedback_request',
      variables: {
        user_name: userName,
        session_date: sessionDate,
        pillar: pillar,
        feedback_url: feedbackUrl
      },
      priority: 'normal'
    });
  }

  /**
   * Send monthly report email
   */
  async sendMonthlyReportEmail(
    email: string,
    companyName: string,
    reportData: any,
    reportUrl: string
  ): Promise<string | null> {
    return this.sendTemplateEmail({
      to: email,
      template_id: 'monthly_report',
      variables: {
        company_name: companyName,
        report_data: reportData,
        report_url: reportUrl,
        month: new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
      },
      priority: 'normal',
      attachments: [{
        filename: `relatorio-${companyName}-${new Date().toISOString().split('T')[0]}.pdf`,
        content: reportUrl,
        type: 'application/pdf'
      }]
    });
  }

  /**
   * Get email template
   */
  private async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    try {
      // In a real implementation, this would fetch from database
      // For now, we'll use predefined templates
      const templates: Record<string, EmailTemplate> = {
        invitation: {
          id: 'invitation',
          name: 'Convite de Acesso',
          subject: 'Convite para Melhor Saúde - {{company_name}}',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Olá!</h2>
              <p>Foi convidado por <strong>{{inviter_name}}</strong> da empresa <strong>{{company_name}}</strong> para aceder à plataforma Melhor Saúde.</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Seu Código de Acesso:</h3>
                <p style="font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; margin: 10px 0;">{{invite_code}}</p>
              </div>
              
              <p>Para começar, clique no botão abaixo:</p>
              <a href="{{invitation_url}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                Aceitar Convite
              </a>
              
              <p style="color: #666; font-size: 14px;">
                Este convite expira em {{expiry_days}} dias.<br>
                Se não conseguir clicar no botão, copie e cole este link no seu navegador: {{invitation_url}}
              </p>
            </div>
          `,
          text_content: `
            Olá!
            
            Foi convidado por {{inviter_name}} da empresa {{company_name}} para aceder à plataforma Melhor Saúde.
            
            Seu Código de Acesso: {{invite_code}}
            
            Para começar, visite: {{invitation_url}}
            
            Este convite expira em {{expiry_days}} dias.
          `,
          variables: ['invite_code', 'company_name', 'inviter_name', 'invitation_url', 'expiry_days'],
          category: 'invitation'
        },
        session_confirmation: {
          id: 'session_confirmation',
          name: 'Confirmação de Sessão',
          subject: 'Sessão Confirmada - {{pillar}}',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Olá {{user_name}}!</h2>
              <p>Sua sessão foi confirmada com sucesso.</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Detalhes da Sessão:</h3>
                <p><strong>Data:</strong> {{session_date}}</p>
                <p><strong>Hora:</strong> {{session_time}}</p>
                <p><strong>Pilar:</strong> {{pillar}}</p>
                <p><strong>Tipo:</strong> {{session_type}}</p>
                {{#if meeting_link}}
                <p><strong>Link da Sessão:</strong> <a href="{{meeting_link}}">{{meeting_link}}</a></p>
                {{/if}}
              </div>
              
              <p>Adicione ao seu calendário:</p>
              <a href="{{calendar_url}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                Adicionar ao Calendário
              </a>
              
              <p style="color: #666; font-size: 14px;">
                Se precisar reagendar ou cancelar, entre em contacto connosco.
              </p>
            </div>
          `,
          text_content: `
            Olá {{user_name}}!
            
            Sua sessão foi confirmada com sucesso.
            
            Detalhes da Sessão:
            - Data: {{session_date}}
            - Hora: {{session_time}}
            - Pilar: {{pillar}}
            - Tipo: {{session_type}}
            {{#if meeting_link}}
            - Link: {{meeting_link}}
            {{/if}}
            
            Adicionar ao calendário: {{calendar_url}}
            
            Se precisar reagendar ou cancelar, entre em contacto connosco.
          `,
          variables: ['user_name', 'session_date', 'session_time', 'pillar', 'session_type', 'meeting_link', 'calendar_url'],
          category: 'confirmation'
        },
        reminder_24h: {
          id: 'reminder_24h',
          name: 'Lembrete 24h',
          subject: 'Lembrete: Sessão Amanhã - {{pillar}}',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Olá {{user_name}}!</h2>
              <p>Este é um lembrete de que tem uma sessão agendada para amanhã.</p>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Sessão Amanhã:</h3>
                <p><strong>Data:</strong> {{session_date}}</p>
                <p><strong>Hora:</strong> {{session_time}}</p>
                <p><strong>Pilar:</strong> {{pillar}}</p>
              </div>
              
              <p>Certifique-se de estar disponível no horário agendado.</p>
            </div>
          `,
          text_content: `
            Olá {{user_name}}!
            
            Este é um lembrete de que tem uma sessão agendada para amanhã.
            
            Sessão Amanhã:
            - Data: {{session_date}}
            - Hora: {{session_time}}
            - Pilar: {{pillar}}
            
            Certifique-se de estar disponível no horário agendado.
          `,
          variables: ['user_name', 'session_date', 'session_time', 'pillar'],
          category: 'reminder'
        },
        reminder_1h: {
          id: 'reminder_1h',
          name: 'Lembrete 1h',
          subject: 'Lembrete: Sessão em 1 Hora - {{pillar}}',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Olá {{user_name}}!</h2>
              <p>Sua sessão começa em 1 hora!</p>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Sessão em 1 Hora:</h3>
                <p><strong>Data:</strong> {{session_date}}</p>
                <p><strong>Hora:</strong> {{session_time}}</p>
                <p><strong>Pilar:</strong> {{pillar}}</p>
              </div>
              
              <p>Prepare-se para a sua sessão!</p>
            </div>
          `,
          text_content: `
            Olá {{user_name}}!
            
            Sua sessão começa em 1 hora!
            
            Sessão em 1 Hora:
            - Data: {{session_date}}
            - Hora: {{session_time}}
            - Pilar: {{pillar}}
            
            Prepare-se para a sua sessão!
          `,
          variables: ['user_name', 'session_date', 'session_time', 'pillar'],
          category: 'reminder'
        },
        feedback_request: {
          id: 'feedback_request',
          name: 'Pedido de Feedback',
          subject: 'Como foi sua sessão? - {{pillar}}',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Olá {{user_name}}!</h2>
              <p>Esperamos que sua sessão de {{pillar}} tenha sido útil.</p>
              
              <p>Gostaríamos de saber como foi sua experiência:</p>
              
              <a href="{{feedback_url}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                Dar Feedback
              </a>
              
              <p style="color: #666; font-size: 14px;">
                Seu feedback é importante para melhorarmos nossos serviços.
              </p>
            </div>
          `,
          text_content: `
            Olá {{user_name}}!
            
            Esperamos que sua sessão de {{pillar}} tenha sido útil.
            
            Gostaríamos de saber como foi sua experiência.
            
            Dar Feedback: {{feedback_url}}
            
            Seu feedback é importante para melhorarmos nossos serviços.
          `,
          variables: ['user_name', 'pillar', 'feedback_url'],
          category: 'notification'
        },
        monthly_report: {
          id: 'monthly_report',
          name: 'Relatório Mensal',
          subject: 'Relatório Mensal - {{company_name}}',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Relatório Mensal - {{month}}</h2>
              <p>Olá {{company_name}},</p>
              
              <p>Segue em anexo o relatório mensal com as estatísticas de utilização da plataforma Melhor Saúde.</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Resumo do Mês:</h3>
                <p><strong>Sessões Realizadas:</strong> {{report_data.sessions_completed}}</p>
                <p><strong>Utilizadores Ativos:</strong> {{report_data.active_users}}</p>
                <p><strong>Satisfação Média:</strong> {{report_data.average_satisfaction}}/5</p>
              </div>
              
              <p>Para mais detalhes, consulte o relatório completo em anexo.</p>
            </div>
          `,
          text_content: `
            Relatório Mensal - {{month}}
            
            Olá {{company_name}},
            
            Segue em anexo o relatório mensal com as estatísticas de utilização da plataforma Melhor Saúde.
            
            Resumo do Mês:
            - Sessões Realizadas: {{report_data.sessions_completed}}
            - Utilizadores Ativos: {{report_data.active_users}}
            - Satisfação Média: {{report_data.average_satisfaction}}/5
            
            Para mais detalhes, consulte o relatório completo em anexo.
          `,
          variables: ['company_name', 'month', 'report_data'],
          category: 'report'
        }
      };

      return templates[templateId] || null;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  /**
   * Create email record in database
   */
  private async createEmailRecord(emailData: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('emails')
        .insert({
          to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
          subject: emailData.subject,
          html_content: emailData.html_content,
          text_content: emailData.text_content,
          template_id: emailData.template_id,
          variables: emailData.variables,
          priority: emailData.priority,
          scheduled_at: emailData.scheduled_at,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating email record:', error);
      throw error;
    }
  }

  /**
   * Send email via external service
   */
  private async sendEmail(emailId: string): Promise<void> {
    try {
      // Get email data
      const { data: email, error: fetchError } = await supabase
        .from('emails')
        .select('*')
        .eq('id', emailId)
        .single();

      if (fetchError) throw fetchError;

      // Create delivery records for each recipient
      const recipients = email.to;
      const deliveryPromises = recipients.map(async (recipient: string) => {
        const { data: delivery, error: deliveryError } = await supabase
          .from('email_deliveries')
          .insert({
            email_id: emailId,
            recipient,
            status: 'pending',
            retry_count: 0
          })
          .select()
          .single();

        if (deliveryError) throw deliveryError;

        // Send via external service (Resend, SendGrid, etc.)
        await this.sendViaExternalService(email, recipient, delivery.id);
      });

      await Promise.all(deliveryPromises);

      // Update email status
      await supabase
        .from('emails')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', emailId);

    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update email status to failed
      await supabase
        .from('emails')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', emailId);
      
      throw error;
    }
  }

  /**
   * Send email via external service (Resend, SendGrid, etc.)
   */
  private async sendViaExternalService(email: any, recipient: string, deliveryId: string): Promise<void> {
    try {
      // This would integrate with Resend, SendGrid, or similar service
      // For now, we'll simulate the process
      
      const emailPayload = {
        to: recipient,
        subject: email.subject,
        html: email.html_content,
        text: email.text_content
      };

      // Simulate API call
      console.log('Sending email via external service:', emailPayload);

      // Update delivery status
      await supabase
        .from('email_deliveries')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', deliveryId);

    } catch (error) {
      console.error('Error sending via external service:', error);
      
      // Update delivery status to failed
      await supabase
        .from('email_deliveries')
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
   * Generate calendar URL for session
   */
  private generateCalendarUrl(date: string, time: string, pillar: string): string {
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const title = `Sessão Melhor Saúde - ${pillar}`;
    const details = `Sessão de bem-estar na plataforma Melhor Saúde`;
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(details)}`;
    
    return googleUrl;
  }

  /**
   * Get email statistics
   */
  async getEmailStats(days: number = 30): Promise<EmailStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('email_deliveries')
        .select('status')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const deliveries = data || [];
      const totalSent = deliveries.length;
      const delivered = deliveries.filter(d => d.status === 'delivered').length;
      const opened = deliveries.filter(d => d.status === 'opened').length;
      const clicked = deliveries.filter(d => d.status === 'clicked').length;
      const bounced = deliveries.filter(d => d.status === 'bounced').length;
      const failed = deliveries.filter(d => d.status === 'failed').length;

      return {
        total_sent: totalSent,
        delivered,
        opened,
        clicked,
        bounced,
        failed,
        delivery_rate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
        open_rate: delivered > 0 ? (opened / delivered) * 100 : 0,
        click_rate: opened > 0 ? (clicked / opened) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting email stats:', error);
      return {
        total_sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        failed: 0,
        delivery_rate: 0,
        open_rate: 0,
        click_rate: 0
      };
    }
  }

  /**
   * Retry failed emails
   */
  async retryFailedEmails(): Promise<void> {
    try {
      const { data: failedDeliveries, error } = await supabase
        .from('email_deliveries')
        .select(`
          *,
          emails(*)
        `)
        .eq('status', 'failed')
        .lt('retry_count', this.MAX_RETRIES);

      if (error) throw error;

      for (const delivery of failedDeliveries || []) {
        try {
          await this.sendViaExternalService(delivery.emails, delivery.recipient, delivery.id);
          
          // Update retry count
          await supabase
            .from('email_deliveries')
            .update({ retry_count: delivery.retry_count + 1 })
            .eq('id', delivery.id);

        } catch (retryError) {
          console.error('Error retrying email:', retryError);
        }
      }
    } catch (error) {
      console.error('Error retrying failed emails:', error);
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();