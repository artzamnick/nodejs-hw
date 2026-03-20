import { Router } from "express";
import { celebrate, Segments } from "celebrate";

import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from "../controllers/notesController.js";

import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from "../validations/notesValidation.js";

import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get(
  "/notes",
  authenticate,
  celebrate({
    [Segments.QUERY]: getAllNotesSchema,
  }),
  getAllNotes
);

router.get(
  "/notes/:noteId",
  authenticate,
  celebrate({
    [Segments.PARAMS]: noteIdSchema,
  }),
  getNoteById
);

router.post(
  "/notes",
  authenticate,
  celebrate({
    [Segments.BODY]: createNoteSchema,
  }),
  createNote
);

router.patch(
  "/notes/:noteId",
  authenticate,
  celebrate({
    [Segments.PARAMS]: noteIdSchema,
    [Segments.BODY]: updateNoteSchema,
  }),
  updateNote
);

router.delete(
  "/notes/:noteId",
  authenticate,
  celebrate({
    [Segments.PARAMS]: noteIdSchema,
  }),
  deleteNote
);

export default router;
