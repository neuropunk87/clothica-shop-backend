import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { FIFTEEN_MINUTES } from '../constants/time.js';

export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many auth attempts from this IP. Please try again later.',
  },
  keyGenerator: (req) => ipKeyGenerator(req),
});

// ------------------------------------------------------------------
// Dev-hack with fixed key for local test
// ------------------------------------------------------------------

// const isProd = process.env.NODE_ENV === 'production';

// const devKey = (_req) => 'local-fixed-key';

// export const authLimiter = rateLimit({
//   windowMs: 10_000,
//   max: 1,

//   standardHeaders: 'draft-6',
//   legacyHeaders: true,

//   keyGenerator: (req) => (isProd ? ipKeyGenerator(req) : devKey(req)),

//   message: { error: 'Too many auth attempts from this IP. Please try again later.' },

//   handler: (req, res, _next, options) => {
//     const retryAfter = res.getHeader('Retry-After');
//     console.log('Rate limit exceeded', {
//       key: req.rateLimit?.key,
//       hits: req.rateLimit?.current,
//       resetTime: req.rateLimit?.resetTime,
//       retryAfter,
//     });
//     res.status(options.statusCode).json({
//       error: 'Too many auth attempts from this IP. Please try again later.',
//       retryAfter,
//     });
//   },
// });
