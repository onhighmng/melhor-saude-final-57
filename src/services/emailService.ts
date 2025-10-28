// Stub implementation - emails/email_deliveries tables don't exist

export class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  sendBookingConfirmation = async (...args: any[]) => {
    console.warn('[EmailService] sendBookingConfirmation not implemented - emails table does not exist');
    return null;
  };

  sendBookingCancellation = async (...args: any[]) => {
    console.warn('[EmailService] sendBookingCancellation not implemented - emails table does not exist');
    return null;
  };

  sendTemplateEmail = async (...args: any[]) => {
    console.warn('[EmailService] sendTemplateEmail not implemented - emails table does not exist');
    return null;
  };

  sendCustomEmail = async (...args: any[]) => {
    console.warn('[EmailService] sendCustomEmail not implemented - emails table does not exist');
    return null;
  };

  sendInvitationEmail = async (...args: any[]) => {
    console.warn('[EmailService] sendInvitationEmail not implemented - emails table does not exist');
    return null;
  };

  sendSessionConfirmationEmail = async (...args: any[]) => {
    console.warn('[EmailService] sendSessionConfirmationEmail not implemented - emails table does not exist');
    return null;
  };

  sendSessionReminderEmail = async (...args: any[]) => {
    console.warn('[EmailService] sendSessionReminderEmail not implemented - emails table does not exist');
    return null;
  };

  sendFeedbackRequestEmail = async (...args: any[]) => {
    console.warn('[EmailService] sendFeedbackRequestEmail not implemented - emails table does not exist');
    return null;
  };

  sendMonthlyReportEmail = async (...args: any[]) => {
    console.warn('[EmailService] sendMonthlyReportEmail not implemented - emails table does not exist');
    return null;
  };
}

export const emailService = EmailService.getInstance();
