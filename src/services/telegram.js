import TelegramBot from 'node-telegram-bot-api';
import { User } from '../models/user.js';
import {
  encodedTelegramWebhookPathSecret,
  isProd,
} from '../config/security.js';
import { hashTelegramLinkToken } from './auth.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot;

if (token) {
  bot = new TelegramBot(token);

  bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const linkToken = match[1];

    if (linkToken) {
      try {
        const user = await User.findOne({
          telegramLinkTokenHash: hashTelegramLinkToken(linkToken),
          telegramLinkTokenExpires: { $gt: new Date() },
        }).select('+telegramLinkTokenHash');

        if (!user) {
          return bot.sendMessage(
            chatId,
            '❌ Помилка: посилання недійсне або прострочене',
          );
        }
        if (user.telegramLinked) {
          return bot.sendMessage(chatId, '✅ Ваш акаунт вже привʼязаний');
        }
        await User.findByIdAndUpdate(user._id, {
          telegramChatId: chatId,
          telegramUserId: msg.from.id,
          telegramLinked: true,
          telegramLinkTokenHash: null,
          telegramLinkTokenExpires: null,
        });
        bot.sendMessage(
          chatId,
          `✅ Ваш акаунт Clothica успішно прив'язаний! Тепер ви можете використовувати функціонал бота`,
        );
      } catch (error) {
        console.error('Error linking telegram account:', error);
        bot.sendMessage(
          chatId,
          `❌ Сталася помилка при прив'язці акаунта. Спробуйте пізніше`,
        );
      }
    } else {
      bot.sendMessage(
        chatId,
        `Вітаємо в Clothica! Щоб прив'язати цей Telegram-акаунт до вашого профілю на сайті, будь ласка, перейдіть в особистий кабінет і натисніть "Прив'язати Telegram".\n\nДля допомоги введіть /help`,
      );
    }
  });
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `*Доступні команди:*\n\n/start - Почати роботу з ботом та прив'язати акаунт.\n/help - Показати це повідомлення`;
    bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
  });
} else {
  console.warn('TELEGRAM_BOT_TOKEN not found. Bot will not be initialized');
}

export const setupTelegramWebhook = async () => {
  if (!bot) return;

  if (!process.env.RENDER_EXTERNAL_URL || !encodedTelegramWebhookPathSecret) {
    const message =
      'Telegram webhook was not configured because public URL or webhook path secret is missing';
    if (isProd) throw new Error(message);
    console.warn(message);
    return;
  }

  const baseUrl = process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
  const webhookUrl = `${baseUrl}/api/telegram/webhook/${encodedTelegramWebhookPathSecret}`;
  const webhookOptions = process.env.TELEGRAM_WEBHOOK_SECRET
    ? { secret_token: process.env.TELEGRAM_WEBHOOK_SECRET }
    : undefined;

  try {
    await bot.setWebhook(webhookUrl, webhookOptions);
    console.log('✅ Telegram webhook set up');
  } catch (error) {
    console.error('❌ Failed to set Telegram webhook:', error.message);
  }
};

export const processTelegramUpdate = (update) => {
  if (bot) {
    bot.processUpdate(update);
  }
};

export const sendPasswordResetCode = async (chatId, code) => {
  if (!bot) return;
  const message = `Ваш одноразовий код для скидання пароля в Clothica: \n\n*${code}* \n\nНікому не повідомляйте цей код`;
  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
};
