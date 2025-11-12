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
    category,
    search,
    sortBy = 'name',
    sortOrder = 'asc',
  } = req.query;

  if (page < 1) {
    throw createHttpError(400, 'Page number must be greater than 0');
  }
  const skip = (page - 1) * perPage;
  const filters = {};

  if (gender) filters.gender = gender;
  if (size) filters.size = { $in: size.split(',').map((s) => s.trim()) };
  if (category) filters.category = category;

  if (minPrice || maxPrice) {
    filters['price.value'] = {};
    if (minPrice) filters['price.value'].$gte = Number(minPrice);
    if (maxPrice) filters['price.value'].$lte = Number(maxPrice);
  }
  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  const [goods, totalItems] = await Promise.all([
    Good.find(filters)
      .populate('category')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(perPage),
    Good.countDocuments(filters),
  ]);
  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    success: true,
    message: 'Goods retrieved successfully.',
    data: goods,
    meta: {
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
    },
  });
};

export const getGoodById = async (req, res) => {
  const { id } = req.params;
  const good = await Good.findById(id).populate('category');
  if (!good) throw createHttpError(404, 'Good not found');
  res.status(200).json({ success: true, data: good });
};

export const createGood = async (req, res) => {
  const newGood = await Good.create(req.body);
  res.status(201).json({ success: true, data: newGood });
};

export const updateGood = async (req, res) => {
  const { id } = req.params;
  const updatedGood = await Good.findByIdAndUpdate(id, req.body, { new: true });
  if (!updatedGood) throw createHttpError(404, 'Good not found');
  res.status(200).json({ success: true, data: updatedGood });
};

export const deleteGood = async (req, res) => {
  const { id } = req.params;
  const deletedGood = await Good.findByIdAndDelete(id);
  if (!deletedGood) throw createHttpError(404, 'Good not found');
  res.status(204).send();
};
