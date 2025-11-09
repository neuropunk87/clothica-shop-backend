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
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      default: 'user',
      enum: ['user', 'admin'],
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
  return obj;
};

userSchema.pre('save', function (next) {
  if (!this.name) {
    this.name = this.email;
  }
  next();
});

export const User = model('User', userSchema);
