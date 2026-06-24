import { Good } from '../models/good.js';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';

const getCsvItems = (...values) =>
  values
    .filter((value) => value !== undefined && value !== null)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim())
    .filter(Boolean);

const buildFilterQuery = (queryParams) => {
  const {
    gender,
    size,
    sizes,
    good,
    color,
    colors,
    minPrice,
    maxPrice,
    category,
    search,
  } = queryParams;

  const filterConditions = [];
  const sizeFilters = getCsvItems(size, sizes);
  const goodFilters = getCsvItems(good);
  const colorFilters = getCsvItems(color, colors);

  if (gender) {
    filterConditions.push({ gender });
  }
  if (sizeFilters.length > 0) {
    filterConditions.push({ size: mongoose.trusted({ $in: sizeFilters }) });
  }
  if (goodFilters.length > 0) {
    filterConditions.push({ _id: mongoose.trusted({ $in: goodFilters }) });
  }
  if (colorFilters.length > 0) {
    filterConditions.push({ colors: mongoose.trusted({ $in: colorFilters }) });
  }
  if (category) {
    filterConditions.push({ category });
  }
  if (minPrice || maxPrice) {
    const priceCondition = {};
    if (minPrice) priceCondition.$gte = Number(minPrice);
    if (maxPrice) priceCondition.$lte = Number(maxPrice);
    filterConditions.push({
      'price.value': mongoose.trusted(priceCondition),
    });
  }
  if (search) {
    filterConditions.push({ $text: mongoose.trusted({ $search: search }) });
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
  } else if (sortBy === 'price') {
    sortOrderObj['price.value'] = order;
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
  const updatedGood = await Good.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedGood) throw createHttpError(404, 'Good not found');
  res.status(200).json({ success: true, data: updatedGood });
};

export const deleteGood = async (req, res) => {
  const { id } = req.params;
  const deletedGood = await Good.findByIdAndDelete(id);
  if (!deletedGood) throw createHttpError(404, 'Good not found');
  res.status(204).send();
};
