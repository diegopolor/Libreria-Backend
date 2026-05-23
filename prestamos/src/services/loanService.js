import prisma from '../config/prismaClient.js';
import { LoanRequestQueue } from '../utils/queue.js';
import { LoanHistoryStack } from '../utils/stack.js';

export class LoanService {
  static async requestLoan(userId, bookId) {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error('El libro solicitado no existe.');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('El usuario no existe.');

    const activeLoan = await prisma.loan.findFirst({ where: { userId, bookId, status: 'ACTIVE' } });
    if (activeLoan) throw new Error('Ya tienes un préstamo activo de este libro.');

    const request = await LoanRequestQueue.enqueue(userId, bookId);
    const nextInQueue = await LoanRequestQueue.peek(bookId);

    if (nextInQueue && nextInQueue.id === request.id && book.availableCopies > 0) {
      const loan = await LoanRequestQueue.dequeue(bookId, null);
      return { request: { ...request, status: 'APPROVED' }, loan };
    }

    return { request, loan: null, message: 'La solicitud ha sido encolada (sin copias disponibles o hay cola de espera).' };
  }

  static async returnBook(loanId) {
    const loan = await prisma.loan.findUnique({ where: { id: loanId }, include: { book: true } });
    if (!loan || loan.status !== 'ACTIVE') throw new Error('El préstamo no existe o ya ha sido devuelto.');

    const updatedLoan = await prisma.$transaction(async (tx) => {
      const completedLoan = await tx.loan.update({ where: { id: loanId }, data: { returnDate: new Date(), status: 'RETURNED' } });
      const updatedBook = await tx.book.update({ where: { id: loan.bookId }, data: { availableCopies: loan.book.availableCopies + 1 } });
      await tx.loanHistory.create({ data: { action: 'BOOK_RETURNED', userId: loan.userId, bookId: loan.bookId, details: `Libro devuelto. Préstamo ID: ${loan.id}. Copias disponibles: ${updatedBook.availableCopies}` } });
      return completedLoan;
    });

    try {
      const nextRequest = await LoanRequestQueue.peek(loan.bookId);
      if (nextRequest) await LoanRequestQueue.dequeue(loan.bookId, null);
    } catch (queueError) {
      console.error('Error al procesar la cola tras devolución:', queueError.message);
    }

    return updatedLoan;
  }

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

  static async getHistory(userId = null) {
    return await LoanHistoryStack.getStack(userId);
  }

  static async getRequestQueue(bookId = null) {
    return await LoanRequestQueue.getQueue(bookId);
  }

  static async rejectLoanRequest(requestId) {
    return await LoanRequestQueue.rejectRequest(requestId);
  }

  static async approveLoanRequest(requestId) {
    const request = await prisma.loanRequest.findUnique({ where: { id: requestId }, include: { book: true } });
    if (!request || request.status !== 'PENDING') throw new Error('La solicitud no está pendiente.');
    if (request.book.availableCopies <= 0) throw new Error('No hay copias disponibles.');
    return await LoanRequestQueue.dequeue(request.bookId, null);
  }
}
