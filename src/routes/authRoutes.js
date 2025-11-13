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
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimitAuth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints (registration, login, logout, refresh, password reset)
 *
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required: [name, phone, password]
 *       properties:
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *           example: "+380991234567"
 *         password:
 *           type: string
 *           format: password
 *     LoginRequest:
 *       type: object
 *       required: [phone, password]
 *       properties:
 *         phone:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *     RequestPasswordReset:
 *       type: object
 *       required: [phone]
 *       properties:
 *         phone:
 *           type: string
 *     ResetPasswordRequest:
 *       type: object
 *       required: [phone, code, password]
 *       properties:
 *         phone:
 *           type: string
 *         code:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (creates session cookies)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully. Session cookies set.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       409:
 *         description: Phone number already in use.
 */
router.post(
  '/auth/register',
  authLimiter,
  celebrate(registerUserSchema),
  ctrlWrapper(registerUser),
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and set session cookies
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User authenticated. Session cookies set.
 *       401:
 *         description: Invalid credentials.
 */
router.post(
  '/auth/login',
  authLimiter,
  celebrate(loginUserSchema),
  ctrlWrapper(loginUser),
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (clears session cookies)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: Logged out successfully.
 *       401:
 *         description: Missing or invalid authentication.
 */
router.post('/auth/logout', authenticate, ctrlWrapper(logoutUser));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh session tokens (rotates session)
 *     tags: [Auth]
 *     description: Uses cookies (sessionId + refreshToken) to create a new session and set new cookies.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Session refreshed successfully.
 *       401:
 *         description: Session not found or refresh token invalid/expired.
 */
router.post('/auth/refresh', ctrlWrapper(refreshUserSession));

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Request password reset code (Sent via Telegram if linked)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestPasswordReset'
 *     responses:
 *       200:
 *         description: 200 always returned for security (response message does not leak whether account exists).
 */
router.post(
  '/auth/request-password-reset',
  authLimiter,
  celebrate(requestPasswordResetSchema),
  ctrlWrapper(requestPasswordReset),
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using code delivered by Telegram
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful.
 *       401:
 *         description: Invalid phone/code or code expired.
 */
router.post(
  '/auth/reset-password',
  celebrate(resetPasswordSchema),
  ctrlWrapper(resetPassword),
);

export default router;
