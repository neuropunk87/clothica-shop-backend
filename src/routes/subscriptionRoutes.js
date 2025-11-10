import { Router } from 'express';
import { celebrate } from 'celebrate';
import { createSubscriptionSchema } from '../validations/subscriptionsValidation.js';
import { createSubscription } from '../controllers/subscriptionController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Subscriptions
 *     description: Newsletter subscription endpoints
 *
 * components:
 *   schemas:
 *     SubscriptionCreate:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 */

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Subscribe to news and promotions (sends welcome email)
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionCreate'
 *     responses:
 *       201:
 *         description: Subscription created and welcome email sent.
 *       200:
 *         description: Email already subscribed (returns success to avoid leaking existence).
 *       400:
 *         description: Validation error.
 */
router.post(
  '/subscriptions',
  celebrate(createSubscriptionSchema),
  ctrlWrapper(createSubscription),
);

export default router;
