// src/controllers/goodController.js

import { Good } from '../models/good.js';
import { Category } from '../models/category.js';
import createHttpError from 'http-errors';

export const getAllGoods = async (req, res) => {
  const {
    page = 1,
    perPage = 12,
    gender,
    size,
    minPrice,
    maxPrice,
    name,
    category,
    search,
    sortBy = 'price',
    sortOrder = 'asc',
  } = req.query;

  if (page < 1) {
    throw createHttpError(400, 'The page number must be greater than 0');
  }

  const skip = (page - 1) * perPage;

  const goodsQuery = Good.find().populate('category');

  if (gender) {
    goodsQuery.where('gender').equals(gender);
  }

  if (size) {
    const sizeArray = size.split(',').map(s => s.trim());
    goodsQuery.where('size').in(sizeArray);
  }

  if (minPrice !== undefined) {
    goodsQuery.where('price.value').gte(Number(minPrice));
  }

  if (maxPrice !== undefined) {
    goodsQuery.where('price.value').lte(Number(maxPrice));
  }

  if (name) {
    goodsQuery.where('name').regex(new RegExp(name, 'i'));
  }

  if (category) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);

    if (isObjectId) {
      // If it is ObjectId — search directly
      goodsQuery.where('category').equals(category);
    } else {
      // If this is the name of a category, find its ID.
      const matchedCategories = await Category.find({
        name: new RegExp(category, 'i'),
      }).select('_id');

      if (matchedCategories.length > 0) {
        const categoryIds = matchedCategories.map(c => c._id);
        goodsQuery.where('category').in(categoryIds);
      } else {
        // If no category is found
        return res.status(200).json({
          success: true,
          message: `No goods found for category: ${category}`,
          data: [],
          page: Number(page),
          perPage: Number(perPage),
          totalItems: 0,
          totalPages: 0,
        });
      }
    }
  }

  if (search) {
    goodsQuery.where('name').regex(new RegExp(search, 'i'));
  }

  const [totalItems, goods] = await Promise.all([
    goodsQuery.clone().countDocuments(),
    goodsQuery.skip(skip).limit(perPage).sort({[sortBy]: sortOrder}),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    success: true,
    message: 'Get all goods endpoint',
    data: goods,
    page,
    perPage,
    totalItems,
    totalPages,
  });
};

export const getGoodById = async (req, res) => {
  const { id } = req.params;

  const good = await Good.findById(id);

  if (!good) {
    throw createHttpError(404, 'Good not found');
  }

  res.status(200).json({
    success: true,
    message: 'Get good by id endpoint',
    data: good,
  });
};

export const createGood = async (req, res) => {
  const newGood = await Good.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Successfully created good',
    data: newGood,
  });
};

export const updateGood = async (req, res) => {
  const { id } = req.params;

  const updatedGood = await Good.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedGood) {
    throw createHttpError(404, 'Good not found');
  }

  res.status(200).json({
    success: true,
    message: 'Successfully updated good',
    data: updatedGood,
  });
};

export const deleteGood = async (req, res) => {
  const { id } = req.params;

  const deletedGood = await Good.findByIdAndDelete(id);

  if (!deletedGood) {
    throw createHttpError(404, 'Good not found');
  }

  res.status(204).send();
};
