import fs from 'node:fs/promises';
import path from 'node:path';
import handlebars from 'handlebars';
import { Subscription } from '../models/subscription.js';
import { sendMail } from '../utils/sendMail.js';

const sendWelcomeEmail = async (email) => {
  try {
    const templatePath = path.resolve(
      'src',
      'templates',
      'subscription-welcome.html',
    );
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    const html = template({
      clientUrl: process.env.FRONTEND_DOMAIN || 'http://localhost:3000',
      year: new Date().getFullYear(),
    });
    await sendMail({
      from: `Clothica <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Вітаємо в Clothica! Дякуємо за підписку 🎉',
      html,
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
  }
};

export const createSubscription = async (req, res) => {
  const { email } = req.body;

  const existingSubscription = await Subscription.findOne({ email });

  if (existingSubscription) {
    return res.status(200).json({
      message: 'You have successfully subscribed to our newsletter!',
    });
  }
  await Subscription.create({ email });

  res.status(201).json({
    message: 'You have successfully subscribed to our newsletter!',
  });
  sendWelcomeEmail(email);
};
