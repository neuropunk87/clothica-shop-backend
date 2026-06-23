import { User } from '../models/user.js';
import { Good } from '../models/good.js';
import { Order } from '../models/order.js';
import { Category } from '../models/category.js';
import { Feedback } from '../models/feedback.js';
import { Subscription } from '../models/subscription.js';
import { hashPassword } from '../services/auth.js';

const bcryptHashPattern = /^\$2[aby]\$\d{2}\$/;

const hashPasswordBeforeSave = async (request) => {
  if (request.method !== 'post') return request;

  const payload = { ...request.payload };
  const password = payload.password;

  if (!password) {
    delete payload.password;
  } else if (
    typeof password === 'string' &&
    !bcryptHashPattern.test(password)
  ) {
    payload.password = await hashPassword(password);
  }

  return {
    ...request,
    payload,
  };
};

export const resources = [
  {
    resource: User,
    options: {
      properties: {
        password: {
          type: 'password',
          isVisible: { list: false, show: false, filter: false, edit: true },
        },
        passwordResetToken: {
          isVisible: false,
        },
        passwordResetTokenHash: {
          isVisible: false,
        },
        passwordResetTokenExpires: {
          isVisible: false,
        },
        passwordResetAttempts: {
          isVisible: false,
        },
      },
      actions: {
        new: {
          before: [hashPasswordBeforeSave],
        },
        edit: {
          before: [hashPasswordBeforeSave],
        },
      },
    },
  },
  { resource: Good },
  { resource: Category },
  { resource: Order },
  { resource: Feedback },
  { resource: Subscription },
];
