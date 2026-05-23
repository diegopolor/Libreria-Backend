import prisma from '../config/prismaClient.js';
import { LoanHistoryStack } from './stack.js';

export class LoanRequestQueue {
  static async enqueue(userId, bookId) {
    const existing = await prisma.loanRequest.findFirst({ where: { userId, bookId, status: 'PENDING' } });
    if (existing) throw new Error('Ya tienes una solicitud pendiente para este libro.');
    const request = await prisma.loanRequest.create({ data: { userId, bookId, status: 'PENDING' } });
    await LoanHistoryStack.push('LOAN_REQUEST', userId, bookId, `Usuario solicitó préstamo del libro. ID Solicitud: ${request.id}`);
    return request;
  }

  static async dequeue(bookId, librarianId) {
    const nextRequest = await prisma.loanRequest.findFirst({ where: { bookId, status: 'PENDING' }, orderBy: { createdAt: 'asc' } });
    if (!nextRequest) return null;

    return await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book || book.availableCopies <= 0) throw new Error('No hay copias disponibles.');
      await tx.book.update({ where: { id: bookId }, data: { availableCopies: book.availableCopies - 1 } });
      await tx.loanRequest.update({ where: { id: nextRequest.id }, data: { status: 'APPROVED' } });
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      const loan = await tx.loan.create({ data: { bookId, userId: nextRequest.userId, dueDate, status: 'ACTIVE' } });
      await tx.loanHistory.create({ data: { action: 'LOAN_APPROVED', userId: nextRequest.userId, bookId, details: `Préstamo aprobado. ID: ${loan.id}.` } });
      return loan;
    });
  }

  static async peek(bookId) {
    return await prisma.loanRequest.findFirst({ where: { bookId, status: 'PENDING' }, orderBy: { createdAt: 'asc' }, include: { user: { select: { name: true, email: true } } } });
  }

  static async getQueue(bookId) {
    const whereClause = { status: 'PENDING' };
    if (bookId) whereClause.bookId = bookId;
    return await prisma.loanRequest.findMany({ where: whereClause, orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, name: true, email: true } }, book: { select: { id: true, title: true, author: true } } } });
  }

  static async rejectRequest(requestId) {
    const request = await prisma.loanRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'PENDING') throw new Error('La solicitud no existe o ya no está pendiente.');
    const updatedRequest = await prisma.loanRequest.update({ where: { id: requestId }, data: { status: 'REJECTED' } });
    await LoanHistoryStack.push('LOAN_REJECTED', request.userId, request.bookId, 'Solicitud de préstamo rechazada.');
    return updatedRequest;
  }
}
