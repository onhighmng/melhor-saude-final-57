// Stub implementation - emails/email_deliveries tables don't exist
export class EmailService {
  sendBookingConfirmation = async (...args: any[]) => {
    console.warn('[EmailService] Not implemented');
  };
  sendBookingCancellation = async (...args: any[]) => {
    console.warn('[EmailService] Not implemented');
  };
}
export const emailService = new EmailService();
