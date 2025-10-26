import type { BookingWithDetails } from "@shared/schema";
import { format } from "date-fns";

async function getTransporter() {
  const nodemailer = await import("nodemailer");
  return nodemailer.default.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendBookingConfirmation(booking: BookingWithDetails) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials not configured. Skipping email notification.");
    return;
  }

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🚂 Booking Confirmed!</h1>
        <p style="margin: 10px 0 0; font-size: 16px;">Panem Express Rail Booking</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #e5e7eb;">
          <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 20px;">Your PNR</h2>
          <div style="background: #eff6ff; padding: 15px; border-radius: 6px; text-align: center;">
            <div style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 2px;">
              ${booking.pnr}
            </div>
          </div>
          <p style="color: #6b7280; margin: 10px 0 0; font-size: 14px; text-align: center;">
            Save this PNR for future reference
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 18px;">Journey Details</h2>
          
          <div style="margin-bottom: 15px;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">ROUTE</div>
            <div style="font-size: 16px; font-weight: 600; color: #1f2937;">
              ${booking.route.fromStation} → ${booking.route.toStation}
            </div>
            <div style="color: #6b7280; font-size: 14px;">${booking.route.distanceKm} km</div>
          </div>

          <div style="margin-bottom: 15px;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">TRAVEL DATE</div>
            <div style="font-size: 16px; font-weight: 600; color: #1f2937;">
              ${format(new Date(booking.travelDate), "EEEE, MMMM d, yyyy")}
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">COACH & SEAT</div>
            <div style="font-size: 16px; font-weight: 600; color: #1f2937;">
              Coach ${booking.coach} - Row ${booking.row}, Seat ${String.fromCharCode(64 + booking.column)}${booking.row}
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">PASSENGER</div>
            <div style="font-size: 16px; font-weight: 600; color: #1f2937;">
              ${booking.passengerName} (Age: ${booking.passengerAge})
            </div>
          </div>

          <div style="padding-top: 15px; border-top: 2px solid #e5e7eb; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="color: #6b7280; font-size: 14px;">TOTAL FARE</div>
              <div style="font-size: 24px; font-weight: bold; color: #2563eb;">₹${parseFloat(booking.fare).toFixed(2)}</div>
            </div>
            <div style="text-align: right; margin-top: 5px;">
              <span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                Pay at Station
              </span>
            </div>
          </div>
        </div>

        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 16px;">📋 Important Instructions</h3>
          <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 14px; line-height: 1.8;">
            <li>Present this PNR at the station counter for payment before boarding</li>
            <li>Arrive at the station at least 30 minutes before departure</li>
            <li>Carry a valid government-issued ID for verification</li>
            <li>You can cancel this booking from your dashboard before the travel date</li>
          </ul>
        </div>

        <div style="text-align: center; color: #6b7280; font-size: 12px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>Thank you for choosing Panem Express!</p>
          <p style="margin: 5px 0;">For support, please contact us through your account dashboard.</p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Panem Express" <${process.env.GMAIL_USER}>`,
    to: booking.user.email,
    subject: `Booking Confirmed - PNR: ${booking.pnr}`,
    html: emailContent,
  };

  try {
    const transporter = await getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${booking.user.email}`);
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
  }
}

export async function sendCancellationEmail(booking: BookingWithDetails) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials not configured. Skipping email notification.");
    return;
  }

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Booking Cancelled</h1>
        <p style="margin: 10px 0 0; font-size: 16px;">Panem Express Rail Booking</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
            Your booking with PNR <strong style="color: #dc2626; font-family: 'Courier New', monospace;">${booking.pnr}</strong> has been successfully cancelled.
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 18px;">Cancelled Journey Details</h2>
          
          <div style="margin-bottom: 12px;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">ROUTE</div>
            <div style="font-size: 16px; color: #1f2937;">
              ${booking.route.fromStation} → ${booking.route.toStation}
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">TRAVEL DATE</div>
            <div style="font-size: 16px; color: #1f2937;">
              ${format(new Date(booking.travelDate), "MMMM d, yyyy")}
            </div>
          </div>

          <div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">PASSENGER</div>
            <div style="font-size: 16px; color: #1f2937;">
              ${booking.passengerName}
            </div>
          </div>
        </div>

        <div style="background: #eff6ff; border: 1px solid #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
            Your seat has been released and is now available for other passengers. You can book a new ticket anytime from your dashboard.
          </p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">Thank you for using Panem Express</p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Panem Express" <${process.env.GMAIL_USER}>`,
    to: booking.user.email,
    subject: `Booking Cancelled - PNR: ${booking.pnr}`,
    html: emailContent,
  };

  try {
    const transporter = await getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Cancellation email sent to ${booking.user.email}`);
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
  }
}
