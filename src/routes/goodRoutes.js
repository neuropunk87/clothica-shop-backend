import { Router } from 'express';
import { celebrate } from 'celebrate';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getAllGoods,
  getGoodById,
  createGood,
  updateGood,
  deleteGood,
} from '../controllers/goodController.js';
import {
  getGoodsSchema,
  getGoodByIdSchema,
  createGoodSchema,
  updateGoodSchema,
} from '../validations/goodsValidation.js';
import { authenticate } from '../middleware/authenticate.js';
import { processCategoryFilter } from '../middleware/processCategoryFilter.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Goods
 *     description: Goods (products) management and listing
 *
 * components:
 *   schemas:
 *     Good:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         stock:
 *           type: integer
 *     GoodsListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Good'
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         total:
 *           type: integer
 */

/**
 * @swagger
 * /api/goods:
 *   get:
 *     summary: Get goods list with filters and pagination
 *     tags: [Goods]
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
 *           default: 12
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Paginated list of goods
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoodsListResponse'
 */
router.get(
  '/goods',
  processCategoryFilter,
  celebrate(getGoodsSchema),
  ctrlWrapper(getAllGoods),
);

/**
 * @swagger
 * /api/goods/{id}:
 *   get:
 *     summary: Get single good by ID
 *     tags: [Goods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Good object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Good'
 *       404:
 *         description: Good not found
 */
router.get(
  '/goods/:id',
  celebrate(getGoodByIdSchema),
  ctrlWrapper(getGoodById),
);

/**
 * @swagger
 * /api/goods:
 *   post:
 *     summary: Create a new good (admin only)
 *     tags: [Goods]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Good'
 *     responses:
 *       201:
 *         description: Good created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/goods',
  celebrate(createGoodSchema),
  authenticate,
  ctrlWrapper(createGood),
);

/**
 * @swagger
 * /api/goods/{id}:
 *   patch:
 *     summary: Update a good by ID (admin only)
 *     tags: [Goods]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Good'
 *     responses:
 *       200:
 *         description: Good updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch(
  '/goods/:id',
  celebrate(updateGoodSchema),
  authenticate,
  ctrlWrapper(updateGood),
);

/**
 * @swagger
 * /api/goods/{id}:
 *   delete:
 *     summary: Delete a good by ID (admin only)
 *     tags: [Goods]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Good deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete(
  '/goods/:id',
  celebrate(getGoodByIdSchema),
  authenticate,
  ctrlWrapper(deleteGood),
);

export default router;
