import { AuthService } from '../services/authService.js';

export const login = async (req, res) => {
  try { return res.status(200).json(await AuthService.login(req.body.email, req.body.password)); }
  catch (error) { return res.status(401).json({ message: error.message }); }
};

export const refresh = async (req, res) => {
  try {
    if (!req.body.refreshToken) return res.status(400).json({ message: 'Refresh token es requerido.' });
    return res.status(200).json(await AuthService.refresh(req.body.refreshToken));
  } catch (error) { return res.status(401).json({ message: error.message }); }
};

export const logout = async (req, res) => res.status(200).json({ message: 'Sesión cerrada correctamente.' });
