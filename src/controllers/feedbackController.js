import { Feedback } from '../models/feedback.js';

export const createFeedback = async (req, res, next) => {
  const feedback = await Feedback.create(req.body);
  res.status(201).json(feedback);
};

export const getAllFeedbacks = async (req, res, next) => {
  const { page = 1, perPage = 3, good, category, rate } = req.query;

  const filter = {};
  if (good) filter.good = good;
  if (category) filter.category = category;
  if (rate) filter.rate = Number(rate);

  const feedbackQuery = Feedback.find(filter);

  feedbackQuery.populate({
    path: 'good',
    select: 'name',
  });

  feedbackQuery.populate({
    path: 'category',
    select: 'name',
  });

  const [feedbacks, total] = await Promise.all([
    feedbackQuery
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage),
    feedbackQuery.clone().countDocuments(),
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
