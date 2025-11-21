/**
 * Reminder Scheduler
 * Handles automated appointment reminders
 */

import { NotificationData, NotificationPreferences } from '../types/notifications';
import { NotificationManager } from './notificationManager';

export interface ScheduledReminder {
  bookingId: string;
  scheduledTime: Date;
  sent: boolean;
}

export class ReminderScheduler {
  private notificationManager: NotificationManager;
  private preferences: NotificationPreferences;
  private scheduledReminders: Map<string, ScheduledReminder>;

  constructor(
    notificationManager: NotificationManager,
    preferences: NotificationPreferences
  ) {
    this.notificationManager = notificationManager;
    this.preferences = preferences;
    this.scheduledReminders = new Map();
  }

  /**
   * Schedule a reminder for an appointment
   * @param data Notification data for the booking
   * @returns Scheduled reminder information
   */
  scheduleReminder(data: NotificationData): ScheduledReminder {
    // Parse appointment date and time, assuming local timezone
    // In production, consider storing timezone with bookings
    const appointmentDate = new Date(`${data.booking.date}T${data.booking.startTime}:00`);
    
    // Validate date
    if (isNaN(appointmentDate.getTime())) {
      throw new Error(`Invalid appointment date/time: ${data.booking.date} ${data.booking.startTime}`);
    }
    
    const hoursBeforeReminder = this.preferences.reminderHoursBefore || 24;
    const reminderTime = new Date(appointmentDate.getTime() - (hoursBeforeReminder * 60 * 60 * 1000));
    
    const reminder: ScheduledReminder = {
      bookingId: data.booking.id,
      scheduledTime: reminderTime,
      sent: false,
    };
    
    this.scheduledReminders.set(data.booking.id, reminder);
    
    // In a production environment, this would integrate with a job scheduler
    // like node-cron, bull, or a cloud service like AWS EventBridge
    // For now, we'll return the scheduled time for external scheduling
    
    return reminder;
  }

  /**
   * Cancel a scheduled reminder
   */
  cancelReminder(bookingId: string): boolean {
    return this.scheduledReminders.delete(bookingId);
  }

  /**
   * Send a reminder immediately (used by scheduler when time arrives)
   */
  async sendReminder(data: NotificationData): Promise<void> {
    const reminder = this.scheduledReminders.get(data.booking.id);
    
    if (!reminder) {
      throw new Error(`No reminder scheduled for booking ${data.booking.id}`);
    }
    
    if (reminder.sent) {
      throw new Error(`Reminder for booking ${data.booking.id} has already been sent`);
    }
    
    await this.notificationManager.sendAppointmentReminder(data);
    
    // Mark as sent
    reminder.sent = true;
    this.scheduledReminders.set(data.booking.id, reminder);
  }

  /**
   * Check and send any pending reminders
   * This should be called periodically (e.g., every hour)
   */
  async processPendingReminders(bookingsData: NotificationData[]): Promise<void> {
    const now = new Date();
    
    for (const data of bookingsData) {
      const reminder = this.scheduledReminders.get(data.booking.id);
      
      if (reminder && !reminder.sent && reminder.scheduledTime <= now) {
        try {
          await this.sendReminder(data);
        } catch (error) {
          console.error(`Failed to send reminder for booking ${data.booking.id}:`, error);
        }
      }
    }
  }

  /**
   * Get all scheduled reminders
   */
  getScheduledReminders(): ScheduledReminder[] {
    return Array.from(this.scheduledReminders.values());
  }

  /**
   * Get reminder for specific booking
   */
  getReminder(bookingId: string): ScheduledReminder | undefined {
    return this.scheduledReminders.get(bookingId);
  }

  /**
   * Calculate when a reminder should be sent
   */
  static calculateReminderTime(
    appointmentDate: Date,
    hoursBefore: number = 24
  ): Date {
    return new Date(appointmentDate.getTime() - (hoursBefore * 60 * 60 * 1000));
  }

  /**
   * Check if a reminder should be sent now
   */
  static shouldSendReminder(
    appointmentDate: Date,
    hoursBefore: number = 24,
    toleranceMinutes: number = 30
  ): boolean {
    const now = new Date();
    const reminderTime = ReminderScheduler.calculateReminderTime(appointmentDate, hoursBefore);
    const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
    const toleranceMs = toleranceMinutes * 60 * 1000;
    
    return timeDiff <= toleranceMs && now >= reminderTime;
  }
}

/**
 * Create a reminder scheduler instance
 */
export function createReminderScheduler(
  notificationManager: NotificationManager,
  preferences: NotificationPreferences
): ReminderScheduler {
  return new ReminderScheduler(notificationManager, preferences);
}
