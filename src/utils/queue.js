import prisma from '../config/prismaClient.js';
import { LoanHistoryStack } from './stack.js';

/**
 * Clase que representa una Cola FIFO (First-In, First-Out) para solicitudes de préstamo.
 * La persistencia de datos se maneja a través de PostgreSQL con Prisma.
 */
export class LoanRequestQueue {
  /**
   * Encola una nueva solicitud de préstamo (FIFO: se añade al final de la cola por orden de llegada)
   * @param {string} userId - ID del usuario solicitante
   * @param {string} bookId - ID del libro solicitado
   * @returns {Promise<Object>} - Retorna la solicitud creada
   */
  static async enqueue(userId, bookId) {
    // 1. Verificar si ya existe una solicitud activa de este usuario para este libro
    const existing = await prisma.loanRequest.findFirst({
      where: {
        userId,
        bookId,
        status: 'PENDING',
      },
    });

    if (existing) {
      throw new Error('Ya tienes una solicitud pendiente para este libro.');
    }

    // 2. Crear la solicitud de préstamo en la BD (Cola FIFO)
    const request = await prisma.loanRequest.create({
      data: {
        userId,
        bookId,
        status: 'PENDING',
      },
    });

    // 3. Registrar el evento en la pila LIFO de historial
    await LoanHistoryStack.push(
      'LOAN_REQUEST',
      userId,
      bookId,
      `Usuario solicitó préstamo del libro. ID Solicitud: ${request.id}`
    );

    return request;
  }

  /**
   * Desencola y procesa la siguiente solicitud en la cola FIFO para un libro específico
   * @param {string} bookId - ID del libro
   * @param {string} librarianId - ID del bibliotecario que aprueba (para auditoría)
   * @returns {Promise<Object|null>} - Retorna el préstamo creado o null
   */
  static async dequeue(bookId, librarianId) {
    // 1. Obtener la solicitud más antigua (FIFO: ordenar por fecha de creación ascendente)
    const nextRequest = await prisma.loanRequest.findFirst({
      where: {
        bookId,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'asc', // FIFO
      },
    });

    if (!nextRequest) {
      return null;
    }

    // 2. Ejecutar aprobación en una transacción
    return await prisma.$transaction(async (tx) => {
      // Verificar si el libro aún tiene copias disponibles
      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book || book.availableCopies <= 0) {
        throw new Error('No hay copias disponibles de este libro para aprobar el préstamo.');
      }

      // Actualizar estado del libro (restar copia disponible)
      await tx.book.update({
        where: { id: bookId },
        data: { availableCopies: book.availableCopies - 1 },
      });

      // Cambiar estado de la solicitud a APPROVED
      await tx.loanRequest.update({
        where: { id: nextRequest.id },
        data: { status: 'APPROVED' },
      });

      // Calcular fecha de vencimiento (por defecto 14 días)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Crear el préstamo
      const loan = await tx.loan.create({
        data: {
          bookId,
          userId: nextRequest.userId,
          dueDate,
          status: 'ACTIVE',
        },
      });

      // Registrar acción en el historial LIFO (Pila)
      await tx.loanHistory.create({
        data: {
          action: 'LOAN_APPROVED',
          userId: nextRequest.userId,
          bookId,
          details: `Préstamo aprobado por el bibliotecario. Préstamo ID: ${loan.id}.`,
        },
      });

      return loan;
    });
  }

  /**
   * Obtiene la solicitud más antigua sin extraerla de la cola (FIFO: Peek)
   * @param {string} bookId - ID del libro
   * @returns {Promise<Object|null>}
   */
  static async peek(bookId) {
    return await prisma.loanRequest.findFirst({
      where: {
        bookId,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }

  /**
   * Obtiene todas las solicitudes pendientes en la cola (recorrido ordenado de la cola FIFO)
   * @param {string} [bookId] - Filtro opcional por libro
   * @returns {Promise<Array>}
   */
  static async getQueue(bookId) {
    const whereClause = { status: 'PENDING' };
    if (bookId) {
      whereClause.bookId = bookId;
    }

    return await prisma.loanRequest.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'asc', // FIFO
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, author: true } },
      },
    });
  }

  /**
   * Rechaza una solicitud de la cola
   * @param {string} requestId - ID de la solicitud
   * @returns {Promise<Object>}
   */
  static async rejectRequest(requestId) {
    const request = await prisma.loanRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== 'PENDING') {
      throw new Error('La solicitud no existe o ya no está pendiente.');
    }

    const updatedRequest = await prisma.loanRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    await LoanHistoryStack.push(
      'LOAN_REJECTED',
      request.userId,
      request.bookId,
      `Solicitud de préstamo rechazada.`
    );

    return updatedRequest;
  }
}
