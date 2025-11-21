/**
 * Tests for ReminderScheduler
 */

import { ReminderScheduler } from '@/lib/services/reminderScheduler';
import { NotificationManager } from '@/lib/services/notificationManager';
import { NotificationData, NotificationPreferences } from '@/lib/types/notifications';

describe('ReminderScheduler', () => {
  let scheduler: ReminderScheduler;
  let mockNotificationManager: jest.Mocked<NotificationManager>;
  let preferences: NotificationPreferences;
  let sampleData: NotificationData;

  beforeEach(() => {
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
    };

    sampleData = {
      client: {
        name: 'Jane Doe',
        email: 'jane@example.com',
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
        status: 'confirmed',
        createdAt: '2024-12-20T10:00:00Z',
      },
    };

    mockNotificationManager = {
      sendAppointmentReminder: jest.fn().mockResolvedValue([{
        success: true,
        channel: 'email',
        type: 'appointment_reminder',
        recipient: 'jane@example.com',
      }]),
    } as any;

    scheduler = new ReminderScheduler(mockNotificationManager, preferences);
  });

  describe('scheduleReminder', () => {
    it('should schedule a reminder 24 hours before appointment', () => {
      const reminder = scheduler.scheduleReminder(sampleData);

      expect(reminder.bookingId).toBe('booking-1');
      expect(reminder.sent).toBe(false);
      
      const appointmentDate = new Date('2024-12-25T10:00:00');
      const expectedTime = new Date(appointmentDate.getTime() - (24 * 60 * 60 * 1000));
      expect(reminder.scheduledTime.getTime()).toBe(expectedTime.getTime());
    });

    it('should store the scheduled reminder', () => {
      scheduler.scheduleReminder(sampleData);
      const reminder = scheduler.getReminder('booking-1');

      expect(reminder).toBeDefined();
      expect(reminder?.bookingId).toBe('booking-1');
    });
  });

  describe('cancelReminder', () => {
    it('should cancel a scheduled reminder', () => {
      scheduler.scheduleReminder(sampleData);
      const cancelled = scheduler.cancelReminder('booking-1');

      expect(cancelled).toBe(true);
      expect(scheduler.getReminder('booking-1')).toBeUndefined();
    });

    it('should return false if reminder does not exist', () => {
      const cancelled = scheduler.cancelReminder('non-existent');
      expect(cancelled).toBe(false);
    });
  });

  describe('sendReminder', () => {
    it('should send a reminder and mark it as sent', async () => {
      scheduler.scheduleReminder(sampleData);
      await scheduler.sendReminder(sampleData);

      expect(mockNotificationManager.sendAppointmentReminder).toHaveBeenCalledWith(sampleData);
      
      const reminder = scheduler.getReminder('booking-1');
      expect(reminder?.sent).toBe(true);
    });

    it('should throw error if reminder not scheduled', async () => {
      await expect(scheduler.sendReminder(sampleData)).rejects.toThrow(
        'No reminder scheduled for booking booking-1'
      );
    });

    it('should throw error if reminder already sent', async () => {
      scheduler.scheduleReminder(sampleData);
      await scheduler.sendReminder(sampleData);

      await expect(scheduler.sendReminder(sampleData)).rejects.toThrow(
        'Reminder for booking booking-1 has already been sent'
      );
    });
  });

  describe('calculateReminderTime', () => {
    it('should calculate correct reminder time', () => {
      const appointmentDate = new Date('2024-12-25T10:00:00');
      const reminderTime = ReminderScheduler.calculateReminderTime(appointmentDate, 24);
      
      const expectedTime = new Date('2024-12-24T10:00:00');
      expect(reminderTime.getTime()).toBe(expectedTime.getTime());
    });

    it('should handle custom hours before', () => {
      const appointmentDate = new Date('2024-12-25T10:00:00');
      const reminderTime = ReminderScheduler.calculateReminderTime(appointmentDate, 48);
      
      const expectedTime = new Date('2024-12-23T10:00:00');
      expect(reminderTime.getTime()).toBe(expectedTime.getTime());
    });
  });

  describe('shouldSendReminder', () => {
    it('should return true when current time is within tolerance', () => {
      // Create an appointment date 24 hours from now
      const now = new Date();
      const appointmentDate = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      
      const shouldSend = ReminderScheduler.shouldSendReminder(appointmentDate, 24, 30);
      expect(shouldSend).toBe(true);
    });

    it('should return false when outside tolerance window', () => {
      const now = new Date();
      const appointmentDate = new Date(now.getTime() + (25 * 60 * 60 * 1000));
      
      const shouldSend = ReminderScheduler.shouldSendReminder(appointmentDate, 24, 30);
      expect(shouldSend).toBe(false);
    });
  });
});
