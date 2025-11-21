import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
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
 *     OrderItem:
 *       type: object
 *       required: [goodId, quantity]
 *       properties:
 *         goodId:
 *           type: string
 *         quantity:
 *           type: integer
 *     CreateOrder:
 *       type: object
 *       required: [items, customer]
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         customer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             lastname:
 *               type: string
 *             phone:
 *               type: string
 *             city:
 *               type: string
 *             branchnum_np:
 *               type: string
 *         payment:
 *           type: object
 *           properties:
 *             method:
 *               type: string
 *               example: 'card'
 *             transactionId:
 *               type: string
 *     OrderResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         total:
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
router.post(`/orders`, celebrate(createOrderSchema), ctrlWrapper(createOrder));

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
