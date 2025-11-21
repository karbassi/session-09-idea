/**
 * API Route: Notification Preferences
 * GET/PUT /api/notifications/preferences
 * Manage notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotificationPreferences } from '@/lib/types/notifications';

// In a production app, this would be stored in a database
// For now, we'll use a simple in-memory store
let currentPreferences: NotificationPreferences = {
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
};

/**
 * GET - Retrieve current notification preferences
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      preferences: currentPreferences,
    });
  } catch (error) {
    console.error('Error retrieving preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updates = body as Partial<NotificationPreferences>;

    // Merge updates with current preferences
    currentPreferences = {
      ...currentPreferences,
      ...updates,
      email: {
        ...currentPreferences.email,
        ...(updates.email || {}),
      },
      sms: {
        ...currentPreferences.sms,
        ...(updates.sms || {}),
      },
    };

    // In production, save to database here
    // await db.updateNotificationPreferences(currentPreferences);

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: currentPreferences,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to update preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
