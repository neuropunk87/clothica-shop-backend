import { Category } from '../models/category.js';

export const processCategoryFilter = async (req, res, next) => {
  if (!req.query.category) {
    return next();
  }
  try {
    const categorySlug = req.query.category;
    const category = await Category.findOne({ slug: categorySlug })
      .select('_id')
      .lean();
    if (category) {
      req.query.category = category._id.toString();
    } else {
      req.query.category = '000000000000000000000000';
    }
  } catch (error) {
    console.error('Error processing category filter:', error);
  }
  return next();
};
