import { CategoryService } from '../services/categoryService.js';

export const createCategory = async (req, res) => {
  try { return res.status(201).json(await CategoryService.createCategory(req.body)); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};

export const getCategories = async (req, res) => {
  try { return res.status(200).json(await CategoryService.getCategories()); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

export const updateCategory = async (req, res) => {
  try { return res.status(200).json(await CategoryService.updateCategory(req.params.id, req.body)); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};

export const deleteCategory = async (req, res) => {
  try { await CategoryService.deleteCategory(req.params.id); return res.status(200).json({ message: 'Categoría eliminada exitosamente.' }); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};
