import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/categories', ctrlWrapper(getAllCategories));
router.get('/categories/:id', ctrlWrapper(getCategoryById));
router.post('/categories', authenticate, ctrlWrapper(createCategory));
router.patch('/categories/:id', authenticate, ctrlWrapper(updateCategory));
router.delete('/categories/:id', authenticate, ctrlWrapper(deleteCategory));

export default router;
