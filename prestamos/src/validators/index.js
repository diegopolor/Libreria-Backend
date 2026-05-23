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

export const bookValidator = [
  body('title').trim().notEmpty().withMessage('El título es obligatorio.'),
  body('author').trim().notEmpty().withMessage('El autor es obligatorio.'),
  body('editorial').trim().notEmpty().withMessage('La editorial es obligatoria.'),
  body('edition').trim().notEmpty().withMessage('La edición es obligatoria.'),
  body('publicationDate').isISO8601().withMessage('La fecha de publicación debe ser una fecha válida (ISO 8601).'),
  body('isbn').trim().notEmpty().withMessage('El ISBN es obligatorio.'),
  body('totalCopies').isInt({ min: 1 }).withMessage('Debe haber al menos 1 copia total.'),
  body('categoryId').isUUID().withMessage('La categoría es obligatoria y debe ser un UUID válido.'),
  validate,
];

export const categoryValidator = [
  body('name').trim().notEmpty().withMessage('El nombre de la categoría es obligatorio.'),
  body('description').optional().trim(),
  validate,
];
