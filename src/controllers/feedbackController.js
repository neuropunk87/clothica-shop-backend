import { Feedback } from '../models/feedback.js';

export const createFeedback = async (req, res, next) => {
  const feedback = await Feedback.create(req.body);
  res.status(201).json(feedback);
};

export const getAllFeedbacks = async (req, res, next) => {
  const page = 1;
  const perPage = 3;

  const filter = {};
  if (req.query.goodId) filter.goodId = req.query.goodId;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.rate) filter.rate = Number(req.query.rate);

  const [feedbacks, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage),
    Feedback.countDocuments(filter),
  ]);
  const totalPages = Math.ceil(total / perPage);

  res.status(200).json({
    feedbacks,
    pagination: {
      page,
      perPage,
      total,
      totalPages,
    },
  });
};
