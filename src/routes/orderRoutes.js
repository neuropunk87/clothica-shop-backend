import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { publicWriteLimiter } from '../middleware/rateLimitApi.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  createOrder,
  getUserOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import {
  createOrderSchema,
  updateStatusSchema,
} from '../validations/ordersValidation.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order creation and management
 *
 * components:
 *   schemas:
 *     OrderGood:
 *       type: object
 *       required: [goodId, amount, size]
 *       properties:
 *         goodId:
 *           type: string
 *         amount:
 *           type: integer
 *           minimum: 1
 *         size:
 *           type: string
 *           enum: [XS, S, M, L, XL, XXL]
 *     CreateOrder:
 *       type: object
 *       required: [goods, sum, userName, userLastName, userPhone, city, branchnum_np]
 *       properties:
 *         goods:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderGood'
 *         sum:
 *           type: number
 *           description: Accepted for client compatibility; server recalculates the final sum from current product prices.
 *         userName:
 *           type: string
 *         userLastName:
 *           type: string
 *         userPhone:
 *           type: string
 *           example: "+380991234567"
 *         city:
 *           type: string
 *         branchnum_np:
 *           type: string
 *         comment:
 *           type: string
 *     OrderResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         goods:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderGood'
 *         sum:
 *           type: number
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders for current user
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.get(`/orders`, authenticate, ctrlWrapper(getUserOrders));

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order (public or authenticated)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Validation error
 */
router.post(
  `/orders`,
  publicWriteLimiter,
  celebrate(createOrderSchema),
  ctrlWrapper(createOrder),
);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin)
 */
router.patch(
  `/orders/:id/status`,
  authenticate,
  requireAdmin,
  celebrate(updateStatusSchema),
  ctrlWrapper(updateOrderStatus),
);

export default router;
