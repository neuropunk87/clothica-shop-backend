import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  createSession,
  setSessionCookies,
  clearSessionCookies,
} from '../services/auth.js';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { sendPasswordResetCode } from '../services/telegram.js';

export const registerUser = async (req, res) => {
  const { name, phone, password } = req.body;

  const existingUser = await User.findOne({ phone });
  if (existingUser) throw createHttpError(400, 'Phone number in use');

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    phone,
    password: hashedPassword,
  });
  const newSession = await createSession(newUser._id);
  setSessionCookies(res, newSession);

  res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });
  if (!user) throw createHttpError(401, 'Invalid phone number or password');

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    throw createHttpError(401, 'Invalid phone number or password');

  await Session.deleteOne({ userId: user._id });

  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }
  clearSessionCookies(res);

  res.status(204).send();
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;
  const session = await Session.findOne({ _id: sessionId, refreshToken });
  if (!session)
    throw createHttpError(401, 'Session not found or refresh token is invalid');

  const isRefreshTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isRefreshTokenExpired)
    throw createHttpError(401, 'Session has expired. Please log in again');

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  await Session.deleteOne({ _id: sessionId, refreshToken });

  res.status(200).json({ message: 'Session refreshed successfully' });
};

export const requestPasswordReset = async (req, res) => {
  const { phone } = req.body;
  const user = await User.findOne({ phone });

  if (user && user.telegramLinked && user.telegramChatId) {
    const resetCode = crypto.randomInt(100000, 999999).toString();

    user.passwordResetToken = resetCode;
    user.passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetCode(user.telegramChatId, resetCode);
    } catch (error) {
      console.error('Failed to send password reset code via Telegram:', error);
    }
  }
  res.status(200).json({
    message:
      'If an account with this phone number exists and has a linked Telegram, a reset code has been sent',
  });
};

export const resetPassword = async (req, res) => {
  const { phone, code, password } = req.body;

  const user = await User.findOne({
    phone,
    passwordResetToken: code,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw createHttpError(
      401,
      'Invalid phone number or reset code, or code has expired',
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetTokenExpires = null;
  await user.save();

  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    message: 'Password has been reset successfully',
  });
};
