// Stub implementation - sms/sms_deliveries tables don't exist

export class SMSService {
  private static instance: SMSService;

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  async sendTemplateSMS(...args: any[]): Promise<string | null> {
    console.warn('[SMSService] sendTemplateSMS not implemented - sms table does not exist');
    return null;
  }

  async sendCustomSMS(...args: any[]): Promise<string | null> {
    console.warn('[SMSService] sendCustomSMS not implemented');
    return null;
  }

  async sendSessionReminderSMS(...args: any[]): Promise<string | null> {
    console.warn('[SMSService] sendSessionReminderSMS not implemented');
    return null;
  }

  async sendVerificationCodeSMS(...args: any[]): Promise<string | null> {
    console.warn('[SMSService] sendVerificationCodeSMS not implemented');
    return null;
  }

  async sendEmergencyNotificationSMS(...args: any[]): Promise<string | null> {
    console.warn('[SMSService] sendEmergencyNotificationSMS not implemented');
    return null;
  }

  async getSMSStats(days: number = 30): Promise<any> {
    console.warn('[SMSService] getSMSStats not implemented');
    return {
      total_sent: 0,
      delivered: 0,
      failed: 0,
      delivery_rate: 0
    };
  }

  async retryFailedSMS(): Promise<void> {
    console.warn('[SMSService] retryFailedSMS not implemented');
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^(\+351|351)?[0-9]{9}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  formatPhoneNumber(phoneNumber: string): string {
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.startsWith('351')) {
      return `+${digits}`;
    }
    
    if (digits.startsWith('9') && digits.length === 9) {
      return `+351${digits}`;
    }
    
    if (digits.length === 9) {
      return `+351${digits}`;
    }
    
    return phoneNumber;
  }
}

export const smsService = SMSService.getInstance();
