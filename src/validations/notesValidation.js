import { Joi } from "celebrate";
import { TAGS } from "../constants/tags.js";
import mongoose from "mongoose";

export const createNoteSchema = Joi.object({
  title: Joi.string().min(1).required(),
  content: Joi.string().allow(""),
  tag: Joi.string().valid(...TAGS),
});

export const updateNoteSchema = Joi.object({
  title: Joi.string().min(1),
  content: Joi.string().allow(""),
  tag: Joi.string().valid(...TAGS),
}).min(1);

export const noteIdSchema = Joi.object({
  noteId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }),
});

export const getAllNotesSchema = Joi.object({
  page: Joi.number().integer().min(1),
  perPage: Joi.number().integer().min(1),
  tag: Joi.string().valid(...TAGS),
  search: Joi.string(),
});
