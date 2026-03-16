import createHttpError from "http-errors";
import { Note } from "../models/note.js";

export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;

  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const currentPerPage = Number(perPage) > 0 ? Number(perPage) : 10;

  const filter = {};

  if (tag) {
    filter.tag = tag;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  const totalItems = await Note.countDocuments(filter);

  const notes = await Note.find(filter)
    .skip((currentPage - 1) * currentPerPage)
    .limit(currentPerPage)
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalItems / currentPerPage) || 1;

  res.status(200).json({
    page: currentPage,
    perPage: currentPerPage,
    totalItems,
    totalPages,
    notes,
  });
};

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findById(noteId);

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const note = await Note.create(req.body);

  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findByIdAndDelete(noteId);

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findByIdAndUpdate(noteId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};
