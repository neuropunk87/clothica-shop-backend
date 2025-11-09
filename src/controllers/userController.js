import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { clearSessionCookies } from '../services/auth.js';
import {
  saveFileToCloudinary,
  deleteFileFromCloudinary,
} from '../utils/saveFileToCloudinary.js';

export const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

export const updateProfile = async (req, res) => {
  const allowedUpdates = ['name', 'lastname', 'city', 'branchnum_np'];
  const updates = {};

  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }
  if (req.body.email) {
    throw createHttpError(
      400,
      'Email address cannot be changed through this endpoint',
    );
  }
  if (Object.keys(updates).length === 0) {
    throw createHttpError(
      400,
      'Request body does not contain any fields to update',
    );
  }
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
  });
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
};

export const deleteProfile = async (req, res) => {
  const { _id, avatar_id } = req.user;

  if (avatar_id) {
    await deleteFileFromCloudinary(avatar_id);
  }
  await Session.deleteMany({ userId: _id });

  await User.findByIdAndDelete(_id);

  clearSessionCookies(res);

  // res.status(204).send();
  res.status(200).json({
    success: true,
    message: 'Profile deleted successfully',
  });
};

export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    throw createHttpError(
      400,
      'No file uploaded. Please include an image file',
    );
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
  res.status(200).json({
    success: true,
    message: 'Avatar updated successfully',
    data: {
      avatar: user.avatar,
    },
  });
};

export const getTelegramLink = (req, res) => {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    throw createHttpError(500, 'Telegram bot is not configured on the server');
  }
  const link = `https://t.me/${botUsername}?start=${req.user._id}`;

  res.status(200).json({
    success: true,
    data: {
      link: link,
    },
  });
};
