import { Schema, model } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    img: {
      type: String,
      required: false,
      default: '',
    },
    img_id: {
      type: String,
      required: false,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Category = model('Category', categorySchema);
