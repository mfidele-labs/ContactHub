
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure Gmail as our email provider
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Send a password-reset email
const sendPasswordResetEmail = async (email, resetUrl) => {
    await transporter.sendMail({
        from: `"ContactHub" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'ContactHub - Password Reset',

        text: `
You requested a password reset for your ContactHub account.

Use this link to reset your password:
${resetUrl}

This link expires in 15 minutes.

If you did not request this, you can ignore this email.
        `,

        html: `
            <div style="font-family: Georgia, serif; max-width: 550px; margin: auto; padding: 30px; background: #f0e4ce; color: #49372d;">
                <h1 style="color: #813d36;">ContactHub</h1>

                <h2>Password Reset</h2>

                <p>We received a request to reset your ContactHub password.</p>

                <p>Click the button below to choose a new password.</p>

                <a href="${resetUrl}"
                   style="display: inline-block; padding: 14px 24px; background: #813d36; color: white; text-decoration: none;">
                    RESET PASSWORD
                </a>

                <p>This link expires in 15 minutes.</p>

                <p>If you did not request this, you can safely ignore this email.</p>
            </div>
        `
    });
};

module.exports = { sendPasswordResetEmail };
