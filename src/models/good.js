import { Schema, model } from 'mongoose';

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

export const Good = model('Good', goodSchema);
