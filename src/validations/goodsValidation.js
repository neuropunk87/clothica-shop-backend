// src/validations/goodsValidation.js

import { Joi, Segments } from 'celebrate';

export const getGoodsSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(12),
  }),
};

export const getGoodByIdSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid good ID format',
    }),
  }),
};

export const createGoodSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().required().trim(),
    category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    image: Joi.string().uri().trim(),
    price: Joi.object({
      value: Joi.number().min(0).required(),
      currency: Joi.string().default('грн'),
    }).required(),
    size: Joi.array().items(
      Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL')
    ),
    description: Joi.string().trim(),
    prevDescription: Joi.string().trim(),
    gender: Joi.string().valid('men', 'women', 'unisex', 'man'),
    characteristics: Joi.array().items(Joi.string()),
  }),
};

export const updateGoodSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  }),
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim(),
    category: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    image: Joi.string().uri().trim(),
    price: Joi.object({
      value: Joi.number().min(0),
      currency: Joi.string(),
    }),
    size: Joi.array().items(
      Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL')
    ),
    description: Joi.string().trim(),
    prevDescription: Joi.string().trim(),
    gender: Joi.string().valid('men', 'women', 'unisex', 'man'),
    characteristics: Joi.array().items(Joi.string()),
  }).min(1),
};