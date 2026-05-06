import { Resend } from "resend";
import { logger } from "./logger";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@pngwebsitebuilders.site";
const APP_NAME = "PNG Website Builders";

export async function sendWelcomeEmail(to: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set, skipping welcome email");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Welcome to ${APP_NAME}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Welcome to ${APP_NAME}! 🎉</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Your account is ready. You have <strong>5 free website generations</strong> to get started.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Simply describe the website you want and our AI will build it for you in seconds.
          </p>
          <a href="https://pngwebsitebuilders.site" style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: #6d28d9; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Start Building
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 40px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    logger.info({ to }, "Welcome email sent");
  } catch (err) {
    logger.error({ err, to }, "Failed to send welcome email");
  }
}

export async function sendPaymentConfirmationEmail(
  to: string,
  credits: number,
  amountUsd: number,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set, skipping payment confirmation email");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Payment confirmed — ${credits} credits added`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Payment Confirmed ✅</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thank you for your purchase! Here's your receipt:
          </p>
          <div style="background: #f9f9f9; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #555; padding: 6px 0;">Credits purchased</td>
                <td style="color: #1a1a1a; font-weight: 600; text-align: right;">${credits}</td>
              </tr>
              <tr>
                <td style="color: #555; padding: 6px 0;">Amount charged</td>
                <td style="color: #1a1a1a; font-weight: 600; text-align: right;">$${amountUsd.toFixed(2)} USD</td>
              </tr>
            </table>
          </div>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Your credits are available now. Go build something great!
          </p>
          <a href="https://pngwebsitebuilders.site/dashboard/create" style="display: inline-block; margin-top: 16px; padding: 14px 28px; background: #6d28d9; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Generate a Website
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 40px;">
            ${APP_NAME} · support@pngwebsitebuilders.site
          </p>
        </div>
      `,
    });
    logger.info({ to, credits, amountUsd }, "Payment confirmation email sent");
  } catch (err) {
    logger.error({ err, to }, "Failed to send payment confirmation email");
  }
}
