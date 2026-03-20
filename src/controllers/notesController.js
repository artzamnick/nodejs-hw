import createHttpError from "http-errors";
import { Note } from "../models/note.js";

export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;
  const userId = req.user.userId;

  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const currentPerPage = Number(perPage) > 0 ? Number(perPage) : 10;

  const filter = { owner: userId };

  if (tag) {
    filter.tag = tag;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (currentPage - 1) * currentPerPage;

  const [notes, totalNotes] = await Promise.all([
    Note.find(filter).skip(skip).limit(currentPerPage),
    Note.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalNotes / currentPerPage);

  res.status(200).json({
    page: currentPage,
    perPage: currentPerPage,
    totalNotes,
    totalPages,
    notes,
  });
};

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user.userId;

  const note = await Note.findOne({
    _id: noteId,
    owner: userId,
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const userId = req.user.userId;

  const note = await Note.create({
    ...req.body,
    owner: userId,
  });

  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user.userId;

  const note = await Note.findOneAndDelete({
    _id: noteId,
    owner: userId,
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user.userId;

  const note = await Note.findOneAndUpdate(
    {
      _id: noteId,
      owner: userId,
    },
    req.body,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};
