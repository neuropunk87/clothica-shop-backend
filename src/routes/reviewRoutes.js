import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/reviews', ctrlWrapper(getAllReviews));
router.get('/reviews/:id', ctrlWrapper(getReviewById));
router.post('/reviews', authenticate, ctrlWrapper(createReview));
router.patch('/reviews/:id', authenticate, ctrlWrapper(updateReview));
router.delete('/reviews/:id', authenticate, ctrlWrapper(deleteReview));

export default router;
