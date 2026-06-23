import { Schema, model } from 'mongoose';

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accessTokenHash: {
      type: String,
      required: true,
      select: false,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
    },
    accessTokenValidUntil: {
      type: Date,
      required: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

sessionSchema.index({ userId: 1 });
sessionSchema.index({ accessTokenHash: 1 });
sessionSchema.index({ refreshTokenValidUntil: 1 }, { expireAfterSeconds: 0 });

export const Session = model('Session', sessionSchema);
