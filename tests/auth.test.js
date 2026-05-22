import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import bcrypt from 'bcryptjs';

// 1. Mock de módulo antes de cualquier importación estática del módulo bajo prueba
jest.unstable_mockModule('../src/config/prismaClient.js', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

let app;
let prisma;
let request;

beforeAll(async () => {
  // Cargar prisma primero para registrar el mock en la caché de módulos
  const prismaImport = await import('../src/config/prismaClient.js');
  prisma = prismaImport.default || prismaImport;

  const supertestImport = await import('supertest');
  request = supertestImport.default || supertestImport;

  const appImport = await import('../src/app.js');
  app = appImport.default || appImport;
});

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('debería retornar un token de acceso si las credenciales son válidas', async () => {
      const mockUser = {
        id: 'user-uuid',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'CLIENT',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toEqual('test@example.com');
    });

    it('debería retornar 401 si las credenciales no son válidas', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Credenciales incorrectas.');
    });
  });
});
