import prisma from '../config/prismaClient.js';

export class LoanHistoryStack {
  static async push(action, userId, bookId, details) {
    return await prisma.loanHistory.create({ data: { action, userId, bookId, details } });
  }

  static async pop() {
    const topElement = await this.peek();
    if (!topElement) return null;
    return await prisma.loanHistory.delete({ where: { id: topElement.id } });
  }

  static async peek() {
    return await prisma.loanHistory.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        book: { select: { title: true } },
      },
    });
  }

  static async getStack(userId) {
    const whereClause = {};
    if (userId) whereClause.userId = userId;
    return await prisma.loanHistory.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        book: { select: { id: true, title: true, author: true } },
      },
    });
  }

  static async size() { return await prisma.loanHistory.count(); }
  static async isEmpty() { return (await this.size()) === 0; }
}
