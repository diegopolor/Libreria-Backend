import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { categoryValidator } from '../validators/index.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Listar categorías lo pueden hacer todos los roles autenticados
router.get('/', getCategories);

// Crear, editar y borrar categorías requiere ser ADMIN o LIBRARIAN
router.post('/', requireRole(['ADMIN', 'LIBRARIAN']), categoryValidator, createCategory);
router.put('/:id', requireRole(['ADMIN', 'LIBRARIAN']), categoryValidator, updateCategory);
router.delete('/:id', requireRole(['ADMIN', 'LIBRARIAN']), deleteCategory);

export default router;
