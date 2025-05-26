// ============================
// File: utils/sendEmail.js
// ============================
import nodemailer from "nodemailer";

/**
 * @desc Sends an email with an OTP code.
 * @param {string} recipient - The email address of the recipient.
 * @param {string} otp - The One-Time Password to send.
 * @returns {Promise<void>}
 */
async function sendEmail(recipient, otp) {
  if (!recipient || typeof recipient !== "string") {
    throw new Error("Recipient email is required and must be a valid string.");
  }

  // Check if environment variables are loaded before creating transporter
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error("❌ Environment variables for email are not set!");
    throw new Error("Email service credentials are missing.");
  }

  // Configure Nodemailer transporter within the function call
  // This ensures process.env variables are loaded when the function executes
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // SSL Port
    secure: true, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Must be Gmail App Password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email address
    to: recipient,
    subject: "Verification Code", // Subject for both registration and password reset
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f4f4f4; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="text-align: center; padding: 20px; background-color: #4a90e2; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">Verification Code</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Here is your One-Time Password (OTP):</p>
        <div style="margin: 30px 0; text-align: center;">
          <span style="display: inline-block; font-size: 28px; font-weight: bold; background: #e0f7fa; color: #00796b; padding: 15px 30px; border-radius: 8px; letter-spacing: 3px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #888;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone for security reasons.</p>
        <p style="font-size: 14px; color: #888;">If you did not request this, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} . All rights reserved.</p>
      </div>
    </div>
  `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${recipient}: ${info.response}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${recipient}:`, error);
    throw error; // Re-throw the error so the calling function can catch it
  }
}

export { sendEmail };
