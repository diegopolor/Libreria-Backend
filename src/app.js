import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import loanRoutes from './routes/loanRoutes.js';

dotenv.config();

const app = express();

// Middlewares globales de seguridad e informes
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Ruta de estado de la API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servicio en línea.' });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/loans', loanRoutes);

// Middleware para manejo de errores global (SRP)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Ocurrió un error inesperado en el servidor.',
  });
});

export default app;
