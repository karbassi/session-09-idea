/**
 * Notification Types and Interfaces
 * Defines the structure for email and SMS notifications in the booking system
 */

export type NotificationType = 
  | 'booking_confirmation'
  | 'deposit_instructions'
  | 'appointment_reminder'
  | 'new_booking_admin';

export type NotificationChannel = 'email' | 'sms' | 'both';

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ServiceInfo {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface BookingInfo {
  id: string;
  clientId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  depositReceiptUrl?: string;
  createdAt: string;
}

export interface NotificationData {
  client: ClientInfo;
  service: ServiceInfo;
  booking: BookingInfo;
  zelleInfo?: {
    email?: string;
    phone?: string;
    qrCodeUrl?: string;
  };
  baseUrl?: string; // Application base URL for links in notifications
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface SMSTemplate {
  body: string;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    bookingConfirmation: boolean;
    depositInstructions: boolean;
    appointmentReminder: boolean;
    newBookingAlert: boolean;
  };
  sms: {
    enabled: boolean;
    bookingConfirmation: boolean;
    appointmentReminder: boolean;
    newBookingAlert: boolean;
  };
  reminderHoursBefore: number; // Default 24 hours
  adminEmail?: string;
  adminPhone?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  type: NotificationType;
  recipient: string;
  error?: string;
  messageId?: string;
}

export interface EmailServiceConfig {
  provider: 'emailjs' | 'sendgrid';
  emailjs?: {
    serviceId: string;
    publicKey: string;
    templates: Record<NotificationType, string>;
  };
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
  };
}

export interface SMSServiceConfig {
  provider: 'twilio';
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
}
