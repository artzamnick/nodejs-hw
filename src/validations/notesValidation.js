import { Joi } from "celebrate";
import { TAGS } from "../constants/tags.js";

export const createNoteSchema = Joi.object({
  title: Joi.string().min(3).max(50).required(),
  content: Joi.string().allow("").optional(),
  tag: Joi.string().valid(...TAGS).optional(),
});

export const updateNoteSchema = Joi.object({
  title: Joi.string().min(3).max(50).optional(),
  content: Joi.string().allow("").optional(),
  tag: Joi.string().valid(...TAGS).optional(),
})
  .min(1)
  .messages({
    "object.min": "Body must have at least one field",
  });
