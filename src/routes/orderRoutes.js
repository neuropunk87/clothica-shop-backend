import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/orders', authenticate, ctrlWrapper(getAllOrders));
router.get('/orders/:id', authenticate, ctrlWrapper(getOrderById));
router.post('/orders', authenticate, ctrlWrapper(createOrder));
router.patch('/orders/:id', authenticate, ctrlWrapper(updateOrder));
router.delete('/orders/:id', authenticate, ctrlWrapper(deleteOrder));

export default router;
