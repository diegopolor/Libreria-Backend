import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el sembrado de la base de datos...');

  await prisma.loanHistory.deleteMany();
  await prisma.loanRequest.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashLibrarian = await bcrypt.hash('librarian123', 10);
  const passwordHashClient = await bcrypt.hash('client123', 10);

  await prisma.user.create({ data: { email: 'admin@biblioteca.com', passwordHash: passwordHashAdmin, name: 'Administrador General', role: 'ADMIN' } });
  await prisma.user.create({ data: { email: 'librarian@biblioteca.com', passwordHash: passwordHashLibrarian, name: 'María la Bibliotecaria', role: 'LIBRARIAN' } });
  await prisma.user.create({ data: { email: 'client@biblioteca.com', passwordHash: passwordHashClient, name: 'Juan Pérez', role: 'CLIENT' } });

  console.log('Usuarios creados.');
  console.log('Base de datos inicializada correctamente.');
}

main()
  .catch((e) => { console.error('Error al ejecutar el seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
