import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token de acceso no proporcionado.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expirado', code: 'TOKEN_EXPIRED' });
      return res.status(403).json({ message: 'Token inválido o manipulado.' });
    }
    req.user = user;
    next();
  });
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado.' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Acceso denegado: permisos insuficientes.' });
    next();
  };
};
