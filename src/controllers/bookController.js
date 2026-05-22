import { BookService } from '../services/bookService.js';

export const createBook = async (req, res) => {
  try {
    const book = await BookService.createBook(req.body);
    return res.status(201).json(book);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getBooks = async (req, res) => {
  try {
    const { title, author, editorial, categoryId, edition, year, sortBy, sortOrder } = req.query;
    const books = await BookService.getBooks({
      title,
      author,
      editorial,
      categoryId,
      edition,
      year,
      sortBy,
      sortOrder,
    });
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await BookService.updateBook(id, req.body);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    await BookService.deleteBook(id);
    return res.status(200).json({ message: 'Libro eliminado exitosamente.' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
