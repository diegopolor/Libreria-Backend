import prisma from '../config/prismaClient.js';
import { LoanRequestQueue } from '../utils/queue.js';
import { LoanHistoryStack } from '../utils/stack.js';

export class LoanService {
  /**
   * Crea una solicitud de préstamo y la encola (FIFO).
   * Si hay copias disponibles y no hay nadie en cola antes, se aprueba automáticamente.
   */
  static async requestLoan(userId, bookId) {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new Error('El libro solicitado no existe.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('El usuario no existe.');
    }

    // 1. Verificar si el usuario ya tiene un préstamo activo de este mismo libro
    const activeLoan = await prisma.loan.findFirst({
      where: {
        userId,
        bookId,
        status: 'ACTIVE',
      },
    });

    if (activeLoan) {
      throw new Error('Ya tienes un préstamo activo de este libro.');
    }

    // 2. Encolar en la Cola FIFO
    const request = await LoanRequestQueue.enqueue(userId, bookId);

    // 3. Comprobar si podemos procesar e ingresar el préstamo inmediatamente.
    // Esto ocurre si:
    // a. Hay copias disponibles.
    // b. Este usuario es el primero en la cola (FIFO: Peek es esta misma solicitud).
    const nextInQueue = await LoanRequestQueue.peek(bookId);
    
    if (nextInQueue && nextInQueue.id === request.id && book.availableCopies > 0) {
      // Dequeue la solicitud y aprueba el préstamo
      const loan = await LoanRequestQueue.dequeue(bookId, null);
      return { request: { ...request, status: 'APPROVED' }, loan };
    }

    return { request, loan: null, message: 'La solicitud ha sido encolada (sin copias disponibles o hay cola de espera).' };
  }

  /**
   * Devuelve un libro prestado y procesa la cola FIFO automáticamente.
   */
  static async returnBook(loanId) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { book: true },
    });

    if (!loan || loan.status !== 'ACTIVE') {
      throw new Error('El préstamo no existe o ya ha sido devuelto.');
    }

    // Registrar devolución en transacción
    const updatedLoan = await prisma.$transaction(async (tx) => {
      // 1. Actualizar el préstamo
      const completedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          returnDate: new Date(),
          status: 'RETURNED',
        },
      });

      // 2. Incrementar copias disponibles
      const updatedBook = await tx.book.update({
        where: { id: loan.bookId },
        data: {
          availableCopies: loan.book.availableCopies + 1,
        },
      });

      // 3. Registrar en la Pila LIFO de historial
      await tx.loanHistory.create({
        data: {
          action: 'BOOK_RETURNED',
          userId: loan.userId,
          bookId: loan.bookId,
          details: `Libro devuelto. Préstamo ID: ${loan.id}. Copias disponibles ahora: ${updatedBook.availableCopies}`,
        },
      });

      return completedLoan;
    });

    // 4. Procesar la cola FIFO automáticamente para este libro:
    // Si hay solicitudes pendientes y ahora hay una copia disponible, se le asigna al siguiente
    try {
      const nextRequest = await LoanRequestQueue.peek(loan.bookId);
      if (nextRequest) {
        await LoanRequestQueue.dequeue(loan.bookId, null);
      }
    } catch (queueError) {
      console.error('Error al procesar la cola tras devolución:', queueError.message);
    }

    return updatedLoan;
  }

  /**
   * Obtiene la lista de préstamos según filtros
   */
  static async getLoans(filters = {}) {
    const { userId, status, bookId } = filters;
    const where = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (bookId) where.bookId = bookId;

    return await prisma.loan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, author: true } },
      },
    });
  }

  /**
   * Devuelve el historial en orden de Pila LIFO
   */
  static async getHistory(userId = null) {
    return await LoanHistoryStack.getStack(userId);
  }

  /**
   * Devuelve la cola de solicitudes pendiente (FIFO)
   */
  static async getRequestQueue(bookId = null) {
    return await LoanRequestQueue.getQueue(bookId);
  }

  /**
   * Rechaza una solicitud de préstamo directamente
   */
  static async rejectLoanRequest(requestId) {
    return await LoanRequestQueue.rejectRequest(requestId);
  }

  /**
   * Aprueba manualmente una solicitud si hay copias (para uso del bibliotecario si quiere forzarlo)
   */
  static async approveLoanRequest(requestId) {
    const request = await prisma.loanRequest.findUnique({
      where: { id: requestId },
      include: { book: true },
    });

    if (!request || request.status !== 'PENDING') {
      throw new Error('La solicitud no está pendiente.');
    }

    if (request.book.availableCopies <= 0) {
      throw new Error('No hay copias disponibles para aprobar esta solicitud.');
    }

    // Aprobamos desencolando
    const loan = await LoanRequestQueue.dequeue(request.bookId, null);
    return loan;
  }
}
