import createHttpError from 'http-errors';
import { Order } from '../models/order.js';
import { customAlphabet } from 'nanoid';
import { ORDER_STATUS } from '../constants/orderStatuses.js';

export const createOrder = async (req, res, next) => {
  const orderNum = customAlphabet('0123456789', 8)();

  const newOrder = await Order.create({
    ...req.body,
    userId: req.user._id,
    orderNum,
  });

  res.status(201).json(newOrder);
};

export const getUserOrders = async (req, res, next) => {
  const orders = await Order.find({ userId: req.user._id });
  res.status(200).json(orders);
};

export const updateOrderStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!ORDER_STATUS.includes(status)) {
    return next(createHttpError(400, 'Invalid order status'));
  }

  const updated = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true },
  );

  if (!updated) return next(createHttpError(404, 'Order not found'));

  res.json(updated);
};
