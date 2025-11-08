import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  registerUserSchema,
  loginUserSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authLimiter } from '../middleware/rateLimitAuth.js';

const router = Router();

router.post(
  '/auth/register',
  authLimiter,
  celebrate(registerUserSchema),
  ctrlWrapper(registerUser),
);
router.post(
  '/auth/login',
  authLimiter,
  celebrate(loginUserSchema),
  ctrlWrapper(loginUser),
);
router.post('/auth/logout', ctrlWrapper(logoutUser));
router.post('/auth/refresh', ctrlWrapper(refreshUserSession));
router.post(
  '/auth/request-password-reset',
  authLimiter,
  celebrate(requestPasswordResetSchema),
  ctrlWrapper(requestPasswordReset),
);
router.post(
  '/auth/reset-password',
  celebrate(resetPasswordSchema),
  ctrlWrapper(resetPassword),
);

export default router;
