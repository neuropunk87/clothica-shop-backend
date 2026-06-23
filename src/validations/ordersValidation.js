import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { ORDER_STATUS } from '../constants/orderStatuses.js';

const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const createOrderSchema = {
  [Segments.BODY]: Joi.object({
    goods: Joi.array()
      .items(
        Joi.object({
          goodId: Joi.string().custom(objectIdValidator).required(),
          amount: Joi.number().integer().min(1).max(100).required(),
          size: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL').required(),
        }),
      )
      .min(1)
      .max(50)
      .required(),
    sum: Joi.number().precision(2).min(1).max(1000000).required(),
    userName: Joi.string().trim().min(2).max(64).required(),
    userLastName: Joi.string().trim().min(2).max(64).required(),
    userPhone: Joi.string()
      .pattern(/^\+380\d{9}$/)
      .required(),
    city: Joi.string().trim().min(2).max(64).required(),
    branchnum_np: Joi.string().trim().min(1).max(64).required(),
    comment: Joi.string().trim().max(1000).allow('').optional(),
  }),
};

export const updateStatusSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    status: Joi.string()
      .valid(...ORDER_STATUS)
      .required(),
  }),
};
