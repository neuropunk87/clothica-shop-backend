import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

// Custom validator for ObjectId
const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const createFeedbackSchema = {
  [Segments.BODY]: Joi.object({
    author: Joi.string().min(2).required(),
    rate: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(2).required(),
    good: Joi.string().custom(objectIdValidator).required(),
    category: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const getAllFeedbacksSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(3).max(10).default(3),
    good: Joi.string().custom(objectIdValidator).trim(),
    category: Joi.string().custom(objectIdValidator).trim(),
    rate: Joi.number().integer().min(1).max(5),
  }),
};
