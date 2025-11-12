import { Schema, model } from 'mongoose';

const feedbackSchema = new Schema(
  {
    author: { type: String, required: true, trim: true },
    rate:   { type: Number, required: true, min: 1, max: 5 },
    comment:{ type: String, required: true, trim: true },
    goodId: { type: Schema.Types.ObjectId, ref: 'goods', required: true },
    category: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false }
);

export const Feedback = model('Feedback', feedbackSchema);
