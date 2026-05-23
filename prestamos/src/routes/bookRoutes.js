import { Router } from 'express';
import { getBooks, createBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { bookValidator } from '../validators/index.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getBooks);
router.post('/', requireRole(['ADMIN', 'LIBRARIAN']), bookValidator, createBook);
router.put('/:id', requireRole(['ADMIN', 'LIBRARIAN']), bookValidator, updateBook);
router.delete('/:id', requireRole(['ADMIN', 'LIBRARIAN']), deleteBook);

export default router;
