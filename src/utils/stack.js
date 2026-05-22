import prisma from '../config/prismaClient.js';

/**
 * Clase que representa una Pila LIFO (Last-In, First-Out) para el historial de transacciones de la biblioteca.
 * La persistencia de datos se maneja a través de PostgreSQL con Prisma.
 */
export class LoanHistoryStack {
  /**
   * Apila un nuevo evento en el historial (LIFO: se inserta como el más reciente)
   * @param {string} action - Tipo de acción (e.g., 'LOAN_REQUEST', 'BOOK_RETURNED')
   * @param {string} userId - ID del usuario involucrado
   * @param {string} bookId - ID del libro involucrado
   * @param {string} details - Descripción del evento
   * @returns {Promise<Object>} - Registro de historial creado
   */
  static async push(action, userId, bookId, details) {
    return await prisma.loanHistory.create({
      data: {
        action,
        userId,
        bookId,
        details,
      },
    });
  }

  /**
   * Desapila y remueve el evento más reciente del historial (LIFO: Pop)
   * @returns {Promise<Object|null>} - Registro removido o null si la pila está vacía
   */
  static async pop() {
    const topElement = await this.peek();
    if (!topElement) {
      return null;
    }

    return await prisma.loanHistory.delete({
      where: { id: topElement.id },
    });
  }

  /**
   * Obtiene el evento más reciente de la pila sin removerlo (LIFO: Peek)
   * @returns {Promise<Object|null>}
   */
  static async peek() {
    return await prisma.loanHistory.findFirst({
      orderBy: {
        createdAt: 'desc', // LIFO: el más reciente está arriba
      },
      include: {
        user: { select: { name: true, email: true } },
        book: { select: { title: true } },
      },
    });
  }

  /**
   * Retorna todo el historial ordenado de forma LIFO (del más reciente al más antiguo)
   * @param {string} [userId] - Filtro opcional por usuario
   * @returns {Promise<Array>}
   */
  static async getStack(userId) {
    const whereClause = {};
    if (userId) {
      whereClause.userId = userId;
    }

    return await prisma.loanHistory.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc', // LIFO: el más reciente se muestra primero
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        book: { select: { id: true, title: true, author: true } },
      },
    });
  }

  /**
   * Retorna el tamaño actual de la pila de historial
   * @returns {Promise<number>}
   */
  static async size() {
    return await prisma.loanHistory.count();
  }

  /**
   * Verifica si la pila está vacía
   * @returns {Promise<boolean>}
   */
  static async isEmpty() {
    const count = await this.size();
    return count === 0;
  }
}
