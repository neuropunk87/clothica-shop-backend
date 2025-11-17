import { User } from '../models/user.js';
import { Good } from '../models/good.js';
import { Order } from '../models/order.js';
import { Category } from '../models/category.js';
import { Feedback } from '../models/feedback.js';
import { Subscription } from '../models/subscription.js';

export const resources = [
  {
    resource: User,
    options: {
      properties: {
        password: {
          type: 'password',
          isVisible: { list: false, show: false, edit: true },
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
