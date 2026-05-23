import { CategoryService } from '../services/categoryService.js';

export const createCategory = async (req, res) => {
  try {
    const category = await CategoryService.createCategory(req.body);
    return res.status(201).json(category);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await CategoryService.getCategories();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryService.updateCategory(id, req.body);
    return res.status(200).json(category);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await CategoryService.deleteCategory(id);
    return res.status(200).json({ message: 'Categoría eliminada exitosamente.' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
