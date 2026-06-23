// src/validations/categoriesValidation.js

import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

export const getCategoriesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(3).max(7).default(6),
  }),
};

// Custom validator for ObjectId
const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const categoryIdParamSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const createCategorySchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(2).max(64).required(),
    description: Joi.string().trim().max(1000).allow(''),
  }),
};

export const updateCategorySchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(2).max(64),
    description: Joi.string().trim().max(1000).allow(''),
  }).min(1),
};
