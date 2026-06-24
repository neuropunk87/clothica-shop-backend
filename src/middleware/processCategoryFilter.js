import mongoose, { isValidObjectId } from 'mongoose';
import slugify from 'slugify';
import { Category } from '../models/category.js';

export const processCategoryFilter = async (req, res, next) => {
  if (!req.query.category) {
    return next();
  }
  try {
    const categoryFilter = Array.isArray(req.query.category)
      ? req.query.category[0]
      : req.query.category;

    if (!categoryFilter) {
      delete req.query.category;
      return next();
    }

    if (isValidObjectId(categoryFilter)) {
      req.query.category = categoryFilter;
      return next();
    }

    const categorySlug = slugify(categoryFilter, {
      lower: true,
      strict: true,
      locale: 'uk',
    });
    const category = await Category.findOne(
      mongoose.trusted({
        $or: [
          { slug: categoryFilter },
          { slug: categorySlug },
          { name: categoryFilter },
        ],
      }),
    )
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
