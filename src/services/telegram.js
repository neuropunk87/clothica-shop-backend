import TelegramBot from 'node-telegram-bot-api';
import { User } from '../models/user.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot;

if (token) {
  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1];

    if (userId) {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return bot.sendMessage(chatId, '❌ Помилка: Користувач не знайдений');
        }
        if (user.telegramLinked) {
          return bot.sendMessage(chatId, '✅ Ваш акаунт вже привʼязаний');
        }
        await User.findByIdAndUpdate(userId, {
          telegramChatId: chatId,
          telegramUserId: msg.from.id,
          telegramLinked: true,
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
  console.log('Telegram bot started with polling...');
} else {
  console.warn('TELEGRAM_BOT_TOKEN not found. Bot will not start');
}

export const sendPasswordResetCode = async (chatId, code) => {
  if (!bot) return;
  const message = `Ваш одноразовий код для скидання пароля в Clothica: \n\n*${code}* \n\nНікому не повідомляйте цей код`;
  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
};

export const initTelegramBot = () => {
  if (bot) {
    console.log('✅ Telegram bot is already initialized.');
  }
};
