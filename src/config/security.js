import 'dotenv/config';
import crypto from 'node:crypto';

const MIN_PRODUCTION_SECRET_LENGTH = 32;
const DEFAULT_JSON_LIMIT = '100kb';
const DEFAULT_URLENCODED_LIMIT = '50kb';

const truthyValues = new Set(['1', 'true', 'yes', 'on']);
const validSameSiteValues = new Set(['lax', 'strict', 'none']);
const validCsrfModes = new Set(['strict', 'session', 'off']);

const readBoolean = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return truthyValues.has(String(value).trim().toLowerCase());
};

const readInteger = (value, defaultValue, min, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
};

const splitList = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const normalizeOrigin = (value) => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const configuredOrigins = [
  ...splitList(process.env.CLIENT_URLS),
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_2,
  process.env.CLIENT_URL_LOCAL,
  process.env.API_URL,
  process.env.BACKEND_URL,
  process.env.RENDER_EXTERNAL_URL,
];

export const isProd = process.env.NODE_ENV === 'production';
export const allowedOrigins = [
  ...new Set(configuredOrigins.map(normalizeOrigin).filter(Boolean)),
];

const configuredSameSite = String(
  process.env.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax'),
).toLowerCase();

export const cookieSameSite = validSameSiteValues.has(configuredSameSite)
  ? configuredSameSite
  : isProd
    ? 'none'
    : 'lax';

export const cookieSecure = isProd || readBoolean(process.env.COOKIE_SECURE);

const configuredCsrfMode = String(
  process.env.CSRF_ORIGIN_CHECK || (isProd ? 'strict' : 'session'),
).toLowerCase();

export const csrfOriginCheckMode = validCsrfModes.has(configuredCsrfMode)
  ? configuredCsrfMode
  : isProd
    ? 'strict'
    : 'session';

export const requestBodyLimits = {
  json: process.env.JSON_BODY_LIMIT || DEFAULT_JSON_LIMIT,
  urlencoded: process.env.URLENCODED_BODY_LIMIT || DEFAULT_URLENCODED_LIMIT,
  urlencodedParameterLimit: readInteger(
    process.env.URLENCODED_PARAMETER_LIMIT,
    50,
    10,
    500,
  ),
};

export const bcryptSaltRounds = readInteger(
  process.env.BCRYPT_SALT_ROUNDS,
  12,
  10,
  14,
);

export const sessionTokenSecret =
  process.env.SESSION_TOKEN_SECRET ||
  (isProd ? undefined : 'development-session-token-secret-do-not-use-in-prod');

export const telegramWebhookPathSecret =
  process.env.TELEGRAM_WEBHOOK_PATH_SECRET ||
  process.env.TELEGRAM_BOT_TOKEN ||
  null;

export const encodedTelegramWebhookPathSecret = telegramWebhookPathSecret
  ? encodeURIComponent(telegramWebhookPathSecret)
  : null;

export const isAllowedOrigin = (origin) => {
  const normalized = normalizeOrigin(origin);
  return Boolean(normalized && allowedOrigins.includes(normalized));
};

export const timingSafeEqual = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string') return false;

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const hashSecret = (value, context = 'default') => {
  if (!sessionTokenSecret) {
    throw new Error('SESSION_TOKEN_SECRET is required to hash sensitive tokens');
  }

  return crypto
    .createHmac('sha256', sessionTokenSecret)
    .update(context)
    .update(':')
    .update(String(value))
    .digest('hex');
};

const hasWeakSecretValue = (value) => {
  if (!value) return true;

  const normalized = String(value).trim().toLowerCase();
  return (
    normalized.length < MIN_PRODUCTION_SECRET_LENGTH ||
    normalized.includes('changeme') ||
    normalized.includes('change-me') ||
    normalized.includes('secret') ||
    normalized.includes('password')
  );
};

export const validateSecurityEnv = () => {
  if (!isProd) return;

  const errors = [];
  const requiredSecrets = [
    'MONGO_URL',
    'ADMIN_SESSION_SECRET',
    'ADMIN_COOKIE_SECRET',
    'SESSION_TOKEN_SECRET',
  ];

  for (const name of requiredSecrets) {
    if (!process.env[name]) {
      errors.push(`${name} is required in production`);
    }
  }

  for (const name of [
    'ADMIN_SESSION_SECRET',
    'ADMIN_COOKIE_SECRET',
    'SESSION_TOKEN_SECRET',
  ]) {
    if (hasWeakSecretValue(process.env[name])) {
      errors.push(
        `${name} must be at least ${MIN_PRODUCTION_SECRET_LENGTH} strong random characters`,
      );
    }
  }

  if (allowedOrigins.length === 0) {
    errors.push('At least one CLIENT_URL or CLIENT_URLS origin is required');
  }

  if (cookieSameSite === 'none' && !cookieSecure) {
    errors.push('SameSite=None cookies require COOKIE_SECURE=true/HTTPS');
  }

  if (process.env.TELEGRAM_BOT_TOKEN) {
    if (!process.env.RENDER_EXTERNAL_URL) {
      errors.push('RENDER_EXTERNAL_URL is required for Telegram webhooks');
    }

    if (!process.env.TELEGRAM_WEBHOOK_SECRET) {
      errors.push('TELEGRAM_WEBHOOK_SECRET is required for Telegram webhooks');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Security configuration error:\n- ${errors.join('\n- ')}`);
  }
};
