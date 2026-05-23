import prisma from '../config/prismaClient.js';

export class CategoryService {
  static async createCategory({ name, description }) {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) throw new Error('La categoría ya existe.');
    return await prisma.category.create({ data: { name, description } });
  }

  static async getCategories() {
    return await prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { books: true } } } });
  }

  static async updateCategory(id, { name, description }) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new Error('Categoría no encontrada.');
    if (name !== existing.name) {
      const conflict = await prisma.category.findUnique({ where: { name } });
      if (conflict) throw new Error('Ya existe otra categoría con este nombre.');
    }
    return await prisma.category.update({ where: { id }, data: { name, description } });
  }

  static async deleteCategory(id) {
    const existing = await prisma.category.findUnique({ where: { id }, include: { books: true } });
    if (!existing) throw new Error('Categoría no encontrada.');
    if (existing.books.length > 0) throw new Error('No se puede eliminar la categoría porque contiene libros asociados.');
    return await prisma.category.delete({ where: { id } });
  }
}
