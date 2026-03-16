import { Router } from "express";
import createHttpError from "http-errors";

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
  isValidId,
} from "../validations/notesValidation.js";

import { validateBody } from "../middleware/validateBody.js";

const router = Router();

const validateIdParam = (req, res, next) => {
  const { noteId } = req.params;

  if (!isValidId(noteId)) {
    return next(createHttpError(400, "Invalid note id"));
  }

  next();
};

router.get("/notes", getAllNotes);

router.get("/notes/:noteId", validateIdParam, getNoteById);

router.post("/notes", validateBody(createNoteSchema), createNote);

router.patch(
  "/notes/:noteId",
  validateIdParam,
  validateBody(updateNoteSchema),
  updateNote,
);

router.delete("/notes/:noteId", validateIdParam, deleteNote);

export default router;
