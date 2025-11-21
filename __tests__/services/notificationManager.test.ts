/**
 * Tests for NotificationManager
 */

import { NotificationManager } from '@/lib/services/notificationManager';
import { EmailService } from '@/lib/services/emailService';
import { SMSService } from '@/lib/services/smsService';
import { 
  NotificationPreferences, 
  NotificationData,
  EmailServiceConfig,
  SMSServiceConfig 
} from '@/lib/types/notifications';

// Mock the services but keep static methods
jest.mock('@/lib/services/emailService');

describe('NotificationManager', () => {
  let notificationManager: NotificationManager;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockSMSService: jest.Mocked<SMSService>;
  let preferences: NotificationPreferences;
  let sampleData: NotificationData;

  beforeEach(() => {
    // Setup preferences
    preferences = {
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
      adminEmail: 'admin@example.com',
      adminPhone: '+1234567890',
    };

    // Setup sample data
    sampleData = {
      client: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1987654321',
      },
      service: {
        id: 'service-1',
        name: 'Haircut',
        duration: 60,
        price: 50,
      },
      booking: {
        id: 'booking-1',
        clientId: 'client-1',
        serviceId: 'service-1',
        date: '2024-12-25',
        startTime: '10:00',
        endTime: '11:00',
        status: 'pending',
        createdAt: '2024-12-20T10:00:00Z',
      },
    };

    // Create mock services
    const emailConfig: EmailServiceConfig = {
      provider: 'sendgrid',
      sendgrid: {
        apiKey: 'test-key',
        fromEmail: 'test@example.com',
      },
    };

    const smsConfig: SMSServiceConfig = {
      provider: 'twilio',
      twilio: {
        accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Valid format for Twilio
        authToken: 'test-token',
        phoneNumber: '+1234567890',
      },
    };

    mockEmailService = new EmailService(emailConfig) as jest.Mocked<EmailService>;
    // Create real SMS service but mock its send method
    mockSMSService = new SMSService(smsConfig);

    // Mock the send methods
    mockEmailService.send = jest.fn().mockResolvedValue({
      success: true,
      channel: 'email',
      type: 'booking_confirmation',
      recipient: 'john@example.com',
      messageId: 'test-message-id',
    });

    mockSMSService.send = jest.fn().mockResolvedValue({
      success: true,
      channel: 'sms',
      type: 'booking_confirmation',
      recipient: '+1987654321',
      messageId: 'test-sms-id',
    });

    notificationManager = new NotificationManager(
      mockEmailService,
      mockSMSService,
      preferences
    );
  });

  describe('sendBookingConfirmation', () => {
    it('should send both email and SMS when both are enabled', async () => {
      const results = await notificationManager.sendBookingConfirmation(sampleData);

      expect(results).toHaveLength(2);
      expect(mockEmailService.send).toHaveBeenCalledWith(
        'booking_confirmation',
        'john@example.com',
        sampleData
      );
      expect(mockSMSService.send).toHaveBeenCalledWith(
        'booking_confirmation',
        '+1987654321',
        sampleData
      );
    });

    it('should only send email when SMS is disabled', async () => {
      notificationManager.updatePreferences({
        sms: { ...preferences.sms, enabled: false },
      });

      const results = await notificationManager.sendBookingConfirmation(sampleData);

      expect(results).toHaveLength(1);
      expect(results[0].channel).toBe('email');
      expect(mockEmailService.send).toHaveBeenCalled();
      expect(mockSMSService.send).not.toHaveBeenCalled();
    });

    it('should only send SMS when email is disabled', async () => {
      notificationManager.updatePreferences({
        email: { ...preferences.email, enabled: false },
      });

      const results = await notificationManager.sendBookingConfirmation(sampleData);

      expect(results).toHaveLength(1);
      expect(results[0].channel).toBe('sms');
      expect(mockSMSService.send).toHaveBeenCalled();
      expect(mockEmailService.send).not.toHaveBeenCalled();
    });
  });

  describe('sendDepositInstructions', () => {
    it('should only send email for deposit instructions', async () => {
      const results = await notificationManager.sendDepositInstructions(sampleData);

      expect(results).toHaveLength(1);
      expect(results[0].channel).toBe('email');
      expect(mockEmailService.send).toHaveBeenCalledWith(
        'deposit_instructions',
        'john@example.com',
        sampleData
      );
      expect(mockSMSService.send).not.toHaveBeenCalled();
    });
  });

  describe('sendNewBookingAlert', () => {
    it('should send to admin email and phone', async () => {
      const results = await notificationManager.sendNewBookingAlert(sampleData);

      expect(results).toHaveLength(2);
      expect(mockEmailService.send).toHaveBeenCalledWith(
        'new_booking_admin',
        'admin@example.com',
        sampleData
      );
      expect(mockSMSService.send).toHaveBeenCalledWith(
        'new_booking_admin',
        '+1234567890',
        sampleData
      );
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences correctly', () => {
      const newPreferences = {
        email: { ...preferences.email, bookingConfirmation: false },
      };

      notificationManager.updatePreferences(newPreferences);
      const updated = notificationManager.getPreferences();

      expect(updated.email.bookingConfirmation).toBe(false);
      expect(updated.email.depositInstructions).toBe(true);
    });
  });
});
