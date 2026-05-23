import prisma from '../config/prismaClient.js';

export class BookService {
  static async createBook(data) {
    const existing = await prisma.book.findUnique({ where: { isbn: data.isbn } });
    if (existing) throw new Error('Ya existe un libro registrado con este ISBN.');
    return await prisma.book.create({ data: { ...data, publicationDate: new Date(data.publicationDate), availableCopies: data.totalCopies }, include: { category: true } });
  }

  static async getBooks(filters = {}) {
    const { title, author, editorial, categoryId, edition, year, sortBy, sortOrder } = filters;
    const where = {};
    if (title) where.title = { contains: title, mode: 'insensitive' };
    if (author) where.author = { contains: author, mode: 'insensitive' };
    if (editorial) where.editorial = { contains: editorial, mode: 'insensitive' };
    if (categoryId) where.categoryId = categoryId;
    if (edition) where.edition = { contains: edition, mode: 'insensitive' };
    if (year) where.publicationDate = { gte: new Date(`${year}-01-01T00:00:00.000Z`), lte: new Date(`${year}-12-31T23:59:59.999Z`) };
    const orderBy = {};
    if (sortBy === 'alphabetical' || sortBy === 'title') orderBy.title = sortOrder === 'desc' ? 'desc' : 'asc';
    else if (sortBy === 'publicationDate' || sortBy === 'date') orderBy.publicationDate = sortOrder === 'desc' ? 'desc' : 'asc';
    else orderBy.createdAt = 'desc';
    return await prisma.book.findMany({ where, orderBy, include: { category: true, _count: { select: { loans: { where: { status: 'ACTIVE' } }, loanRequests: { where: { status: 'PENDING' } } } } } });
  }

  static async updateBook(id, data) {
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) throw new Error('Libro no encontrado.');
    if (data.isbn && data.isbn !== existing.isbn) {
      const conflict = await prisma.book.findUnique({ where: { isbn: data.isbn } });
      if (conflict) throw new Error('Ya existe un libro registrado con este ISBN.');
    }
    let availableCopies = existing.availableCopies;
    if (data.totalCopies !== undefined) {
      availableCopies = existing.availableCopies + (data.totalCopies - existing.totalCopies);
      if (availableCopies < 0) throw new Error('No puedes reducir el total de copias por debajo del número de copias prestadas.');
    }
    const updateData = { ...data };
    if (data.publicationDate) updateData.publicationDate = new Date(data.publicationDate);
    updateData.availableCopies = availableCopies;
    return await prisma.book.update({ where: { id }, data: updateData, include: { category: true } });
  }

  static async deleteBook(id) {
    const existing = await prisma.book.findUnique({ where: { id }, include: { loans: { where: { status: 'ACTIVE' } } } });
    if (!existing) throw new Error('Libro no encontrado.');
    if (existing.loans.length > 0) throw new Error('No se puede eliminar el libro porque hay préstamos activos.');
    return await prisma.book.delete({ where: { id } });
  }
}
