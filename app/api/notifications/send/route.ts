/**
 * API Route: Send Notification
 * POST /api/notifications/send
 * Sends a notification based on type and data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createNotificationManager } from '@/lib/services/notificationManager';
import { NotificationData, NotificationType } from '@/lib/types/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, channel } = body as {
      type: NotificationType;
      data: NotificationData;
      channel?: 'email' | 'sms' | 'both';
    };

    // Validate required fields
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type and data' },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes: NotificationType[] = [
      'booking_confirmation',
      'deposit_instructions',
      'appointment_reminder',
      'new_booking_admin',
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create notification manager and send notification
    const notificationManager = createNotificationManager();
    const results = await notificationManager.sendNotification(type, data, channel);

    // Check if any notification failed
    const failures = results.filter(r => !r.success);
    const successes = results.filter(r => r.success);

    if (failures.length > 0 && successes.length === 0) {
      return NextResponse.json(
        {
          error: 'All notifications failed',
          results,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${successes.length} notification(s)`,
      results,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
