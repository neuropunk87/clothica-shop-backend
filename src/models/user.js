import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [32, 'Name cannot exceed 32 characters'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\+380\d{9}$/, 'Phone must be in format +380XXXXXXXXX'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      maxlength: [128, 'Password cannot exceed 128 characters'],
    },
    lastname: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
    branchnum_np: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      maxlength: [64, 'Email cannot exceed 64 characters'],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      default: null,
    },
    avatar: {
      type: String,
      required: false,
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg',
    },
    avatar_id: {
      type: String,
      required: false,
      default: '',
    },
    telegramChatId: { type: String, required: false, default: null },
    telegramUserId: { type: String, required: false, default: null },
    telegramLinked: { type: Boolean, required: false, default: false },
    telegramLinkTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    telegramLinkTokenExpires: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      default: 'user',
      enum: ['user', 'admin'],
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetTokenExpires: {
      type: Date,
      default: null,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
      select: false,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetTokenExpires;
  delete obj.passwordResetAttempts;
  delete obj.telegramLinkTokenHash;
  delete obj.telegramLinkTokenExpires;
  return obj;
};

userSchema.index(
  { telegramLinkTokenHash: 1 },
  { partialFilterExpression: { telegramLinkTokenHash: { $type: 'string' } } },
);

export const User = model('User', userSchema);
