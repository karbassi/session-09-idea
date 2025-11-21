/**
 * Email Service
 * Provides email functionality using either EmailJS or SendGrid
 */

import { 
  EmailServiceConfig, 
  NotificationData, 
  NotificationType, 
  NotificationResult,
  EmailTemplate 
} from '../types/notifications';
import { getEmailTemplate } from '../templates/email/emailTemplates';

export class EmailService {
  private config: EmailServiceConfig;

  constructor(config: EmailServiceConfig) {
    this.config = config;
  }

  /**
   * Send an email notification
   */
  async send(
    type: NotificationType,
    recipient: string,
    data: NotificationData
  ): Promise<NotificationResult> {
    try {
      const template = getEmailTemplate(type, data);
      
      if (this.config.provider === 'emailjs') {
        return await this.sendViaEmailJS(type, recipient, template, data);
      } else if (this.config.provider === 'sendgrid') {
        return await this.sendViaSendGrid(type, recipient, template);
      }
      
      throw new Error('Invalid email service provider configured');
    } catch (error) {
      return {
        success: false,
        channel: 'email',
        type,
        recipient,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send email using EmailJS
   */
  private async sendViaEmailJS(
    type: NotificationType,
    recipient: string,
    template: EmailTemplate,
    data: NotificationData
  ): Promise<NotificationResult> {
    if (!this.config.emailjs) {
      throw new Error('EmailJS configuration is missing');
    }

    // EmailJS is a client-side library, so we'll need to use their REST API
    // for server-side sending
    const templateId = this.config.emailjs.templates[type];
    
    if (!templateId) {
      throw new Error(`EmailJS template not found for type: ${type}`);
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: this.config.emailjs.serviceId,
        template_id: templateId,
        user_id: this.config.emailjs.publicKey,
        template_params: {
          to_email: recipient,
          to_name: data.client.name,
          subject: template.subject,
          client_name: data.client.name,
          service_name: data.service.name,
          booking_date: data.booking.date,
          booking_time: data.booking.startTime,
          booking_id: data.booking.id,
          service_price: data.service.price,
          service_duration: data.service.duration,
          zelle_email: data.zelleInfo?.email,
          zelle_phone: data.zelleInfo?.phone,
          zelle_qr_url: data.zelleInfo?.qrCodeUrl,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`EmailJS API error: ${response.statusText}`);
    }

    const result = await response.text();

    return {
      success: true,
      channel: 'email',
      type,
      recipient,
      messageId: result,
    };
  }

  /**
   * Send email using SendGrid
   */
  private async sendViaSendGrid(
    type: NotificationType,
    recipient: string,
    template: EmailTemplate
  ): Promise<NotificationResult> {
    if (!this.config.sendgrid) {
      throw new Error('SendGrid configuration is missing');
    }

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(this.config.sendgrid.apiKey);

    const msg = {
      to: recipient,
      from: this.config.sendgrid.fromEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    const [response] = await sgMail.send(msg);

    return {
      success: true,
      channel: 'email',
      type,
      recipient,
      messageId: response.headers['x-message-id'],
    };
  }
}

/**
 * Create and configure email service based on environment variables
 */
export function createEmailService(): EmailService {
  const provider = process.env.SENDGRID_API_KEY ? 'sendgrid' : 'emailjs';
  
  const config: EmailServiceConfig = {
    provider,
    ...(provider === 'emailjs' ? {
      emailjs: {
        serviceId: process.env.EMAILJS_SERVICE_ID || '',
        publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
        templates: {
          booking_confirmation: process.env.EMAILJS_TEMPLATE_BOOKING_CONFIRMATION || '',
          deposit_instructions: process.env.EMAILJS_TEMPLATE_DEPOSIT_INSTRUCTIONS || '',
          appointment_reminder: process.env.EMAILJS_TEMPLATE_APPOINTMENT_REMINDER || '',
          new_booking_admin: process.env.EMAILJS_TEMPLATE_NEW_BOOKING_ADMIN || '',
        },
      },
    } : {
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY || '',
        fromEmail: process.env.SENDGRID_FROM_EMAIL || '',
      },
    }),
  };

  return new EmailService(config);
}
