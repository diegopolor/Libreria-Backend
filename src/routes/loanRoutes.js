import { Router } from 'express';
import { requestLoan, returnBook, getLoans, getHistory, getRequestQueue, approveRequest, rejectRequest } from '../controllers/loanController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/request', requestLoan);
router.get('/history', getHistory);
router.get('/', getLoans);

router.post('/:id/return', requireRole(['ADMIN', 'LIBRARIAN']), returnBook);
router.get('/queue', requireRole(['ADMIN', 'LIBRARIAN']), getRequestQueue);
router.post('/requests/:id/approve', requireRole(['ADMIN', 'LIBRARIAN']), approveRequest);
router.post('/requests/:id/reject', requireRole(['ADMIN', 'LIBRARIAN']), rejectRequest);

export default router;
