import { celebrate, Joi, Segments } from 'celebrate';

export const productValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    price: Joi.number().min(0).allow(null).optional(),
  }),
});

export const orderValidation = celebrate({
  [Segments.BODY]: Joi.object({
    payment: Joi.string().valid('card', 'cash').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().positive().required(),
    items: Joi.array().items(Joi.string().required()).min(1).required(),
  }),
});
