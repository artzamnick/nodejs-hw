import { Joi } from "celebrate";
import mongoose from "mongoose";
import { TAGS } from "../constants/tags.js";

export const getAllNotesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(5).max(20).default(10),
  tag: Joi.string().valid(...TAGS),
  search: Joi.string(),
});

export const noteIdSchema = Joi.object({
  noteId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }

      return value;
    }),
});

export const createNoteSchema = Joi.object({
  title: Joi.string().min(1).required(),
  content: Joi.string().allow(""),
  tag: Joi.string().valid(...TAGS).optional(),
});

export const updateNoteSchema = Joi.object({
  title: Joi.string().min(1),
  content: Joi.string().allow(""),
  tag: Joi.string().valid(...TAGS).optional(),
}).min(1);
