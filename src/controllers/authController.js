import createHttpError from 'http-errors';
import crypto from 'crypto';
import { isValidObjectId } from 'mongoose';
import {
  createSession,
  setSessionCookies,
  clearSessionCookies,
  hashPassword,
  hashPasswordResetCode,
  hashRefreshToken,
  passwordNeedsRehash,
  verifyPassword,
} from '../services/auth.js';
import { timingSafeEqual } from '../config/security.js';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { sendPasswordResetCode } from '../services/telegram.js';

const MAX_PASSWORD_RESET_ATTEMPTS = 5;

export const registerUser = async (req, res) => {
  const { name, phone, password } = req.body;

  const existingUser = await User.findOne({ phone });
  if (existingUser) throw createHttpError(400, 'Phone number in use');

  const hashedPassword = await hashPassword(password);

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

  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword)
    throw createHttpError(401, 'Invalid phone number or password');

  if (passwordNeedsRehash(user.password)) {
    user.password = await hashPassword(password);
    await user.save();
  }

  await Session.deleteMany({ userId: user._id });

  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

export const logoutUser = async (req, res) => {
  if (req.session?._id) {
    await Session.deleteOne({ _id: req.session._id });
  }
  clearSessionCookies(res);

  res.status(204).send();
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;
  if (!sessionId || !refreshToken || !isValidObjectId(sessionId)) {
    throw createHttpError(401, 'Refresh session cookies are missing');
  }

  const refreshTokenHash = hashRefreshToken(refreshToken);
  const session = await Session.findOne({
    _id: sessionId,
    refreshTokenHash,
  });
  if (!session)
    throw createHttpError(401, 'Session not found or refresh token is invalid');

  const isRefreshTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isRefreshTokenExpired)
    throw createHttpError(401, 'Session has expired. Please log in again');

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  await Session.deleteOne({ _id: sessionId, refreshTokenHash });

  res.status(200).json({ message: 'Session refreshed successfully' });
};

export const requestPasswordReset = async (req, res) => {
  const { phone } = req.body;
  const user = await User.findOne({ phone });

  if (user && user.telegramLinked && user.telegramChatId) {
    const resetCode = crypto.randomInt(100000, 999999).toString();

    user.passwordResetToken = null;
    user.passwordResetTokenHash = hashPasswordResetCode(resetCode);
    user.passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetAttempts = 0;
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
    passwordResetTokenExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetAttempts');

  if (!user) {
    throw createHttpError(
      401,
      'Invalid phone number or reset code, or code has expired',
    );
  }

  if (user.passwordResetAttempts >= MAX_PASSWORD_RESET_ATTEMPTS) {
    user.passwordResetToken = null;
    user.passwordResetTokenHash = null;
    user.passwordResetTokenExpires = null;
    user.passwordResetAttempts = 0;
    await user.save();
    throw createHttpError(429, 'Too many invalid reset attempts');
  }

  const expectedCodeHash = hashPasswordResetCode(code);
  if (!timingSafeEqual(expectedCodeHash, user.passwordResetTokenHash)) {
    user.passwordResetAttempts += 1;
    await user.save();
    throw createHttpError(
      401,
      'Invalid phone number or reset code, or code has expired',
    );
  }

  const hashedPassword = await hashPassword(password);
  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpires = null;
  user.passwordResetAttempts = 0;
  await user.save();

  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    message: 'Password has been reset successfully',
  });
};
