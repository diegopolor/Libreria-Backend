import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';

// 1. Mock de módulo antes de cualquier importación estática
jest.unstable_mockModule('../src/config/prismaClient.js', () => {
  const mockPrisma = {
    book: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    loan: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    loanRequest: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    loanHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  return {
    __esModule: true,
    default: mockPrisma,
  };
});

let prisma;
let LoanService;
let LoanHistoryStack;

beforeAll(async () => {
  const prismaImport = await import('../src/config/prismaClient.js');
  prisma = prismaImport.default || prismaImport;

  const loanServiceImport = await import('../src/services/loanService.js');
  LoanService = loanServiceImport.LoanService;

  const stackImport = await import('../src/utils/stack.js');
  LoanHistoryStack = stackImport.LoanHistoryStack;
});

describe('Loan Service and Custom Data Structures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FIFO Queue & Loan Requests', () => {
    it('debería encolar una solicitud de préstamo si no hay copias disponibles', async () => {
      const mockBook = { id: 'book-1', title: 'Clean Code', availableCopies: 0, totalCopies: 5 };
      const mockUser = { id: 'user-1', name: 'John Doe' };

      prisma.book.findUnique.mockResolvedValue(mockBook);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      // No existe solicitud previa
      prisma.loanRequest.findFirst.mockResolvedValue(null);
      // Simular creación en cola
      prisma.loanRequest.create.mockResolvedValue({
        id: 'request-1',
        userId: 'user-1',
        bookId: 'book-1',
        status: 'PENDING',
      });

      const result = await LoanService.requestLoan('user-1', 'book-1');

      expect(result.request.status).toEqual('PENDING');
      expect(result.loan).toBeNull();
      expect(result.message).toContain('La solicitud ha sido encolada');
      expect(prisma.loanRequest.create).toHaveBeenCalled();
    });
  });

  describe('LIFO Stack & History', () => {
    it('debería empujar una acción a la pila de historial y permitir recuperarla', async () => {
      const mockHistoryRecord = {
        id: 'history-1',
        action: 'LOAN_REQUEST',
        userId: 'user-1',
        bookId: 'book-1',
        details: 'Usuario solicitó préstamo',
        createdAt: new Date(),
      };

      prisma.loanHistory.create.mockResolvedValue(mockHistoryRecord);
      prisma.loanHistory.findMany.mockResolvedValue([mockHistoryRecord]);

      const pushed = await LoanHistoryStack.push('LOAN_REQUEST', 'user-1', 'book-1', 'Usuario solicitó préstamo');
      expect(pushed.action).toEqual('LOAN_REQUEST');
      expect(prisma.loanHistory.create).toHaveBeenCalled();

      const stack = await LoanHistoryStack.getStack();
      expect(stack.length).toEqual(1);
      expect(stack[0].action).toEqual('LOAN_REQUEST');
    });
  });
});
