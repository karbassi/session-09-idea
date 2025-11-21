/**
 * API Route: Schedule Reminder
 * POST /api/notifications/reminders/schedule
 * Schedule an appointment reminder
 */

import { NextRequest, NextResponse } from 'next/server';
import { createNotificationManager } from '@/lib/services/notificationManager';
import { createReminderScheduler } from '@/lib/services/reminderScheduler';
import { NotificationData } from '@/lib/types/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body as NotificationData;

    // Validate required fields
    if (!data || !data.booking || !data.booking.date || !data.booking.startTime) {
      return NextResponse.json(
        { error: 'Missing required booking data' },
        { status: 400 }
      );
    }

    // Create scheduler and schedule reminder
    const notificationManager = createNotificationManager();
    const preferences = notificationManager.getPreferences();
    const scheduler = createReminderScheduler(notificationManager, preferences);
    
    const reminder = scheduler.scheduleReminder(data);

    return NextResponse.json({
      success: true,
      message: 'Reminder scheduled successfully',
      reminder: {
        bookingId: reminder.bookingId,
        scheduledTime: reminder.scheduledTime.toISOString(),
        sent: reminder.sent,
      },
    });
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return NextResponse.json(
      {
        error: 'Failed to schedule reminder',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
