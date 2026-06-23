import { Joi, Segments } from 'celebrate';

const passwordSchema = Joi.string().min(10).max(128);

export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(3).max(32).required(),
    phone: Joi.string()
      .pattern(/^\+380\d{9}$/)
      .max(13)
      .required(),
    password: passwordSchema.required(),
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
    password: passwordSchema.required(),
  }),
};
