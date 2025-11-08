import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import {
  getCategoriesSchema,
  categoryIdParamSchema,
} from '../validations/categoriesValidation.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get(
  '/categories',
  celebrate(getCategoriesSchema),
  ctrlWrapper(getAllCategories),
);
router.get(
  '/categories/:id',
  celebrate(categoryIdParamSchema),
  ctrlWrapper(getCategoryById),
);
router.post('/categories', authenticate, ctrlWrapper(createCategory));
router.patch('/categories/:id', authenticate, ctrlWrapper(updateCategory));
router.delete('/categories/:id', authenticate, ctrlWrapper(deleteCategory));

export default router;
