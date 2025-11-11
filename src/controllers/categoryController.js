// src/controllers/categoryController.js

import { Category } from '../models/category.js';
import createHttpError from 'http-errors';
import {
  deleteFileFromCloudinary,
  saveFileToCloudinary,
} from '../utils/saveFileToCloudinary.js';

export const getAllCategories = async (req, res) => {
  const { page = 1, perPage = 6 } = req.query;

  if (page < 1) {
    throw createHttpError(400, 'The page number must be greater than 0');
  }

  const skip = (page - 1) * perPage;

  const categoriesQuery = Category.find();

  const [totalItems, categories] = await Promise.all([
    categoriesQuery.clone().countDocuments(),
    categoriesQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    success: true,
    message: 'Get all categories endpoint',
    categories,
    page,
    perPage,
    totalItems,
    totalPages,
  });
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    throw createHttpError(404, 'Category not found');
  }

  res.status(200).json({
    success: true,
    message: 'Get category by id endpoint',
    category,
  });
};

export const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw createHttpError(400, "The 'name' field is required");
  }

  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    throw createHttpError(409, 'A category with this name already exists');
  }

  const category = await Category.create({ name });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category,
  });
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    throw createHttpError(
      400,
      'At least one field must be selected for updating',
    );
  }

  if (name) {
    const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
    if (existingCategory) {
      throw createHttpError(409, 'A category with this name already exists');
    }
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { name },
    { new: true, runValidators: true },
  );

  if (!category) {
    throw createHttpError(404, 'Category not found');
  }

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    category,
  });
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    throw createHttpError(404, 'Category not found');
  }

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    category,
  });
};

export const updateCategoryImg = async (req, res) => {
  if (!req.file) {
    throw createHttpError(
      400,
      'No file uploaded. Please include an image file',
    );
  }
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    throw createHttpError(400, 'Category not found');
  }
  const result = await saveFileToCloudinary(req.file.buffer);

  if (category.img_id != '') {
    await deleteFileFromCloudinary(category.img_id);
  }
  const updCategory = await Category.findByIdAndUpdate(
    id,
    {
      img: result.secure_url,
      img_id: result.public_id,
    },
    { new: true },
  );
  res.status(200).json({
    success: true,
    message: 'Img updated successfully',
    data: {
      img: updCategory.img,
    },
  });
};
