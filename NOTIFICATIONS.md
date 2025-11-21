# Notification System Documentation

## Overview

The notification system provides automated email and SMS notifications for the hairstylist booking platform. It supports multiple notification types, configurable preferences, and automated appointment reminders.

## Features

- **Email Notifications** (EmailJS or SendGrid)
- **SMS Notifications** (Twilio)
- **Automated Appointment Reminders** (24 hours before by default)
- **Configurable Notification Preferences**
- **Multiple Notification Types**

## Notification Types

### Client Notifications

1. **Booking Confirmation**
   - Sent immediately after booking is created
   - Includes appointment details and next steps
   - Available via: Email + SMS

2. **Deposit Instructions**
   - Sent after booking confirmation
   - Contains Zelle payment information
   - Available via: Email only (too complex for SMS)

3. **Appointment Reminder**
   - Sent 24 hours before appointment (configurable)
   - Reminds client of upcoming appointment
   - Available via: Email + SMS

### Admin Notifications

1. **New Booking Alert**
   - Sent when a new booking is created
   - Includes client and booking details
   - Available via: Email + SMS

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

#### Option A: Using EmailJS

```env
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_TEMPLATE_BOOKING_CONFIRMATION=template_id
EMAILJS_TEMPLATE_DEPOSIT_INSTRUCTIONS=template_id
EMAILJS_TEMPLATE_APPOINTMENT_REMINDER=template_id
EMAILJS_TEMPLATE_NEW_BOOKING_ADMIN=template_id
```

**EmailJS Setup Steps:**
1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service (Gmail, Outlook, etc.)
3. Create templates for each notification type
4. Copy your Service ID and Public Key

#### Option B: Using SendGrid

```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=your_verified_sender@example.com
```

**SendGrid Setup Steps:**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify a sender email address
3. Create an API key with mail send permissions
4. Add your API key and sender email to `.env`

#### Twilio for SMS

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Twilio Setup Steps:**
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get a phone number
3. Copy your Account SID and Auth Token
4. Add credentials to `.env`

#### Admin Contact Information

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PHONE=+1234567890
```

## Usage

### Sending Notifications Programmatically

```typescript
import { createNotificationManager } from '@/lib/services/notificationManager';
import { NotificationData } from '@/lib/types/notifications';

// Create notification manager
const notificationManager = createNotificationManager();

// Prepare booking data
const data: NotificationData = {
  client: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1987654321',
  },
  service: {
    id: 'service-1',
    name: 'Haircut & Style',
    duration: 60,
    price: 50,
  },
  booking: {
    id: 'booking-123',
    clientId: 'client-1',
    serviceId: 'service-1',
    date: '2024-12-25',
    startTime: '10:00',
    endTime: '11:00',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  zelleInfo: {
    email: 'stylist@zelle.com',
    phone: '+1234567890',
    qrCodeUrl: 'https://example.com/zelle-qr.png',
  },
};

// Send booking confirmation
const results = await notificationManager.sendBookingConfirmation(data);

// Send deposit instructions
await notificationManager.sendDepositInstructions(data);

// Send appointment reminder
await notificationManager.sendAppointmentReminder(data);

// Send new booking alert to admin
await notificationManager.sendNewBookingAlert(data);
```

### Using API Endpoints

#### Send Notification

```bash
POST /api/notifications/send
Content-Type: application/json

{
  "type": "booking_confirmation",
  "data": {
    "client": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1987654321"
    },
    "service": {
      "id": "service-1",
      "name": "Haircut",
      "duration": 60,
      "price": 50
    },
    "booking": {
      "id": "booking-123",
      "clientId": "client-1",
      "serviceId": "service-1",
      "date": "2024-12-25",
      "startTime": "10:00",
      "endTime": "11:00",
      "status": "pending",
      "createdAt": "2024-12-20T10:00:00Z"
    }
  },
  "channel": "both"
}
```

#### Get Notification Preferences

```bash
GET /api/notifications/preferences
```

#### Update Notification Preferences

```bash
PUT /api/notifications/preferences
Content-Type: application/json

{
  "email": {
    "enabled": true,
    "bookingConfirmation": true,
    "depositInstructions": true,
    "appointmentReminder": true,
    "newBookingAlert": true
  },
  "sms": {
    "enabled": true,
    "bookingConfirmation": true,
    "appointmentReminder": true,
    "newBookingAlert": true
  },
  "reminderHoursBefore": 24,
  "adminEmail": "admin@example.com",
  "adminPhone": "+1234567890"
}
```

#### Schedule Reminder

```bash
POST /api/notifications/reminders/schedule
Content-Type: application/json

{
  "client": { ... },
  "service": { ... },
  "booking": { ... }
}
```

## Automated Reminders

### Setting Up Automated Reminders

```typescript
import { createNotificationManager } from '@/lib/services/notificationManager';
import { createReminderScheduler } from '@/lib/services/reminderScheduler';

const notificationManager = createNotificationManager();
const preferences = notificationManager.getPreferences();
const scheduler = createReminderScheduler(notificationManager, preferences);

// Schedule a reminder for a booking
const reminder = scheduler.scheduleReminder(data);

console.log(`Reminder scheduled for ${reminder.scheduledTime}`);
```

### Processing Pending Reminders

To process pending reminders in a cron job or scheduled task:

```typescript
// This should run periodically (e.g., every hour)
const bookings = await fetchUpcomingBookings(); // Your booking fetch logic

for (const booking of bookings) {
  const data = transformBookingToNotificationData(booking);
  await scheduler.processPendingReminders([data]);
}
```

### Production Reminder Scheduling

For production use, integrate with a job scheduler:

- **Node-cron**: For Node.js applications
- **Bull**: Redis-based job queue
- **AWS EventBridge**: For AWS deployments
- **Vercel Cron Jobs**: For Vercel deployments

Example with node-cron:

```typescript
import cron from 'node-cron';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Processing pending reminders...');
  const bookings = await fetchUpcomingBookings();
  await scheduler.processPendingReminders(bookings);
});
```

## Notification Templates

### Email Templates

Email templates are defined in `lib/templates/email/emailTemplates.ts`. Each template includes:

- HTML version (styled with inline CSS)
- Plain text version (for email clients that don't support HTML)
- Dynamic data interpolation

### SMS Templates

SMS templates are defined in `lib/templates/sms/smsTemplates.ts`. They are:

- Concise (160 characters or less recommended)
- Include essential information only
- Follow SMS best practices

### Customizing Templates

To customize templates, edit the template files:

```typescript
// lib/templates/email/emailTemplates.ts
function getBookingConfirmationTemplate(data: NotificationData): EmailTemplate {
  // Modify HTML, text, and subject here
  return { subject, html, text };
}
```

## Phone Number Format

SMS requires phone numbers in E.164 format:

- Start with `+`
- Include country code
- Include area code and number
- No spaces, dashes, or parentheses

Examples:
- ✅ `+14155552671` (US)
- ✅ `+442071838750` (UK)
- ❌ `(415) 555-2671`
- ❌ `415-555-2671`

## Testing

### Run Tests

```bash
npm test
```

### Test Individual Services

```bash
# Test notification manager
npm test -- notificationManager.test.ts

# Test reminder scheduler
npm test -- reminderScheduler.test.ts
```

### Manual Testing

Use the API endpoints with tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)

Example cURL command:

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "booking_confirmation",
    "data": {
      "client": {"name": "Test User", "email": "test@example.com", "phone": "+1234567890"},
      "service": {"id": "1", "name": "Haircut", "duration": 60, "price": 50},
      "booking": {
        "id": "test-1",
        "clientId": "c1",
        "serviceId": "s1",
        "date": "2024-12-25",
        "startTime": "10:00",
        "endTime": "11:00",
        "status": "pending",
        "createdAt": "2024-12-20T10:00:00Z"
      }
    }
  }'
```

## Integration with Booking System

### On New Booking

```typescript
// When a new booking is created
async function handleNewBooking(bookingData) {
  const notificationManager = createNotificationManager();
  
  // Send confirmation to client
  await notificationManager.sendBookingConfirmation(bookingData);
  
  // Send deposit instructions
  await notificationManager.sendDepositInstructions(bookingData);
  
  // Alert admin
  await notificationManager.sendNewBookingAlert(bookingData);
  
  // Schedule reminder
  const scheduler = createReminderScheduler(notificationManager, preferences);
  scheduler.scheduleReminder(bookingData);
}
```

### On Booking Approval

```typescript
// When admin approves a booking
async function handleBookingApproval(bookingData) {
  // Update booking status
  bookingData.booking.status = 'confirmed';
  
  // Send confirmation
  const notificationManager = createNotificationManager();
  await notificationManager.sendBookingConfirmation(bookingData);
}
```

## Error Handling

The notification system includes comprehensive error handling:

```typescript
const results = await notificationManager.sendNotification(type, data);

// Check results
results.forEach(result => {
  if (result.success) {
    console.log(`✓ ${result.channel} notification sent to ${result.recipient}`);
  } else {
    console.error(`✗ Failed to send ${result.channel}: ${result.error}`);
  }
});
```

## Best Practices

1. **Always validate phone numbers** before sending SMS
2. **Test with real data** before going live
3. **Monitor notification delivery** and handle failures
4. **Respect user preferences** - allow users to opt out
5. **Keep templates up to date** with current booking information
6. **Use environment variables** for sensitive data
7. **Log notification attempts** for debugging
8. **Handle rate limits** from service providers
9. **Provide fallback options** if one service fails
10. **Test reminder timing** to ensure proper scheduling

## Troubleshooting

### Email not sending

1. Check environment variables are set correctly
2. Verify API keys are valid
3. Check sender email is verified (SendGrid)
4. Review email template for errors
5. Check spam folder

### SMS not sending

1. Verify Twilio credentials
2. Check phone number format (E.164)
3. Verify Twilio phone number is active
4. Check account balance
5. Review SMS content for restricted words

### Reminders not being sent

1. Verify scheduler is running
2. Check reminder scheduling logic
3. Ensure booking dates are in the future
4. Verify notification preferences are enabled

## Support

For issues or questions:

1. Check this documentation
2. Review the code comments
3. Check the test files for examples
4. Review service provider documentation:
   - [EmailJS Docs](https://www.emailjs.com/docs/)
   - [SendGrid Docs](https://docs.sendgrid.com/)
   - [Twilio Docs](https://www.twilio.com/docs/)

## Future Enhancements

Potential improvements for the notification system:

- [ ] Support for additional email providers (Mailgun, AWS SES)
- [ ] WhatsApp notifications integration
- [ ] Push notifications for mobile app
- [ ] Email/SMS delivery tracking
- [ ] A/B testing for templates
- [ ] Multi-language support
- [ ] Rich media support in emails
- [ ] SMS delivery reports
- [ ] Notification analytics dashboard
- [ ] Template editor UI
