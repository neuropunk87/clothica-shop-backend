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

  const goodsQuery = Good.find();

  if (gender) {
    goodsQuery.where('gender').equals(gender);
  }

  if (size) {
    const sizeArray = size.split(',').map((s) => s.trim());
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
    goodsQuery.where('category').equals(category);
  }

  if (search) {
    goodsQuery.where('name').regex(new RegExp(search, 'i'));
  }

  goodsQuery.populate({
    path: 'category',
    select: 'name',
  });

  const [totalItems, goods] = await Promise.all([
    goodsQuery.clone().countDocuments(),
    goodsQuery
      .skip(skip)
      .limit(perPage)
      .sort({ [sortBy]: sortOrder }),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    success: true,
    message: 'Get all goods endpoint',
    page,
    perPage,
    totalItems,
    totalPages,
    goods,
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
    good,
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
    updatedGood,
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
