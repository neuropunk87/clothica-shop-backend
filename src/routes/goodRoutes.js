import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAllGoods,
  getGoodById,
  createGood,
  updateGood,
  deleteGood,
} from '../controllers/goodController.js';
import { getGoodsSchema, getGoodByIdSchema, createGoodSchema, updateGoodSchema,  } from '../validations/goodsValidation.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/goods', celebrate(getGoodsSchema), ctrlWrapper(getAllGoods));
router.get('/goods/:id', celebrate(getGoodByIdSchema), ctrlWrapper(getGoodById));
router.post(
  '/goods',
  celebrate(createGoodSchema),
  authenticate,
  ctrlWrapper(createGood),
);
router.patch(
  '/goods/:id',
  celebrate(updateGoodSchema),
  authenticate,
  ctrlWrapper(updateGood),
);
router.delete(
  '/goods/:id',
  celebrate(getGoodByIdSchema),
  authenticate,
  ctrlWrapper(deleteGood),
);

export default router;
