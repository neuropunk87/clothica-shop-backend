import { Router } from 'express';
import { celebrate } from 'celebrate';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  createFeedback,
  getAllFeedbacks,
} from '../controllers/feedbackController.js';
import {
  createFeedbackSchema,
  getAllFeedbacksSchema,
} from '../validations/feedbacksValidation.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Feedbacks
 *     description: Product reviews and feedbacks
 *
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         goodId:
 *           type: string
 *         rating:
 *           type: integer
 *         comment:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/feedbacks:
 *   get:
 *     summary: Get list of feedbacks (supports pagination and filtering)
 *     tags: [Feedbacks]
 *     parameters:
 *       - in: query
 *         name: goodId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *     responses:
 *       200:
 *         description: List of feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feedback'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 */
router.get(
  '/feedbacks',
  celebrate(getAllFeedbacksSchema),
  ctrlWrapper(getAllFeedbacks),
);

/**
 * @swagger
 * /api/feedbacks:
 *   post:
 *     summary: Create a new feedback (authenticated)
 *     tags: [Feedbacks]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [goodId, rating]
 *             properties:
 *               goodId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/feedbacks',
  celebrate(createFeedbackSchema),
  ctrlWrapper(createFeedback),
);

export default router;
