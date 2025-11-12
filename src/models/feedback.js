import { Schema, model } from 'mongoose';
import { Good } from './good.js';

const feedbackSchema = new Schema(
  {
    author: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    good: { type: Schema.Types.ObjectId, ref: 'Good', required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

async function updateGoodAverage(goodId) {
  const feedbacks = await Feedback.find({ good: goodId });

  if (!feedbacks.length) {
    await Good.findByIdAndUpdate(goodId, { averageRate: 0, feedbackCount: 0 });
    return;
  }

  const total = feedbacks.reduce((sum, fb) => sum + fb.rate, 0);
  const average = Math.round((total / feedbacks.length) * 10) / 10;

  await Good.findByIdAndUpdate(goodId, {
    averageRate: average.toFixed(2),
    feedbackCount: feedbacks.length,
  });
}

feedbackSchema.post('save', async function () {
  await updateGoodAverage(this.good);
});

feedbackSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateGoodAverage(doc.good);
});

export const Feedback = model('Feedback', feedbackSchema);
