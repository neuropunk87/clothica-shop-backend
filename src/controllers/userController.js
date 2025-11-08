import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import {
  saveFileToCloudinary,
  deleteFileFromCloudinary,
} from '../utils/saveFileToCloudinary.js';

const secureKeys = [
  'password',
  'phone',
  'role',
  'telegramChatId',
  'telegramUserId',
  'telegramLinked',
  'avatar',
  'avatar_id',
];

export const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

export const updateProfile = async (req, res) => {
  const { body } = req;

  for (const key of secureKeys) {
    if (key in body) {
      delete body[key];
    }
  }

  if (Object.keys(body).length === 0) {
    throw createHttpError(400, 'No valid fields to update');
  }

  try {
    await User.findByIdAndUpdate(req.user._id, body, { new: true });
  } catch {
    throw createHttpError(500, 'Error updating profile');
  }

  res.status(200).json({
    success: true,
    message: 'Update profile endpoint',
  });
};

export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
  } catch {
    throw createHttpError(500, 'Error deleting profile');
  }

  res.status(200).json({
    success: true,
    message: 'Delete profile endpoint',
  });
};

export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, 'No file');
  }

  const result = await saveFileToCloudinary(req.file.buffer);

  if (req.user.avatar_id != '') {
    await deleteFileFromCloudinary(req.user.avatar_id);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: result.secure_url,
      avatar_id: result.public_id,
    },
    { new: true },
  );

  res.status(200).json({ url: user.avatar });
};

export const getTelegramLink = (req, res) => {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    throw createHttpError(500, 'Telegram bot is not configured.');
  }

  const link = `https://t.me/${botUsername}?start=${req.user._id}`;

  res.status(200).json({
    success: true,
    data: {
      link: link,
    },
  });
};
