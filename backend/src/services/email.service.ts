import nodemailer from 'nodemailer';
import { FRONTEND_URL } from "../constants/index.js";

// Configure the Brevo Transporter
export const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

const defaultFrom = process.env.BREVO_FROM_EMAIL || '"MailEnclave" <no-reply@mailenclave.com>';

/**
 * Send Registration Welcome Email
 */
export const sendRegistrationEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Welcome to MailEnclave!',
    html: `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Welcome to MailEnclave</h1>
            <p style="color: #e0e7ff; font-size: 16px; margin: 12px 0 0 0; font-weight: 500;">Your secure environment for email testing.</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">Thank you for joining MailEnclave. Your account is now active. To ensure your privacy, <strong style="color: #0f172a;">all incoming emails are automatically encrypted</strong> before being stored in our database.</p>
            
            <!-- Callout Box -->
            <div style="background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 24px; border-radius: 0 8px 8px 0; margin-bottom: 32px;">
              <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 16px 0; font-weight: 700;">Next steps to get started:</h2>
              <ul style="padding-left: 20px; margin: 0; color: #334155; font-size: 15px; line-height: 1.6;">
                <li style="margin-bottom: 12px;"><strong style="color: #0f172a;">Link a Namespace:</strong> Connect your Testmail.app namespace to start receiving emails.</li>
                <li style="margin-bottom: 12px;"><strong style="color: #0f172a;">Set a Vault PIN:</strong> Create a key to unlock and access your private vault tag mails.</li>
                <li style="margin-bottom: 0;"><strong style="color: #0f172a;">Explore the GUI:</strong> Use our dashboard to manage tags and read emails in real-time.</li>
              </ul>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 32px 0;">To understand more about what MailEnclave is (and what it isn't), feel free to read our <a href="${FRONTEND_URL}/about" style="color: #4f46e5; text-decoration: none; font-weight: 600; border-bottom: 1px solid #4f46e5;">About Us</a> page.</p>
            
            <!-- Footer Text -->
            <p style="font-size: 15px; color: #64748b; margin: 0 0 4px 0;">Best Regards,</p>
            <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">The MailEnclave Team</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="font-size: 13px; color: #94a3b8; margin: 0;">This is an automated message. Please do not reply.</p>
          </div>

        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Password Reset</h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px; text-align: center;">
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">We received a request to reset your password. Click the button below to set a new password. This link will expire shortly.</p>
            
            <div style="margin: 32px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">Reset Password</a>
            </div>

            <p style="font-size: 14px; color: #64748b; margin: 0;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send OTP Email
 */
export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Your One-Time Password (OTP)',
    html: `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Verification Code</h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px; text-align: center;">
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">Please use the following One-Time Password (OTP) to complete your registration. This code is valid for 10 minutes.</p>
            
            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 12px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
              <h2 style="font-size: 36px; letter-spacing: 8px; color: #0f172a; margin: 0; font-weight: 800;">${otp}</h2>
            </div>

            <p style="font-size: 14px; color: #64748b; margin: 0;">Do not share this code with anyone. If you didn't request this, you can safely ignore this email.</p>
          </div>
          
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Password Reset OTP Email
 */
export const sendPasswordResetOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Password Reset OTP',
    html: `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Password Reset</h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px; text-align: center;">
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">We received a request to reset your password. Please use the following One-Time Password (OTP) to complete the reset. This code is valid for 10 minutes.</p>
            
            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 12px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
              <h2 style="font-size: 36px; letter-spacing: 8px; color: #0f172a; margin: 0; font-weight: 800;">${otp}</h2>
            </div>

            <p style="font-size: 14px; color: #64748b; margin: 0;">Do not share this code with anyone. If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Vault PIN Change Email
 */
export const sendVaultPinChangeEmail = async (to: string) => {
  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Security Alert: Vault PIN Changed',
    html: `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Security Alert</h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">This is a notification that the <strong>Vault PIN</strong> for your MailEnclave account has recently been changed.</p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #e11d48; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 32px;">
              <p style="color: #9f1239; font-size: 15px; margin: 0;"><strong>Didn't make this change?</strong><br>If you did not authorize this action, please secure your account immediately by changing your account password.</p>
            </div>

            <!-- Footer Text -->
            <p style="font-size: 15px; color: #64748b; margin: 0 0 4px 0;">Best Regards,</p>
            <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">The MailEnclave Team</p>
          </div>
          
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Password Change Email
 */
export const sendPasswordChangeEmail = async (to: string) => {
  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Security Alert: Account Password Changed',
    html: `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Security Alert</h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">This is a notification that the <strong>password</strong> for your MailEnclave account was just changed.</p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #e11d48; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 32px;">
              <p style="color: #9f1239; font-size: 15px; margin: 0;"><strong>Didn't make this change?</strong><br>If you did not authorize this action, please contact support or immediately reset your password using the "Forgot Password" option on the login page to re-secure your account.</p>
            </div>

            <!-- Footer Text -->
            <p style="font-size: 15px; color: #64748b; margin: 0 0 4px 0;">Best Regards,</p>
            <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">The MailEnclave Team</p>
          </div>
          
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
