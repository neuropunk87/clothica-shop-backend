import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { celebrate } from 'celebrate';
import {
  createOrder,
  getUserOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { createOrderSchema, updateStatusSchema } from '../validations/orderValidation.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.post(`/orders`, celebrate(createOrderSchema), ctrlWrapper(createOrder));
router.get(`/orders`, authenticate, ctrlWrapper(getUserOrders));
router.patch(`/orders/:id/status`, authenticate, requireAdmin, celebrate(updateStatusSchema), ctrlWrapper(updateOrderStatus));

export default router;
