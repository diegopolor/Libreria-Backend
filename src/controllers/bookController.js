import { BookService } from '../services/bookService.js';

export const createBook = async (req, res) => {
  try { return res.status(201).json(await BookService.createBook(req.body)); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};

export const getBooks = async (req, res) => {
  try {
    const { title, author, editorial, categoryId, edition, year, sortBy, sortOrder } = req.query;
    return res.status(200).json(await BookService.getBooks({ title, author, editorial, categoryId, edition, year, sortBy, sortOrder }));
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

export const updateBook = async (req, res) => {
  try { return res.status(200).json(await BookService.updateBook(req.params.id, req.body)); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};

export const deleteBook = async (req, res) => {
  try { await BookService.deleteBook(req.params.id); return res.status(200).json({ message: 'Libro eliminado exitosamente.' }); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};
