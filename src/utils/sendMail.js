import { Resend } from 'resend';

let resend;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn('⚠️ RESEND_API_KEY is not set. Email sending will be disabled.');
}

/**
 * Resend API
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.from]
 */

export const sendMail = async (options) => {
  if (!resend) {
    console.error(
      `Skipping email to ${options.to} because Resend is not configured.`,
    );
    return Promise.resolve();
  }
  try {
    const data = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        'Clothica <clothica-shop@neuropunk87.tech>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`Email sent successfully to ${options.to}. ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error(`Failed to send email via Resend to ${options.to}:`, error);
    throw error;
  }
};

// import nodemailer from 'nodemailer';

// if (
//   !process.env.SMTP_HOST ||
//   !process.env.SMTP_PORT ||
//   !process.env.SMTP_USER ||
//   !process.env.SMTP_PASSWORD
// ) {
//   console.warn(
//     '⚠️ SMTP environment variables are not fully configured. Email sending will be disabled.',
//   );
// }

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   secure: Number(process.env.SMTP_PORT) === 465,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
//   connectionTimeout: 10000,
//   greetingTimeout: 5000,
//   socketTimeout: 20000,
// });

// export const sendMail = async (options) => {
//   if (!transporter.options.host) {
//     console.error(
//       `Skipping email to ${options.to} because SMTP is not configured.`,
//     );
//     return;
//   }
//   return await transporter.sendMail(options);
// };
