import { AuthService } from '../services/authService.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token es requerido.' });
    }
    const result = await AuthService.refresh(refreshToken);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  // Para una autenticación JWT sin estado, el cliente simplemente descarta el token.
  // Enviamos una respuesta exitosa.
  return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
};
