import createHttpError from 'http-errors';
import {
  csrfOriginCheckMode,
  isAllowedOrigin,
  normalizeOrigin,
} from '../config/security.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const excludedPathPrefixes = ['/api/telegram/webhook/'];

const getRequestOrigin = (req) => {
  const origin = req.get('origin');
  if (origin) return normalizeOrigin(origin);

  const referer = req.get('referer');
  return normalizeOrigin(referer);
};

const getSelfOrigin = (req) => normalizeOrigin(`${req.protocol}://${req.get('host')}`);

const hasSessionCookie = (req) =>
  Boolean(
    req.cookies?.accessToken ||
      req.cookies?.refreshToken ||
      req.cookies?.sessionId,
  );

export const verifyRequestOrigin = (req, res, next) => {
  if (safeMethods.has(req.method)) return next();
  if (csrfOriginCheckMode === 'off') return next();

  if (excludedPathPrefixes.some((prefix) => req.path.startsWith(prefix))) {
    return next();
  }

  const shouldCheck =
    csrfOriginCheckMode === 'strict' ||
    (csrfOriginCheckMode === 'session' && hasSessionCookie(req));

  if (!shouldCheck) return next();

  const requestOrigin = getRequestOrigin(req);
  if (!requestOrigin) {
    return next(createHttpError(403, 'Request origin is required'));
  }

  if (requestOrigin === getSelfOrigin(req)) {
    return next();
  }

  if (!isAllowedOrigin(requestOrigin)) {
    return next(createHttpError(403, 'Request origin is not allowed'));
  }

  return next();
};
