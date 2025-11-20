import { Good } from '../models/good.js';
import createHttpError from 'http-errors';

const buildFilterQuery = (queryParams) => {
  const { gender, size, color, minPrice, maxPrice, category, search } =
    queryParams;

  const filterConditions = [];

  if (gender) {
    filterConditions.push({ gender });
  }
  if (size) {
    const sizes = size.split(',').map((s) => s.trim());
    filterConditions.push({ size: { $in: sizes } });
  }
  if (color) {
    const colors = color.split(',').map((c) => c.trim());
    filterConditions.push({ colors: { $in: colors } });
  }
  if (category) {
    filterConditions.push({ category });
  }
  if (minPrice || maxPrice) {
    const priceCondition = {};
    if (minPrice) priceCondition.$gte = Number(minPrice);
    if (maxPrice) priceCondition.$lte = Number(maxPrice);
    filterConditions.push({ 'price.value': priceCondition });
  }
  if (search) {
    filterConditions.push({ $text: { $search: search } });
  }

  return filterConditions.length > 0 ? { $and: filterConditions } : {};
};

const buildSortOrder = (sortBy, sortOrder) => {
  const order = sortOrder === 'desc' ? -1 : 1;
  const sortOrderObj = {};
  if (sortBy === 'popgoods') {
    sortOrderObj['feedbackCount'] = -1;
    sortOrderObj['averageRate'] = -1;
    sortOrderObj['name'] = 1;
  } else {
    sortOrderObj[sortBy] = order;
  }

  return sortOrderObj;
};

export const getAllGoods = async (req, res) => {
  const {
    page = 1,
    perPage = 12,
    sortBy = 'name',
    sortOrder = 'asc',
  } = req.query;

  const pageNum = Number(page);
  const perPageNum = Number(perPage);

  if (pageNum < 1) {
    throw createHttpError(400, 'Page number must be greater than 0');
  }
  const skip = (pageNum - 1) * perPageNum;
  const filters = buildFilterQuery(req.query);
  const sortOrderObj = buildSortOrder(sortBy, sortOrder);

  const [goods, totalItems] = await Promise.all([
    Good.find(filters)
      .populate('category', 'name slug')
      .sort(sortOrderObj)
      .skip(skip)
      .limit(perPageNum)
      .lean(),
    Good.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(totalItems / perPageNum);

  res.status(200).json({
    success: true,
    message: 'Goods retrieved successfully',
    data: goods,
    meta: {
      page: pageNum,
      perPage: perPageNum,
      totalItems,
      totalPages,
    },
  });
};

export const getGoodById = async (req, res) => {
  const { id } = req.params;
  const good = await Good.findById(id).populate('category', 'name slug').lean();
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
