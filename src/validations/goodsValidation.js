import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { AVAILABLE_COLORS } from '../constants/colors.js';

const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

const getCsvItems = (value) => {
  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap((item) => String(item ?? '').split(','))
    .map((item) => item.trim())
    .filter(Boolean);
};

const csvQueryValue = Joi.alternatives().try(
  Joi.array().items(Joi.string().allow('')),
  Joi.string().allow(''),
);

const createCsvEnumValidator = (allowedValues, label) =>
  csvQueryValue.custom((value, helpers) => {
    const items = getCsvItems(value);
    if (items.length === 0) return '';

    const invalidItems = items.filter((item) => !allowedValues.includes(item));
    if (invalidItems.length > 0) {
      return helpers.message(`Invalid ${label}: ${invalidItems.join(', ')}`);
    }

    return [...new Set(items)].join(',');
  });

const objectIdCsvValidator = csvQueryValue.custom((value, helpers) => {
  const ids = getCsvItems(value);
  if (ids.length === 0) return '';

  const invalidIds = ids.filter((id) => !isValidObjectId(id));
  if (invalidIds.length > 0) {
    return helpers.message(`Invalid good IDs: ${invalidIds.join(', ')}`);
  }

  return [...new Set(ids)].join(',');
});

export const getGoodsSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(12),
    gender: Joi.string().valid('women', 'unisex', 'man'),
    size: createCsvEnumValidator(VALID_SIZES, 'sizes'),
    sizes: createCsvEnumValidator(VALID_SIZES, 'sizes'),
    good: objectIdCsvValidator,
    color: createCsvEnumValidator(AVAILABLE_COLORS, 'colors'),
    colors: createCsvEnumValidator(AVAILABLE_COLORS, 'colors'),
    minPrice: Joi.number().positive().empty(''),
    maxPrice: Joi.number().positive().empty(''),
    name: Joi.string().trim().min(1).max(128),
    category: Joi.string().custom(objectIdValidator).trim().min(1),
    search: Joi.string().trim().max(128).allow(''),
    sortBy: Joi.string().valid('price', 'name', 'popgoods').default('price'),
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
    name: Joi.string().required().trim().max(128),
    category: Joi.string().custom(objectIdValidator).required(),
    image: Joi.string().uri().trim(),
    price: Joi.object({
      value: Joi.number().min(0).required(),
      currency: Joi.string().default('грн'),
    }).required(),
    size: Joi.array().items(
      Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL'),
    ),
    colors: Joi.array().items(Joi.string().valid(...AVAILABLE_COLORS)),
    description: Joi.string().trim().max(5000),
    prevDescription: Joi.string().trim().max(5000),
    gender: Joi.string().valid('women', 'unisex', 'man'),
    characteristics: Joi.array().items(Joi.string().trim().max(512)).max(50),
  }),
};

export const updateGoodSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().max(128),
    category: Joi.string().custom(objectIdValidator),
    image: Joi.string().uri().trim(),
    price: Joi.object({
      value: Joi.number().min(0),
      currency: Joi.string(),
    }),
    size: Joi.array().items(
      Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL'),
    ),
    colors: Joi.array().items(Joi.string().valid(...AVAILABLE_COLORS)),
    description: Joi.string().trim().max(5000),
    prevDescription: Joi.string().trim().max(5000),
    gender: Joi.string().valid('women', 'unisex', 'man'),
    characteristics: Joi.array().items(Joi.string().trim().max(512)).max(50),
  }).min(1),
};
