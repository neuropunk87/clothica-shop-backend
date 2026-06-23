import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { upload } from '../middleware/multer.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryImg,
} from '../controllers/categoryController.js';
import {
  getCategoriesSchema,
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validations/categoriesValidation.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Category management and listing
 *
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     CategoriesListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         total:
 *           type: integer
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get paginated list of categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesListResponse'
 */
router.get(
  '/categories',
  celebrate(getCategoriesSchema),
  ctrlWrapper(getAllCategories),
);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 */
router.get(
  '/categories/:id',
  celebrate(categoryIdParamSchema),
  ctrlWrapper(getCategoryById),
);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (admin only)
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/categories',
  authenticate,
  requireAdmin,
  celebrate(createCategorySchema),
  ctrlWrapper(createCategory),
);

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Update category by ID (admin only)
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch(
  '/categories/:id',
  authenticate,
  requireAdmin,
  celebrate(updateCategorySchema),
  ctrlWrapper(updateCategory),
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category by ID (admin only)
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete(
  '/categories/:id',
  authenticate,
  requireAdmin,
  celebrate(categoryIdParamSchema),
  ctrlWrapper(deleteCategory),
);

/**
 * @swagger
 * /api/categories/{id}/img:
 *   patch:
 *     summary: Update category image (admin only)
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               img:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload.
 *     responses:
 *       200:
 *         description: Image updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     img:
 *                       type: string
 *                       format: uri
 *       400:
 *         description: Bad Request (e.g., no file uploaded or invalid file type).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Category not found.
 */
router.patch(
  '/categories/:id/img',
  authenticate,
  requireAdmin,
  celebrate(categoryIdParamSchema),
  upload.single('img'),
  ctrlWrapper(updateCategoryImg),
);

export default router;
