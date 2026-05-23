import { validationResult, body } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

export const loginValidator = [
  body('email').isEmail().withMessage('Debe proporcionar un correo electrónico válido.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  validate,
];

export const userCreateValidator = [
  body('email').isEmail().withMessage('Debe proporcionar un correo electrónico válido.'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('role').isIn(['ADMIN', 'LIBRARIAN', 'CLIENT']).withMessage('Rol no válido.'),
  validate,
];

export const userUpdateValidator = [
  body('email').isEmail().withMessage('Debe proporcionar un correo electrónico válido.'),
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('role').isIn(['ADMIN', 'LIBRARIAN', 'CLIENT']).withMessage('Rol no válido.'),
  validate,
];
