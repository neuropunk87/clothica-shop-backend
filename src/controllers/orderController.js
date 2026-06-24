import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { Order } from '../models/order.js';
import { ORDER_STATUS } from '../constants/orderStatuses.js';
import { User } from '../models/user.js';
import { Good } from '../models/good.js';

export const createOrder = async (req, res, next) => {
  const { goods, userPhone } = req.body;

  const existingUser = await User.findOne({ phone: userPhone });
  const goodIds = [...new Set(goods.map(({ goodId }) => goodId))];
  const goodsFromDb = await Good.find({
    _id: mongoose.trusted({ $in: goodIds }),
  })
    .select('price.value size')
    .lean();

  if (goodsFromDb.length !== goodIds.length) {
    throw createHttpError(400, 'One or more goods in the order do not exist');
  }

  const goodsById = new Map(
    goodsFromDb.map((good) => [good._id.toString(), good]),
  );
  let calculatedSum = 0;

  for (const item of goods) {
    const good = goodsById.get(item.goodId);

    if (!good.size?.includes(item.size)) {
      throw createHttpError(400, 'Selected size is not available');
    }

    calculatedSum += Number(good.price.value) * item.amount;
  }

  const date = new Date().toISOString();

  const newOrder = await Order.create({
    ...req.body,
    sum: Math.round(calculatedSum * 100) / 100,
    status: undefined,
    userId: existingUser ? existingUser._id : null,
    date,
  });

  res.status(201).json(newOrder);
};

export const getUserOrders = async (req, res, next) => {
  const orders = await Order.find({ userId: req.user._id });
  res.status(200).json(orders);
};

export const updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ORDER_STATUS.includes(status)) {
    return next(createHttpError(400, 'Invalid order status'));
  }

  const updated = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );

  if (!updated) return next(createHttpError(404, 'Order not found'));

  res.json(updated);
};
