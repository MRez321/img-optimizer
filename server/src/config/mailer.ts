import nodemailer from 'nodemailer';

// Fill these in via .env once you have real SMTP credentials.
// Until then, every email is ALSO logged to console so you can test
// the flow without sending real emails.
//
// .env example:
//   SMTP_HOST=smtp.resend.com
//   SMTP_PORT=587
//   SMTP_USER=resend
//   SMTP_PASS=your_api_key_here
//   SMTP_FROM="img-optimizer <noreply@yourdomain.com>"

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'img-optimizer <noreply@example.com>';

let transporter: nodemailer.Transporter | null = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
} else {
    console.warn(
        '⚠️  SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing). ' +
        'Emails will only be logged to console.'
    );
}

export const sendVerificationEmail = async (to: string, code: string): Promise<void> => {
    const subject = 'Verify your email - img-optimizer';
    const text = `Your verification code is: ${code}\n\nThis code expires in 15 minutes.`;
    const html = `
        <div style="font-family: sans-serif; max-width: 480px;">
            <h2>Verify your email</h2>
            <p>Use the code below to verify your email address:</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
            <p style="color: #888; font-size: 13px;">This code expires in 15 minutes.</p>
        </div>
    `;

    // Always log for dev/testing visibility
    console.log(`📧 [email-verification] to=${to} code=${code}`);

    if (!transporter) {
        // SMTP not configured - console log above is the only delivery for now
        return;
    }

    try {
        await transporter.sendMail({ from: SMTP_FROM, to, subject, text, html });
    } catch (err) {
        console.error('Failed to send verification email:', err);
        // Don't throw - verification code is still valid and logged to console,
        // so the flow isn't blocked by email delivery issues during dev.
    }
};
