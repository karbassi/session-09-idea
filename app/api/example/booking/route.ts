/**
 * Example API Route: Create Booking with Notifications
 * This demonstrates how to integrate the notification system with your booking workflow
 * 
 * POST /api/example/booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createNotificationManager } from '@/lib/services/notificationManager';
import { createReminderScheduler } from '@/lib/services/reminderScheduler';
import { NotificationData } from '@/lib/types/notifications';

interface CreateBookingRequest {
  client: {
    name: string;
    email: string;
    phone: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  date: string;
  startTime: string;
  endTime: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();

    // Validate required fields
    if (!body.client || !body.service || !body.date || !body.startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Save the booking to your database
    // 2. Get the generated booking ID
    // For this example, we'll generate a mock booking ID
    const bookingId = `booking-${Date.now()}`;

    // Prepare notification data
    const notificationData: NotificationData = {
      client: body.client,
      service: body.service,
      booking: {
        id: bookingId,
        clientId: `client-${Date.now()}`,
        serviceId: body.service.id,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      zelleInfo: {
        email: process.env.ZELLE_EMAIL,
        phone: process.env.ZELLE_PHONE,
        qrCodeUrl: process.env.ZELLE_QR_URL,
      },
    };

    // Initialize notification manager
    const notificationManager = createNotificationManager();

    // Send notifications (non-blocking, catch errors individually)
    const notificationResults = {
      confirmation: null as any,
      deposit: null as any,
      adminAlert: null as any,
      reminder: null as any,
    };

    try {
      // 1. Send booking confirmation to client
      const confirmationResults = await notificationManager.sendBookingConfirmation(
        notificationData
      );
      notificationResults.confirmation = confirmationResults;
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
      notificationResults.confirmation = { error: 'Failed to send' };
    }

    try {
      // 2. Send deposit instructions to client
      const depositResults = await notificationManager.sendDepositInstructions(
        notificationData
      );
      notificationResults.deposit = depositResults;
    } catch (error) {
      console.error('Failed to send deposit instructions:', error);
      notificationResults.deposit = { error: 'Failed to send' };
    }

    try {
      // 3. Alert admin about new booking
      const adminResults = await notificationManager.sendNewBookingAlert(
        notificationData
      );
      notificationResults.adminAlert = adminResults;
    } catch (error) {
      console.error('Failed to send admin alert:', error);
      notificationResults.adminAlert = { error: 'Failed to send' };
    }

    try {
      // 4. Schedule reminder (24 hours before appointment)
      const preferences = notificationManager.getPreferences();
      const scheduler = createReminderScheduler(notificationManager, preferences);
      const reminder = scheduler.scheduleReminder(notificationData);
      notificationResults.reminder = {
        scheduled: true,
        scheduledTime: reminder.scheduledTime.toISOString(),
      };
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      notificationResults.reminder = { error: 'Failed to schedule' };
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: bookingId,
        ...body,
        status: 'pending',
      },
      notifications: notificationResults,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      {
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
