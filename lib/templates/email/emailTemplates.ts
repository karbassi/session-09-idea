/**
 * Email Templates
 * HTML and text templates for various notification types
 */

import { NotificationData, NotificationType, EmailTemplate } from '../../types/notifications';

/**
 * Get email template based on notification type
 */
export function getEmailTemplate(
  type: NotificationType,
  data: NotificationData
): EmailTemplate {
  switch (type) {
    case 'booking_confirmation':
      return getBookingConfirmationTemplate(data);
    case 'deposit_instructions':
      return getDepositInstructionsTemplate(data);
    case 'appointment_reminder':
      return getAppointmentReminderTemplate(data);
    case 'new_booking_admin':
      return getNewBookingAdminTemplate(data);
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

/**
 * Booking Confirmation Email (Client)
 */
function getBookingConfirmationTemplate(data: NotificationData): EmailTemplate {
  const { client, service, booking } = data;
  
  const subject = `Booking Confirmation - ${service.name}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .details { background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .status-badge { display: inline-block; padding: 5px 10px; background-color: #fef3c7; color: #92400e; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
          </div>
          <div class="content">
            <p>Dear ${client.name},</p>
            <p>Thank you for booking with us! Your appointment has been received and is pending confirmation.</p>
            
            <div class="details">
              <h2>Appointment Details</h2>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span>${service.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${booking.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span>${booking.startTime} - ${booking.endTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span>${service.duration} minutes</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span>$${service.price}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span>${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-badge">${booking.status.toUpperCase()}</span>
              </div>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Send your deposit via Zelle (instructions will follow in a separate email)</li>
              <li>Upload your payment receipt</li>
              <li>Wait for confirmation from your stylist</li>
            </ol>
            
            <p>You will receive an email once your booking is confirmed.</p>
          </div>
          <div class="footer">
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Booking Confirmation

Dear ${client.name},

Thank you for booking with us! Your appointment has been received and is pending confirmation.

Appointment Details:
- Service: ${service.name}
- Date: ${booking.date}
- Time: ${booking.startTime} - ${booking.endTime}
- Duration: ${service.duration} minutes
- Price: $${service.price}
- Booking ID: ${booking.id}
- Status: ${booking.status.toUpperCase()}

Next Steps:
1. Send your deposit via Zelle (instructions will follow in a separate email)
2. Upload your payment receipt
3. Wait for confirmation from your stylist

You will receive an email once your booking is confirmed.

If you have any questions, please don't hesitate to contact us.
  `;
  
  return { subject, html, text };
}

/**
 * Deposit Instructions Email (Client)
 */
function getDepositInstructionsTemplate(data: NotificationData): EmailTemplate {
  const { client, service, booking, zelleInfo } = data;
  
  const subject = `Deposit Instructions - Booking ${booking.id}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .highlight { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .zelle-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Deposit Instructions</h1>
          </div>
          <div class="content">
            <p>Dear ${client.name},</p>
            <p>To secure your appointment for <strong>${service.name}</strong> on <strong>${booking.date}</strong>, please send a deposit via Zelle.</p>
            
            <div class="zelle-info">
              <h2>Zelle Payment Information</h2>
              <p class="amount">Amount: $${service.price}</p>
              ${zelleInfo?.email ? `<p><strong>Zelle Email:</strong> ${zelleInfo.email}</p>` : ''}
              ${zelleInfo?.phone ? `<p><strong>Zelle Phone:</strong> ${zelleInfo.phone}</p>` : ''}
              ${zelleInfo?.qrCodeUrl ? `<img src="${zelleInfo.qrCodeUrl}" alt="Zelle QR Code" style="max-width: 200px; margin: 20px 0;" />` : ''}
            </div>
            
            <div class="highlight">
              <strong>Important:</strong> After sending the deposit, please upload a screenshot or receipt of your payment confirmation through your booking portal.
            </div>
            
            <p><strong>Steps to Complete:</strong></p>
            <ol>
              <li>Open your banking app and select Zelle</li>
              <li>Enter the Zelle information provided above</li>
              <li>Send the amount shown</li>
              <li>Take a screenshot of the confirmation</li>
              <li>Upload the screenshot to your booking page</li>
            </ol>
            
            <p>Once we receive and verify your deposit, your booking will be confirmed!</p>
          </div>
          <div class="footer">
            <p>Booking ID: ${booking.id}</p>
            <p>If you have any questions, please contact us.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Deposit Instructions

Dear ${client.name},

To secure your appointment for ${service.name} on ${booking.date}, please send a deposit via Zelle.

Zelle Payment Information:
- Amount: $${service.price}
${zelleInfo?.email ? `- Zelle Email: ${zelleInfo.email}` : ''}
${zelleInfo?.phone ? `- Zelle Phone: ${zelleInfo.phone}` : ''}

IMPORTANT: After sending the deposit, please upload a screenshot or receipt of your payment confirmation through your booking portal.

Steps to Complete:
1. Open your banking app and select Zelle
2. Enter the Zelle information provided above
3. Send the amount shown
4. Take a screenshot of the confirmation
5. Upload the screenshot to your booking page

Once we receive and verify your deposit, your booking will be confirmed!

Booking ID: ${booking.id}
  `;
  
  return { subject, html, text };
}

/**
 * Appointment Reminder Email (Client)
 */
function getAppointmentReminderTemplate(data: NotificationData): EmailTemplate {
  const { client, service, booking } = data;
  
  const subject = `Reminder: Your Appointment Tomorrow - ${service.name}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .reminder-box { background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .details { background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${client.name},</p>
            
            <div class="reminder-box">
              <h2 style="margin-top: 0;">This is a reminder about your upcoming appointment!</h2>
              <p style="font-size: 18px; margin: 0;"><strong>Tomorrow at ${booking.startTime}</strong></p>
            </div>
            
            <div class="details">
              <h3>Appointment Details</h3>
              <p><strong>Service:</strong> ${service.name}</p>
              <p><strong>Date:</strong> ${booking.date}</p>
              <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
              <p><strong>Duration:</strong> ${service.duration} minutes</p>
            </div>
            
            <p><strong>Please remember:</strong></p>
            <ul>
              <li>Have your space ready for the service</li>
              <li>Ensure the address is accessible</li>
              <li>Be available at the scheduled time</li>
            </ul>
            
            <p>Looking forward to seeing you tomorrow!</p>
          </div>
          <div class="footer">
            <p>Booking ID: ${booking.id}</p>
            <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Appointment Reminder

Dear ${client.name},

This is a reminder about your upcoming appointment!

Tomorrow at ${booking.startTime}

Appointment Details:
- Service: ${service.name}
- Date: ${booking.date}
- Time: ${booking.startTime} - ${booking.endTime}
- Duration: ${service.duration} minutes

Please remember:
- Have your space ready for the service
- Ensure the address is accessible
- Be available at the scheduled time

Looking forward to seeing you tomorrow!

Booking ID: ${booking.id}

If you need to reschedule or cancel, please contact us as soon as possible.
  `;
  
  return { subject, html, text };
}

/**
 * New Booking Alert Email (Admin)
 */
function getNewBookingAdminTemplate(data: NotificationData): EmailTemplate {
  const { client, service, booking } = data;
  
  const subject = `New Booking Alert - ${service.name} on ${booking.date}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .alert-box { background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .details { background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .action-button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Booking Received!</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2 style="margin-top: 0;">You have a new booking request!</h2>
              <p>A client has just booked a service and is waiting for your approval.</p>
            </div>
            
            <div class="details">
              <h3>Booking Information</h3>
              <div class="detail-row">
                <strong>Booking ID:</strong> ${booking.id}
              </div>
              <div class="detail-row">
                <strong>Service:</strong> ${service.name}
              </div>
              <div class="detail-row">
                <strong>Date:</strong> ${booking.date}
              </div>
              <div class="detail-row">
                <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}
              </div>
              <div class="detail-row">
                <strong>Duration:</strong> ${service.duration} minutes
              </div>
              <div class="detail-row">
                <strong>Price:</strong> $${service.price}
              </div>
            </div>
            
            <div class="details">
              <h3>Client Information</h3>
              <div class="detail-row">
                <strong>Name:</strong> ${client.name}
              </div>
              <div class="detail-row">
                <strong>Email:</strong> ${client.email}
              </div>
              <div class="detail-row">
                <strong>Phone:</strong> ${client.phone}
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/bookings/${booking.id}" class="action-button">View Booking Details</a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/bookings" class="action-button">Go to Dashboard</a>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Review the booking details</li>
              <li>Check if the deposit receipt has been uploaded</li>
              <li>Approve or request more information</li>
              <li>Client will be notified once you take action</li>
            </ol>
          </div>
          <div class="footer">
            <p>This is an automated notification from your booking system.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
🎉 New Booking Received!

You have a new booking request!

Booking Information:
- Booking ID: ${booking.id}
- Service: ${service.name}
- Date: ${booking.date}
- Time: ${booking.startTime} - ${booking.endTime}
- Duration: ${service.duration} minutes
- Price: $${service.price}

Client Information:
- Name: ${client.name}
- Email: ${client.email}
- Phone: ${client.phone}

Next Steps:
1. Review the booking details
2. Check if the deposit receipt has been uploaded
3. Approve or request more information
4. Client will be notified once you take action

View booking: ${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/bookings/${booking.id}
Go to dashboard: ${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/bookings
  `;
  
  return { subject, html, text };
}
