import { validationResult, body } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const loginValidator = [
  body('email').isEmail().withMessage('Debe proporcionar un correo electrónico válido.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  validate,
];

export const categoryValidator = [
  body('name').trim().notEmpty().withMessage('El nombre de la categoría es obligatorio.'),
  body('description').optional().trim(),
  validate,
];
