import { Joi, Segments } from 'celebrate';
import { ORDER_STATUS } from '../constants/orderStatuses.js';

export const createOrderSchema = {
  [Segments.BODY]: Joi.object({
    goods: Joi.array()
      .items(
        Joi.object({
          goodId: Joi.string().required(),
          amount: Joi.number().min(1).required(),
          size: Joi.string().required(),
        }),
      )
      .min(1)
      .required(),
    sum: Joi.number().min(1).required(),
    date: Joi.string().required(),
    userName: Joi.string().required(),
    userLastName: Joi.string().required(),
    userPhone: Joi.string().required(),
    city: Joi.string().required(),
    branchnum_np: Joi.string().required(),
    comment: Joi.string().allow('').optional(),
    status: Joi.string()
      .valid(...ORDER_STATUS)
      .optional(),
  }),
};

export const updateStatusSchema = {
  [Segments.BODY]: Joi.object({
    status: Joi.string()
      .valid(...ORDER_STATUS)
      .required(),
  }),
};
