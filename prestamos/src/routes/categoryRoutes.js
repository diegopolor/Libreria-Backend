import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { categoryValidator } from '../validators/index.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getCategories);
router.post('/', requireRole(['ADMIN', 'LIBRARIAN']), categoryValidator, createCategory);
router.put('/:id', requireRole(['ADMIN', 'LIBRARIAN']), categoryValidator, updateCategory);
router.delete('/:id', requireRole(['ADMIN', 'LIBRARIAN']), deleteCategory);

export default router;
