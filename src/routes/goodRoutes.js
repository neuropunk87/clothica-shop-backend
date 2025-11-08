import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAllGoods,
  getGoodById,
  createGood,
  updateGood,
  deleteGood,
} from '../controllers/goodController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/goods', ctrlWrapper(getAllGoods));
router.get('/goods/:id', ctrlWrapper(getGoodById));
router.post('/goods', authenticate, ctrlWrapper(createGood));
router.patch('/goods/:id', authenticate, ctrlWrapper(updateGood));
router.delete('/goods/:id', authenticate, ctrlWrapper(deleteGood));

export default router;
