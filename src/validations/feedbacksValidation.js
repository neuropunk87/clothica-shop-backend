import { Joi, Segments } from 'celebrate';

export const createFeedbackSchema = {
  [Segments.BODY]: Joi.object({
    author:  Joi.string().min(2).required(),
    rate:    Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(2).required(),
    goodId:  Joi.string().required(),
    category:Joi.string().min(2).required(),
  }),
};

export const getAllFeedbacksSchema = {
  [Segments.QUERY]: Joi.object({
    page:     Joi.number().integer().min(1).default(1),
    perPage:  Joi.number().integer().min(3).max(10).default(3),
    goodId:   Joi.string().hex().length(24),
    category: Joi.string().hex().length(24),
    rate:     Joi.number().integer().min(1).max(5),
  }),
};
