import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { FIFTEEN_MINUTES } from '../constants/time.js';

export const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again later.',
  },
  keyGenerator: (req) => req.user?._id?.toString() ?? ipKeyGenerator(req.ip),
});

export const adminLoginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many admin login attempts from this IP. Please try again later.',
  },
  keyGenerator: (req) => ipKeyGenerator(req.ip),
});

export const publicWriteLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many submissions from this IP. Please try again later.',
  },
  keyGenerator: (req) => ipKeyGenerator(req.ip),
});
