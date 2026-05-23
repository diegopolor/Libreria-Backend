import { Router } from 'express';
import { login, refresh, logout } from '../controllers/authController.js';
import { loginValidator } from '../validators/index.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', loginValidator, login);
router.post('/refresh', refresh);
router.post('/logout', authenticateToken, logout);

export default router;
