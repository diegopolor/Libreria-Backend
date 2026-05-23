import bcrypt from 'bcryptjs';
import prisma from '../config/prismaClient.js';

export class UserService {
  static async createUser({ email, password, name, role }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('El correo electrónico ya está registrado.');
    const passwordHash = await bcrypt.hash(password, 10);
    return await prisma.user.create({
      data: { email, passwordHash, name, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  static async getUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  static async updateUser(id, { email, name, role, password }) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new Error('Usuario no encontrado.');
    if (email !== existing.email) {
      const emailConflict = await prisma.user.findUnique({ where: { email } });
      if (emailConflict) throw new Error('El correo electrónico ya está en uso por otro usuario.');
    }
    const data = { email, name, role };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);
    return await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, updatedAt: true },
    });
  }

  static async deleteUser(id) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new Error('Usuario no encontrado.');
    return await prisma.user.delete({ where: { id } });
  }
}
