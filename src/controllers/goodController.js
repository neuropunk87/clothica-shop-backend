// src/controllers/goodController.js

import { Good } from '../models/good.js';
import createHttpError from 'http-errors';

export const getAllGoods = async (req, res) => {
  const {
    page = 1,
    perPage = 12,
    gender,
    size,
    minPrice,
    maxPrice,
    // sortBy = 'createdAt',
    // sortOrder = 'desc',
  } = req.query;

  if (page < 1) {
    throw createHttpError(400, 'The page number must be greater than 0');
  }

  const skip = (page - 1) * perPage;

  const goodsQuery = Good.find();

  const filter = {};

  if (gender) {
    goodsQuery.where('gender').equals(gender);
  }

  if (size) {
    const sizeArray = Array.isArray(size) ? size : [size];
    filter.size = { $in: sizeArray };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter['price.value'] = {};

    if (minPrice !== undefined) {
      filter['price.value'].$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      filter['price.value'].$lte = Number(maxPrice);
    }
  }

  const [totalItems, goods] = await Promise.all([
    goodsQuery.clone().countDocuments(),
    goodsQuery.skip(skip).limit(perPage),
  ]);

  const totalPage = Math.ceil(totalItems / perPage);

  res.status(200).json({
    success: true,
    message: 'Get all goods endpoint',
    data: goods,
    page,
    perPage,
    totalItems,
    totalPage,
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
