import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';

export class AuthService {
<<<<<<< HEAD
  /**
   * Autentica un usuario con email y contraseña, generando Access y Refresh Tokens.
   * @param {string} email 
   * @param {string} password 
   */
  static async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Credenciales incorrectas.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Credenciales incorrectas.');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresca un Access Token a partir de un Refresh Token válido.
   * @param {string} refreshToken 
   */
  static async refresh(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new Error('Usuario no encontrado.');
      }

      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user); // Rotación de refresh token

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken: newRefreshToken,
=======
  static async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Credenciales incorrectas.');
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error('Credenciales incorrectas.');
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  static async refresh(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) throw new Error('Usuario no encontrado.');
      return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken: this.generateAccessToken(user),
        refreshToken: this.generateRefreshToken(user),
>>>>>>> prestamos
      };
    } catch (err) {
      throw new Error('Refresh token inválido o expirado.');
    }
  }

<<<<<<< HEAD
  /**
   * Helper para generar el Access Token.
   */
  static generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  /**
   * Helper para generar el Refresh Token.
   */
  static generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
=======
  static generateAccessToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  }

  static generateRefreshToken(user) {
    return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
>>>>>>> prestamos
  }
}
