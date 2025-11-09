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

router.get('/users/profile', authenticate, ctrlWrapper(getProfile));
router.patch('/users/profile', authenticate, ctrlWrapper(updateProfile));
router.delete('/users/profile', authenticate, ctrlWrapper(deleteProfile));
router.get(
  '/users/profile/telegram-link',
  authenticate,
  ctrlWrapper(getTelegramLink),
);

export default router;
