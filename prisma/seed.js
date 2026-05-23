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

  const softwareCat = await prisma.category.create({ data: { name: 'Desarrollo de Software', description: 'Libros sobre lenguajes de programación, patrones de diseño y desarrollo web.' } });
  const mathCat = await prisma.category.create({ data: { name: 'Matemáticas y Ciencia', description: 'Textos de cálculo, física, álgebra lineal y ciencias naturales.' } });
  const fictionCat = await prisma.category.create({ data: { name: 'Ciencia Ficción', description: 'Literatura fantástica, distopías y viajes espaciales.' } });

  const booksData = [
    { title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', editorial: 'Prentice Hall', edition: '1ra Edición', publicationDate: new Date('2008-08-01'), isbn: '978-0132350884', totalCopies: 5, availableCopies: 5, categoryId: softwareCat.id },
    { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', editorial: 'Addison-Wesley', edition: '1ra Edición', publicationDate: new Date('1994-10-31'), isbn: '978-0201633610', totalCopies: 3, availableCopies: 3, categoryId: softwareCat.id },
    { title: 'Cálculo de una Variable', author: 'James Stewart', editorial: 'Cengage Learning', edition: '7ma Edición', publicationDate: new Date('2012-01-01'), isbn: '978-6074817775', totalCopies: 2, availableCopies: 2, categoryId: mathCat.id },
    { title: 'Dune', author: 'Frank Herbert', editorial: 'Chilton Books', edition: 'Edición Especial', publicationDate: new Date('1965-08-01'), isbn: '978-0441172719', totalCopies: 1, availableCopies: 1, categoryId: fictionCat.id },
    { title: 'Fahrenheit 451', author: 'Ray Bradbury', editorial: 'Ballantine Books', edition: 'Reimpresión', publicationDate: new Date('1953-10-19'), isbn: '978-1451673319', totalCopies: 4, availableCopies: 4, categoryId: fictionCat.id },
  ];

  for (const book of booksData) {
    await prisma.book.create({ data: book });
  }

  console.log('Base de datos inicializada correctamente.');
}

main()
  .catch((e) => { console.error('Error al ejecutar el seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
