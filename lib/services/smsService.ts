/**
 * SMS Service
 * Provides SMS notification functionality using Twilio
 */

import { 
  SMSServiceConfig, 
  NotificationData, 
  NotificationType, 
  NotificationResult 
} from '../types/notifications';
import { getSMSTemplate } from '../templates/sms/smsTemplates';

export class SMSService {
  private config: SMSServiceConfig;
  private client: any;

  constructor(config: SMSServiceConfig) {
    this.config = config;
    
    // Initialize Twilio client
    if (config.provider === 'twilio') {
      const twilio = require('twilio');
      this.client = twilio(
        config.twilio.accountSid,
        config.twilio.authToken
      );
    }
  }

  /**
   * Send an SMS notification
   */
  async send(
    type: NotificationType,
    recipient: string,
    data: NotificationData
  ): Promise<NotificationResult> {
    try {
      const template = getSMSTemplate(type, data);
      
      if (this.config.provider === 'twilio') {
        return await this.sendViaTwilio(type, recipient, template.body);
      }
      
      throw new Error('Invalid SMS service provider configured');
    } catch (error) {
      return {
        success: false,
        channel: 'sms',
        type,
        recipient,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send SMS using Twilio
   */
  private async sendViaTwilio(
    type: NotificationType,
    recipient: string,
    body: string
  ): Promise<NotificationResult> {
    try {
      const message = await this.client.messages.create({
        body,
        from: this.config.twilio.phoneNumber,
        to: recipient,
      });

      return {
        success: true,
        channel: 'sms',
        type,
        recipient,
        messageId: message.sid,
      };
    } catch (error) {
      throw new Error(`Twilio API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phone: string): boolean {
    // Basic E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  }
}

/**
 * Create and configure SMS service based on environment variables
 */
export function createSMSService(): SMSService {
  const config: SMSServiceConfig = {
    provider: 'twilio',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    },
  };

  return new SMSService(config);
}
