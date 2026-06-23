import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Session } from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';
import {
  bcryptSaltRounds,
  cookieSameSite,
  cookieSecure,
  hashSecret,
} from '../config/security.js';

const generateToken = () => crypto.randomBytes(32).toString('base64url');

export const hashAccessToken = (token) => hashSecret(token, 'access-token');
export const hashRefreshToken = (token) => hashSecret(token, 'refresh-token');
export const hashPasswordResetCode = (code) =>
  hashSecret(code, 'password-reset-code');
export const hashTelegramLinkToken = (token) =>
  hashSecret(token, 'telegram-link-token');

export const hashPassword = (password) =>
  bcrypt.hash(password, bcryptSaltRounds);

export const verifyPassword = (password, passwordHash) =>
  bcrypt.compare(password, passwordHash);

export const passwordNeedsRehash = (passwordHash) => {
  try {
    return bcrypt.getRounds(passwordHash) < bcryptSaltRounds;
  } catch {
    return true;
  }
};

export const createSession = async (userId) => {
  const accessToken = generateToken();
  const refreshToken = generateToken();

  const session = await Session.create({
    userId,
    accessTokenHash: hashAccessToken(accessToken),
    refreshTokenHash: hashRefreshToken(refreshToken),
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });

  return {
    _id: session._id,
    userId: session.userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: session.accessTokenValidUntil,
    refreshTokenValidUntil: session.refreshTokenValidUntil,
  };
};

const getSessionCookieOptions = () => ({
  httpOnly: true,
  path: '/',
  sameSite: cookieSameSite,
  secure: cookieSecure,
  priority: 'high',
});

export const setSessionCookies = (res, session) => {
  const cookieOptions = getSessionCookieOptions();

  res.cookie('accessToken', session.accessToken, {
    ...cookieOptions,
    maxAge: FIFTEEN_MINUTES,
  });
  res.cookie('refreshToken', session.refreshToken, {
    ...cookieOptions,
    maxAge: ONE_DAY,
  });
  res.cookie('sessionId', session._id.toString(), {
    ...cookieOptions,
    maxAge: ONE_DAY,
  });
};

export const clearSessionCookies = (res) => {
  const cookieOptions = getSessionCookieOptions();

  res.clearCookie('sessionId', cookieOptions);
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};
