import crypto from 'crypto';
import { Session } from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';

const isProd = process.env.NODE_ENV === 'production';

export const createSession = async (userId) => {
  const accessToken = crypto.randomBytes(30).toString('base64url');
  const refreshToken = crypto.randomBytes(30).toString('base64url');

  return Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

export const setSessionCookies = (res, session) => {
  const common = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('accessToken', session.accessToken, {
    ...common,
    maxAge: FIFTEEN_MINUTES,
  });

  res.cookie('refreshToken', session.refreshToken, {
    ...common,
    maxAge: ONE_DAY,
  });

  res.cookie('sessionId', session._id, {
    ...common,
    maxAge: ONE_DAY,
  });
};

export const clearSessionCookies = (res) => {
  const cookieOptions = { path: '/' };
  res.clearCookie('sessionId', cookieOptions);
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};
