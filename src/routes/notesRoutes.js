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
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
  getAllNotesSchema,
} from "../validations/notesValidation.js";

const router = Router();

router.get(
  "/notes",
  celebrate({ [Segments.QUERY]: getAllNotesSchema }),
  getAllNotes
);

router.get(
  "/notes/:noteId",
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  getNoteById
);

router.post(
  "/notes",
  celebrate({ [Segments.BODY]: createNoteSchema }),
  createNote
);

router.patch(
  "/notes/:noteId",
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  celebrate({ [Segments.BODY]: updateNoteSchema }),
  updateNote
);

router.delete(
  "/notes/:noteId",
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  deleteNote
);

export default router;
