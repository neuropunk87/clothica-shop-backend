// src/validations/goodsValidation.js

import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

// Custom validator for ObjectId
const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const getGoodsSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(12),
    gender: Joi.string().valid('women', 'unisex', 'man'),
    size: Joi.string().custom((value, helpers) => {
      const sizes = value.split(',').map((s) => s.trim());
      const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

      const invalidSizes = sizes.filter((s) => !validSizes.includes(s));

      if (invalidSizes.length > 0) {
        return helpers.error('any.invalid');
      }

      return value;
    }),
    minPrice: Joi.number().positive(),
    maxPrice: Joi.number().positive(),
    name: Joi.string().trim().min(1),
    category: Joi.string().custom(objectIdValidator).trim().min(1),
    search: Joi.string().allow(''),
    sortBy: Joi.string().valid('price').default('price'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

export const getGoodByIdSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const createGoodSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().required().trim(),
    category: Joi.string().custom(objectIdValidator).required(),
    image: Joi.string().uri().trim(),
    price: Joi.object({
      value: Joi.number().min(0).required(),
      currency: Joi.string().default('грн'),
    }).required(),
    size: Joi.array().items(
      Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL'),
    ),
    description: Joi.string().trim(),
    prevDescription: Joi.string().trim(),
    gender: Joi.string().valid('women', 'unisex', 'man'),
    characteristics: Joi.array().items(Joi.string()),
  }),
};

export const updateGoodSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim(),
    category: Joi.string().custom(objectIdValidator).required(),
    image: Joi.string().uri().trim(),
    price: Joi.object({
      value: Joi.number().min(0),
      currency: Joi.string(),
    }),
    size: Joi.array().items(
      Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL'),
    ),
    description: Joi.string().trim(),
    prevDescription: Joi.string().trim(),
    gender: Joi.string().valid('women', 'unisex', 'man'),
    characteristics: Joi.array().items(Joi.string()),
  }).min(1),
};
