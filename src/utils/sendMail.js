import nodemailer from 'nodemailer';

if (
  !process.env.SMTP_HOST ||
  !process.env.SMTP_PORT ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASSWORD
) {
  console.warn(
    '⚠️ SMTP environment variables are not fully configured. Email sending will be disabled.',
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 20000,
});

export const sendMail = async (options) => {
  if (!transporter.options.host) {
    console.error(
      `Skipping email to ${options.to} because SMTP is not configured.`,
    );
    return;
  }
  return await transporter.sendMail(options);
};
