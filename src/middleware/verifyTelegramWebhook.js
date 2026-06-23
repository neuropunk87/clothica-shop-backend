import createHttpError from 'http-errors';
import {
  isProd,
  telegramWebhookPathSecret,
  timingSafeEqual,
} from '../config/security.js';

const telegramSecretHeader = 'x-telegram-bot-api-secret-token';

export const verifyTelegramWebhook = (req, res, next) => {
  if (!telegramWebhookPathSecret) {
    return next(createHttpError(404, 'Telegram webhook is not configured'));
  }

  if (!timingSafeEqual(req.params.webhookSecret, telegramWebhookPathSecret)) {
    return next(createHttpError(404, 'Telegram webhook not found'));
  }

  const configuredHeaderSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!configuredHeaderSecret) {
    if (isProd) {
      return next(
        createHttpError(500, 'Telegram webhook secret is not configured'),
      );
    }

    return next();
  }

  const providedHeaderSecret = req.get(telegramSecretHeader);

  if (!timingSafeEqual(providedHeaderSecret, configuredHeaderSecret)) {
    return next(createHttpError(401, 'Invalid Telegram webhook signature'));
  }

  return next();
};
