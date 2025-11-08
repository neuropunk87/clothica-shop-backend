import TelegramBot from 'node-telegram-bot-api';
import { User } from '../models/user.js';

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot;

if (token) {
  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1];

    try {
      const user = await User.findById(userId);
      if (!user) {
        return bot.sendMessage(chatId, 'Помилка: Користувач не знайдений.');
      }

      const existingTelegramUser = await User.findOne({
        telegramChatId: chatId,
      });
      if (
        existingTelegramUser &&
        existingTelegramUser._id.toString() !== userId
      ) {
        return bot.sendMessage(
          chatId,
          'Цей акаунт Telegram вже використовується іншим користувачем.',
        );
      }

      await User.findByIdAndUpdate(userId, {
        telegramChatId: chatId,
        telegramUserId: msg.from.id,
        telegramLinked: true,
      });

      bot.sendMessage(chatId, `✅ Ваш акаунт Clothica успішно прив'язаний!`);
    } catch (error) {
      console.error('Error linking telegram account:', error);
      bot.sendMessage(
        chatId,
        `Сталася помилка при прив'язці акаунта. Спробуйте пізніше.`,
      );
    }
  });

  console.log('Telegram bot started with polling...');
} else {
  console.warn('TELEGRAM_BOT_TOKEN not found. Bot will not start.');
}

export const sendPasswordResetCode = async (chatId, code) => {
  if (!bot) return;
  const message = `Ваш одноразовий код для скидання пароля в Clothica: \n\n*${code}* \n\nНікому не повідомляйте цей код.`;
  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
};

export const initTelegramBot = () => {
  if (bot) {
    console.log('✅ Telegram bot is already initialized.');
  }
};
