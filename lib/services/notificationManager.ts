/**
 * Notification Manager
 * Coordinates email and SMS notifications based on preferences
 */

import { 
  NotificationData, 
  NotificationType, 
  NotificationChannel,
  NotificationPreferences,
  NotificationResult 
} from '../types/notifications';
import { EmailService, createEmailService } from './emailService';
import { SMSService, createSMSService } from './smsService';

export class NotificationManager {
  private emailService: EmailService;
  private smsService: SMSService;
  private preferences: NotificationPreferences;

  constructor(
    emailService: EmailService,
    smsService: SMSService,
    preferences: NotificationPreferences
  ) {
    this.emailService = emailService;
    this.smsService = smsService;
    this.preferences = preferences;
  }

  /**
   * Send notification based on type and preferences
   */
  async sendNotification(
    type: NotificationType,
    data: NotificationData,
    channel?: NotificationChannel
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    
    // Determine which channels to use
    const channels = this.determineChannels(type, channel);
    
    // Determine recipient based on notification type
    const isAdminNotification = type === 'new_booking_admin';
    const emailRecipient = isAdminNotification 
      ? this.preferences.adminEmail || process.env.ADMIN_EMAIL || ''
      : data.client.email;
    const smsRecipient = isAdminNotification
      ? this.preferences.adminPhone || process.env.ADMIN_PHONE || ''
      : data.client.phone;
    
    // Send email if enabled
    if (channels.includes('email') && this.shouldSendEmail(type)) {
      if (emailRecipient) {
        const result = await this.emailService.send(type, emailRecipient, data);
        results.push(result);
      } else {
        results.push({
          success: false,
          channel: 'email',
          type,
          recipient: '',
          error: 'Email recipient not provided'
        });
      }
    }
    
    // Send SMS if enabled (only for certain notification types)
    if (channels.includes('sms') && this.shouldSendSMS(type)) {
      if (smsRecipient) {
        // Validate phone number format
        if (SMSService.isValidPhoneNumber(smsRecipient)) {
          const result = await this.smsService.send(type, smsRecipient, data);
          results.push(result);
        } else {
          results.push({
            success: false,
            channel: 'sms',
            type,
            recipient: smsRecipient,
            error: 'Invalid phone number format. Must be in E.164 format (e.g., +1234567890)'
          });
        }
      } else {
        results.push({
          success: false,
          channel: 'sms',
          type,
          recipient: '',
          error: 'SMS recipient not provided'
        });
      }
    }
    
    return results;
  }

  /**
   * Send booking confirmation notification
   */
  async sendBookingConfirmation(data: NotificationData): Promise<NotificationResult[]> {
    return this.sendNotification('booking_confirmation', data);
  }

  /**
   * Send deposit instructions notification
   */
  async sendDepositInstructions(data: NotificationData): Promise<NotificationResult[]> {
    // Deposit instructions are primarily sent via email
    return this.sendNotification('deposit_instructions', data, 'email');
  }

  /**
   * Send appointment reminder notification
   */
  async sendAppointmentReminder(data: NotificationData): Promise<NotificationResult[]> {
    return this.sendNotification('appointment_reminder', data);
  }

  /**
   * Send new booking alert to admin
   */
  async sendNewBookingAlert(data: NotificationData): Promise<NotificationResult[]> {
    return this.sendNotification('new_booking_admin', data);
  }

  /**
   * Determine which channels to use based on preferences and requested channel
   */
  private determineChannels(
    type: NotificationType,
    requestedChannel?: NotificationChannel
  ): NotificationChannel[] {
    if (requestedChannel === 'email') return ['email'];
    if (requestedChannel === 'sms') return ['sms'];
    
    const channels: NotificationChannel[] = [];
    
    // Check email preferences
    if (this.preferences.email.enabled) {
      const emailEnabled = this.getEmailPreferenceForType(type);
      if (emailEnabled) {
        channels.push('email');
      }
    }
    
    // Check SMS preferences
    if (this.preferences.sms.enabled) {
      const smsEnabled = this.getSMSPreferenceForType(type);
      if (smsEnabled) {
        channels.push('sms');
      }
    }
    
    // If both requested and nothing is enabled, default to email
    if (requestedChannel === 'both' && channels.length === 0) {
      channels.push('email');
    }
    
    return channels;
  }

  /**
   * Get email preference for specific notification type
   */
  private getEmailPreferenceForType(type: NotificationType): boolean {
    switch (type) {
      case 'booking_confirmation':
        return this.preferences.email.bookingConfirmation;
      case 'deposit_instructions':
        return this.preferences.email.depositInstructions;
      case 'appointment_reminder':
        return this.preferences.email.appointmentReminder;
      case 'new_booking_admin':
        return this.preferences.email.newBookingAlert;
      default:
        return false;
    }
  }

  /**
   * Get SMS preference for specific notification type
   */
  private getSMSPreferenceForType(type: NotificationType): boolean {
    switch (type) {
      case 'booking_confirmation':
        return this.preferences.sms.bookingConfirmation;
      case 'appointment_reminder':
        return this.preferences.sms.appointmentReminder;
      case 'new_booking_admin':
        return this.preferences.sms.newBookingAlert;
      case 'deposit_instructions':
        // SMS not recommended for deposit instructions
        return false;
      default:
        return false;
    }
  }

  /**
   * Check if email should be sent for this type
   */
  private shouldSendEmail(type: NotificationType): boolean {
    return this.preferences.email.enabled && this.getEmailPreferenceForType(type);
  }

  /**
   * Check if SMS should be sent for this type
   */
  private shouldSendSMS(type: NotificationType): boolean {
    return this.preferences.sms.enabled && this.getSMSPreferenceForType(type);
  }

  /**
   * Update notification preferences
   */
  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...preferences,
      email: {
        ...this.preferences.email,
        ...(preferences.email || {})
      },
      sms: {
        ...this.preferences.sms,
        ...(preferences.sms || {})
      }
    };
  }

  /**
   * Get current notification preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }
}

/**
 * Create notification manager with default configuration
 */
export function createNotificationManager(
  preferences?: Partial<NotificationPreferences>
): NotificationManager {
  const emailService = createEmailService();
  const smsService = createSMSService();
  
  const defaultPreferences: NotificationPreferences = {
    email: {
      enabled: true,
      bookingConfirmation: true,
      depositInstructions: true,
      appointmentReminder: true,
      newBookingAlert: true,
    },
    sms: {
      enabled: true,
      bookingConfirmation: true,
      appointmentReminder: true,
      newBookingAlert: true,
    },
    reminderHoursBefore: 24,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPhone: process.env.ADMIN_PHONE,
    ...preferences,
  };
  
  return new NotificationManager(emailService, smsService, defaultPreferences);
}
