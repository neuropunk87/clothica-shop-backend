import { Schema, model } from 'mongoose';
import { AVAILABLE_COLORS } from '../constants/colors.js';

const goodSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
    price: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: 'грн',
      },
    },
    size: [
      {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
    ],
    colors: [
      {
        type: String,
        enum: AVAILABLE_COLORS,
        trim: true,
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    feedbacks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Feedback',
      },
    ],
    prevDescription: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['women', 'unisex', 'man'],
    },
    characteristics: [
      {
        type: String,
      },
    ],
    averageRate: { type: Number, default: 0 },
    feedbackCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

goodSchema.index({ 'price.value': 1 });
goodSchema.index({ category: 1 });
goodSchema.index({ gender: 1 });
goodSchema.index({ colors: 1 });
goodSchema.index({ size: 1 });
goodSchema.index({ name: 'text', description: 'text' });
goodSchema.index({
  feedbackCount: -1,
  averageRate: -1,
  name: 1,
});

export const Good = model('Good', goodSchema);
