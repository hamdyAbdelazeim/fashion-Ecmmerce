const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

exports.sendPasswordResetEmail = async ({ to, resetUrl, name }) => {
    const transporter = createTransporter();

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:#111827;padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:28px;font-family:Georgia,serif;letter-spacing:-0.5px;">
                    LUXE<span style="color:#d97706;">.</span>
                  </h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <h2 style="margin:0 0 16px;color:#111827;font-size:22px;font-weight:700;">
                    Reset your password
                  </h2>
                  <p style="margin:0 0 12px;color:#6b7280;font-size:15px;line-height:1.6;">
                    Hi ${name},
                  </p>
                  <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">
                    We received a request to reset the password for your LUXE. account.
                    Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                    <tr>
                      <td style="background:#d97706;border-radius:8px;">
                        <a href="${resetUrl}"
                           style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;line-height:1.5;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin:0 0 28px;word-break:break-all;">
                    <a href="${resetUrl}" style="color:#d97706;font-size:13px;">${resetUrl}</a>
                  </p>
                  <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.5;">
                    If you didn't request a password reset, you can safely ignore this email.
                    Your password will not change.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    © ${new Date().getFullYear()} LUXE. — Premium Fashion. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"LUXE." <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset your LUXE. password',
        html,
    });
};
