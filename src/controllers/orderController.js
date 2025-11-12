import createHttpError from 'http-errors';
import { Order } from '../models/order.js';
import { ORDER_STATUS } from '../constants/orderStatuses.js';

export const createOrder = async (req, res, next) => {

  const date = new Date().toISOString();

  const newOrder = await Order.create({
    ...req.body,
    userId : req.user ? req.user._id : null,
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
    { new: true },
  );

  if (!updated) return next(createHttpError(404, 'Order not found'));

  res.json(updated);
};
