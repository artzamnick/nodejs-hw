import { Joi } from "celebrate";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
});
