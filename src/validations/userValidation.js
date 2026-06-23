import { Joi, Segments } from 'celebrate';

export const updateProfileSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(3).max(32),
    lastname: Joi.string().trim().max(64).allow(''),
    city: Joi.string().trim().max(64).allow(''),
    branchnum_np: Joi.string().trim().max(64).allow(''),
  }).min(1),
};
