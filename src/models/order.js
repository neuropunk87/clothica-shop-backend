import { Schema, model } from 'mongoose';
import { ORDER_STATUS } from '../constants/orderStatuses.js';
import { Counter } from './counter.js';

const orderSchema = new Schema(
  {
    goods: [
      {
        goodId: { type: Schema.Types.ObjectId, ref: 'Good', required: true },
        amount: { type: Number, required: true, min: 1 },
        size: { type: String, required: true },
        _id: false,
      },
    ],

    sum: { type: Number, required: true, min: 1 },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },

    date: { type: String, required: true },

    orderNum: { type: String, index: true },

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

orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'orderNum' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.orderNum = String(counter.seq).padStart(7, '0');
  }
  next();
});

export const Order = model('Order', orderSchema);
