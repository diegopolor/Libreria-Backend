import app from './app.js';
import prisma from './config/prismaClient.js';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`===================================================`);
});

prisma.$connect().then(() => {
  console.log('Conectado a la base de datos');
}).catch((error) => {
  console.error('Error al conectar con la base de datos:', error.message);
  process.exit(1);
});
