import { Router } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { celebrate, Segments } from "celebrate";

import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from "../controllers/notesController.js";

import {
  createNoteSchema,
  updateNoteSchema,
} from "../validations/notesValidation.js";

const router = Router();

const validateIdParam = (req, res, next) => {
  const { noteId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return next(createHttpError(400, "Invalid note id"));
  }

  next();
};

router.get("/notes", getAllNotes);

router.get("/notes/:noteId", validateIdParam, getNoteById);

router.post(
  "/notes",
  celebrate({
    [Segments.BODY]: createNoteSchema,
  }),
  createNote,
);

router.patch(
  "/notes/:noteId",
  validateIdParam,
  celebrate({
    [Segments.BODY]: updateNoteSchema,
  }),
  updateNote,
);

router.delete("/notes/:noteId", validateIdParam, deleteNote);

export default router;
