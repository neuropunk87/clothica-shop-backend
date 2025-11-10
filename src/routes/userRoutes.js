import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getTelegramLink,
} from '../controllers/userController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User profile and related endpoints
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         lastname:
 *           type: string
 *         city:
 *           type: string
 *         branchnum_np:
 *           type: string
 *         email:
 *           type: string
 *         avatar:
 *           type: string
 *         telegramLinked:
 *           type: boolean
 *         role:
 *           type: string
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       Only allowed fields: name, lastname, city, branchnum_np.
 *       Phone/email changes must use dedicated endpoints with verification.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastname:
 *                 type: string
 *               city:
 *                 type: string
 *               branchnum_np:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or no fields to update
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete current user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: User deleted successfully
 */
router.get('/users/profile', authenticate, ctrlWrapper(getProfile));
router.patch('/users/profile', authenticate, ctrlWrapper(updateProfile));
router.delete('/users/profile', authenticate, ctrlWrapper(deleteProfile));

/**
 * @swagger
 * /api/users/profile/telegram-link:
 *   get:
 *     summary: Generate link to link Telegram account with user profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Returns a URL which user should open in Telegram to link account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 link:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Bot not configured
 */
router.get(
  '/users/profile/telegram-link',
  authenticate,
  ctrlWrapper(getTelegramLink),
);

export default router;
