# Integration Guide: Phase 3 Notifications

This guide explains how to integrate the notification system with your booking workflow (Phase 2).

## Overview

The notification system is designed to be integrated at key points in your booking workflow:

1. **When a booking is created** → Send booking confirmation
2. **After booking creation** → Send deposit instructions
3. **When a booking is created** → Alert admin
4. **24 hours before appointment** → Send reminder

## Quick Start

### 1. Import Required Services

```typescript
import { createNotificationManager } from '@/lib/services/notificationManager';
import { createReminderScheduler } from '@/lib/services/reminderScheduler';
import { NotificationData } from '@/lib/types/notifications';
```

### 2. Transform Booking Data

Convert your booking database records to the `NotificationData` format:

```typescript
function transformBookingToNotificationData(booking: YourBookingType): NotificationData {
  return {
    client: {
      name: booking.client.name,
      email: booking.client.email,
      phone: booking.client.phone,
    },
    service: {
      id: booking.service.id,
      name: booking.service.name,
      duration: booking.service.duration,
      price: booking.service.price,
    },
    booking: {
      id: booking.id,
      clientId: booking.clientId,
      serviceId: booking.serviceId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      depositReceiptUrl: booking.depositReceiptUrl,
      createdAt: booking.createdAt,
    },
    zelleInfo: {
      email: process.env.ZELLE_EMAIL || 'stylist@example.com',
      phone: process.env.ZELLE_PHONE || '+1234567890',
      qrCodeUrl: process.env.ZELLE_QR_URL,
    },
  };
}
```

## Integration Points

### When Creating a New Booking

```typescript
// In your booking creation handler
async function createBooking(bookingData: CreateBookingRequest) {
  // 1. Save booking to database
  const booking = await db.bookings.create(bookingData);
  
  // 2. Transform to notification format
  const notificationData = transformBookingToNotificationData(booking);
  
  // 3. Send notifications
  const notificationManager = createNotificationManager();
  
  // Send booking confirmation to client
  await notificationManager.sendBookingConfirmation(notificationData);
  
  // Send deposit instructions to client
  await notificationManager.sendDepositInstructions(notificationData);
  
  // Alert admin about new booking
  await notificationManager.sendNewBookingAlert(notificationData);
  
  // 4. Schedule reminder
  const preferences = notificationManager.getPreferences();
  const scheduler = createReminderScheduler(notificationManager, preferences);
  scheduler.scheduleReminder(notificationData);
  
  return booking;
}
```

### When Approving a Booking

```typescript
async function approveBooking(bookingId: string) {
  // 1. Update booking status
  const booking = await db.bookings.update(bookingId, {
    status: 'confirmed',
  });
  
  // 2. Send confirmation
  const notificationData = transformBookingToNotificationData(booking);
  const notificationManager = createNotificationManager();
  
  await notificationManager.sendBookingConfirmation(notificationData);
  
  return booking;
}
```

### When Cancelling a Booking

```typescript
async function cancelBooking(bookingId: string) {
  // 1. Update booking status
  const booking = await db.bookings.update(bookingId, {
    status: 'cancelled',
  });
  
  // 2. Cancel reminder
  const notificationManager = createNotificationManager();
  const preferences = notificationManager.getPreferences();
  const scheduler = createReminderScheduler(notificationManager, preferences);
  scheduler.cancelReminder(bookingId);
  
  // Optional: Send cancellation notification
  // (You may want to create a new template for this)
  
  return booking;
}
```

## Setting Up Automated Reminders

You need to set up a scheduled job to process pending reminders. Here are options for different platforms:

### Option 1: Vercel Cron Jobs

Create `app/api/cron/reminders/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createNotificationManager } from '@/lib/services/notificationManager';
import { createReminderScheduler } from '@/lib/services/reminderScheduler';

export async function GET(request: NextRequest) {
  // Verify this is a cron request (Vercel adds auth header)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch upcoming bookings (within next 48 hours)
    const bookings = await fetchUpcomingBookings();
    
    // Process reminders
    const notificationManager = createNotificationManager();
    const preferences = notificationManager.getPreferences();
    const scheduler = createReminderScheduler(notificationManager, preferences);
    
    for (const booking of bookings) {
      const notificationData = transformBookingToNotificationData(booking);
      
      // Check if reminder should be sent
      const appointmentDate = new Date(`${booking.date}T${booking.startTime}`);
      if (scheduler.shouldSendReminder(appointmentDate, preferences.reminderHoursBefore)) {
        await scheduler.sendReminder(notificationData);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing reminders:', error);
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
  }
}
```

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 * * * *"
  }]
}
```

### Option 2: Node-cron (for self-hosted)

```typescript
import cron from 'node-cron';
import { createNotificationManager } from '@/lib/services/notificationManager';
import { createReminderScheduler } from '@/lib/services/reminderScheduler';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Processing reminders...');
  
  const bookings = await fetchUpcomingBookings();
  const notificationManager = createNotificationManager();
  const preferences = notificationManager.getPreferences();
  const scheduler = createReminderScheduler(notificationManager, preferences);
  
  for (const booking of bookings) {
    const notificationData = transformBookingToNotificationData(booking);
    const appointmentDate = new Date(`${booking.date}T${booking.startTime}`);
    
    if (scheduler.shouldSendReminder(appointmentDate, preferences.reminderHoursBefore)) {
      try {
        await scheduler.sendReminder(notificationData);
        console.log(`✓ Reminder sent for booking ${booking.id}`);
      } catch (error) {
        console.error(`✗ Failed to send reminder for booking ${booking.id}:`, error);
      }
    }
  }
});
```

## API Integration

If you prefer to trigger notifications via API calls:

### Send Notification

```bash
POST /api/notifications/send
Content-Type: application/json

{
  "type": "booking_confirmation",
  "data": {
    "client": {...},
    "service": {...},
    "booking": {...}
  }
}
```

### Schedule Reminder

```bash
POST /api/notifications/reminders/schedule
Content-Type: application/json

{
  "client": {...},
  "service": {...},
  "booking": {...}
}
```

### Update Preferences

```bash
PUT /api/notifications/preferences
Content-Type: application/json

{
  "email": {
    "enabled": true,
    "bookingConfirmation": true
  },
  "sms": {
    "enabled": true,
    "bookingConfirmation": true
  }
}
```

## Error Handling

Always handle notification errors gracefully:

```typescript
try {
  const results = await notificationManager.sendBookingConfirmation(data);
  
  // Log results
  results.forEach(result => {
    if (result.success) {
      console.log(`✓ ${result.channel} sent to ${result.recipient}`);
    } else {
      console.error(`✗ ${result.channel} failed:`, result.error);
      // Optionally: Store failure for retry or manual follow-up
    }
  });
} catch (error) {
  console.error('Critical notification error:', error);
  // Booking should still succeed even if notifications fail
}
```

## Admin UI Integration

### Display Notification Status

```typescript
// Show notification status in booking details
interface BookingWithNotifications {
  booking: Booking;
  notifications: {
    confirmationSent: boolean;
    depositInstructionsSent: boolean;
    reminderScheduled: boolean;
    reminderSent: boolean;
  };
}
```

### Allow Resending Notifications

```typescript
// In admin panel
async function resendNotification(bookingId: string, type: NotificationType) {
  const booking = await db.bookings.findById(bookingId);
  const notificationData = transformBookingToNotificationData(booking);
  const notificationManager = createNotificationManager();
  
  await notificationManager.sendNotification(type, notificationData);
}
```

### Notification Preferences UI

Allow admin to configure preferences through a settings page:

```typescript
// In settings page component
const [preferences, setPreferences] = useState<NotificationPreferences>();

// Load preferences
useEffect(() => {
  fetch('/api/notifications/preferences')
    .then(res => res.json())
    .then(data => setPreferences(data.preferences));
}, []);

// Update preferences
const handleSave = async () => {
  await fetch('/api/notifications/preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
};
```

## Testing Integration

### Test in Development

```typescript
// Create test booking
const testBooking = {
  client: {
    name: 'Test Client',
    email: 'your-email@example.com', // Use your real email
    phone: '+1234567890',
  },
  service: {
    id: 'test-service',
    name: 'Test Haircut',
    duration: 60,
    price: 50,
  },
  booking: {
    id: 'test-booking',
    clientId: 'test-client',
    serviceId: 'test-service',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
};

// Test notifications
const manager = createNotificationManager();
await manager.sendBookingConfirmation(testBooking);
```

## Environment Variables Checklist

Ensure these are set in your production environment:

- [ ] `SENDGRID_API_KEY` or `EMAILJS_SERVICE_ID` + templates
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_PHONE_NUMBER`
- [ ] `ADMIN_EMAIL`
- [ ] `ADMIN_PHONE`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `CRON_SECRET` (for Vercel cron)

## Monitoring

Track notification delivery:

```typescript
// Log all notifications
const results = await notificationManager.sendNotification(type, data);

// Store in database for tracking
await db.notificationLogs.create({
  bookingId: data.booking.id,
  type,
  channel: result.channel,
  success: result.success,
  error: result.error,
  timestamp: new Date(),
});
```

## Troubleshooting

### Notifications not sending

1. Check environment variables
2. Verify API credentials
3. Check phone number format (E.164)
4. Review service provider dashboards
5. Check notification preferences

### Reminders not triggering

1. Verify cron job is running
2. Check booking dates are in future
3. Verify reminder preferences enabled
4. Check scheduler initialization

### Email/SMS not received

1. Check spam folders
2. Verify recipient addresses
3. Review service provider logs
4. Check account balance (Twilio)
5. Verify sender email (SendGrid)

## Next Steps

1. Test notification flow with test bookings
2. Configure production credentials
3. Set up cron job for reminders
4. Monitor notification delivery
5. Gather user feedback
6. Adjust templates as needed

For more details, see [NOTIFICATIONS.md](./NOTIFICATIONS.md).
