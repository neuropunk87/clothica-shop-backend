import { Joi, Segments } from 'celebrate';

export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().max(32).required(),
    phone: Joi.string()
      .pattern(/^\+380\d{9}$/)
      .max(13)
      .required(),
    password: Joi.string().min(8).max(128).required(),
  }),
};

export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    phone: Joi.string()
      .pattern(/^\+380\d{9}$/)
      .max(13)
      .required(),
    password: Joi.string().required(),
  }),
};

export const requestPasswordResetSchema = {
  [Segments.BODY]: Joi.object({
    phone: Joi.string()
      .pattern(/^\+380\d{9}$/)
      .max(30)
      .required(),
  }),
};

export const resetPasswordSchema = {
  [Segments.BODY]: Joi.object({
    phone: Joi.string()
      .pattern(/^\+380\d{9}$/)
      .required(),
    code: Joi.string().length(6).required(),
    password: Joi.string().min(8).max(128).required(),
  }),
};
