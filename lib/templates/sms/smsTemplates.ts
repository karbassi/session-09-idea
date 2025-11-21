/**
 * SMS Templates
 * Text message templates for various notification types
 */

import { NotificationData, NotificationType, SMSTemplate } from '../../types/notifications';

/**
 * Get SMS template based on notification type
 */
export function getSMSTemplate(
  type: NotificationType,
  data: NotificationData
): SMSTemplate {
  switch (type) {
    case 'booking_confirmation':
      return getBookingConfirmationSMS(data);
    case 'appointment_reminder':
      return getAppointmentReminderSMS(data);
    case 'new_booking_admin':
      return getNewBookingAdminSMS(data);
    case 'deposit_instructions':
      // SMS not typically used for deposit instructions (too complex)
      // Return a simple message pointing to email
      return {
        body: `Hi ${data.client.name}! Check your email for deposit instructions for your ${data.service.name} appointment on ${data.booking.date}. Booking ID: ${data.booking.id}`
      };
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

/**
 * Booking Confirmation SMS (Client)
 */
function getBookingConfirmationSMS(data: NotificationData): SMSTemplate {
  const { client, service, booking } = data;
  
  const body = `Hi ${client.name}! Your booking for ${service.name} on ${booking.date} at ${booking.startTime} has been received. We'll confirm once we receive your deposit. Booking ID: ${booking.id}`;
  
  return { body };
}

/**
 * Appointment Reminder SMS (Client)
 */
function getAppointmentReminderSMS(data: NotificationData): SMSTemplate {
  const { client, service, booking } = data;
  
  const body = `Reminder: Hi ${client.name}! Your ${service.name} appointment is tomorrow at ${booking.startTime}. Looking forward to seeing you! Reply STOP to opt out.`;
  
  return { body };
}

/**
 * New Booking Alert SMS (Admin)
 */
function getNewBookingAdminSMS(data: NotificationData): SMSTemplate {
  const { client, service, booking } = data;
  
  const body = `New booking! ${client.name} booked ${service.name} on ${booking.date} at ${booking.startTime}. Booking ID: ${booking.id}. Check your dashboard for details.`;
  
  return { body };
}
