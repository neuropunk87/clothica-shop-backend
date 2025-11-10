import { Schema, model } from 'mongoose';
import { ORDER_STATUS } from '../constants/orderStatuses.js';

const orderSchema = new Schema(
  {
    goods: [
      {
        goodId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        amount: { type: Number, required: true, min: 1 },
        size: { type: String, required: true },
        _id: false,
      },
    ],

    sum: { type: Number, required: true, min: 1 },

    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    date: { type: String, required: true },

    orderNum: { type: String, required: true },

    status: {
      type: String,
      enum: ORDER_STATUS,
      default: 'processing',
    },

    userName: { type: String, required: true },
    userLastName: { type: String, required: true },
    userPhone: { type: String, required: true },
    city: { type: String, required: true },
    branchnum_np: { type: String, required: true },
    comment: { type: String, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Order = model('Order', orderSchema);
