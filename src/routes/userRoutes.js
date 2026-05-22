import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { userCreateValidator, userUpdateValidator } from '../validators/index.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de usuarios requieren ser administrador
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/', getUsers);
router.post('/', userCreateValidator, createUser);
router.put('/:id', userUpdateValidator, updateUser);
router.delete('/:id', deleteUser);

export default router;
