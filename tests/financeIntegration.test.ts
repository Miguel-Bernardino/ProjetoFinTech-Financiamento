import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { startServer, stopServer, resetHandlers } from './setupTests';
import express, { Request, Response, NextFunction } from 'express';
import { protectedMiddleware } from '../src/middleware/protectedMiddleware';

// Mock dos modelos Mongoose
vi.mock('../src/models/User', () => ({
  User: {
    findOne: vi.fn(async (query: any) => {
      console.log('Mocked User.findOne called with query:', query);
      if (query.email === 'test@example.com') {
        return { _id: 'user-1', email: 'test@example.com', role: 'client' };
      }
      if (query._id === 'user-1') {
        return { _id: 'user-1', email: 'test@example.com', role: 'client' };
      }
      return null;
    })
  }
}));

vi.mock('../src/models/Finance', () => ({
  Finance: {
    create: vi.fn(async (payload: any) => {
      console.log('Mocked Finance.create called with payload:', payload);
      return { _id: 'finance-1', ...payload };
    })
  }
}));

// Importar após os mocks
import financeService from '../src/services/FinanceServices';

beforeAll(() => {
  startServer();
  process.env.USER_SERVICE_URL = 'http://localhost:4000/api/users';
  process.env.VEHICLE_API_URL = 'https://api.exemplo.com/vehicle';
});

afterAll(() => stopServer());
beforeEach(() => resetHandlers());

describe('Finance Integration Tests - com middlewares', () => {
  it('should validate token through protectedMiddleware and create finance', async () => {
    // Simular uma requisição Express
    const mockReq = {
      headers: {
        authorization: 'Bearer valid-token'
      },
      user: undefined,
      body: {}
    } as any;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any;

    const mockNext = vi.fn();

    // Executar protectedMiddleware (vai chamar USER_SERVICE_URL/validate-token)
    await new Promise<void>((resolve) => {
      protectedMiddleware(mockReq, mockRes, () => {
        mockNext();
        resolve();
      });
    });

  // Verificar que o middleware populou req.user com _id, email e role
  expect(mockNext).toHaveBeenCalled();
  expect(mockReq.user).toBeDefined();
  expect(mockReq.user.email).toBe('test@example.com');
  expect(mockReq.user._id).toBe('user-1');

    console.log('req.user após protectedMiddleware:', mockReq.user);

    // Usar o _id diretamente de req.user (sem necessidade de UserMiddleware)
    const userId = mockReq.user._id;

    // Agora criar o financiamento usando o userId obtido
    const payload = {
      userId,
      value: 20000,
      countOfMonths: 12,
      brand: 'Toyota',
      modelName: 'Corolla',
      type: 'Sedan'
    } as any;

    const result = await financeService.createFinance(userId, payload);
    console.log(result)
    expect(result.status).toBe(201);
    expect(result.finance).toBeDefined();
    expect(result.finance.vehicleSpecs).toBeDefined();
    expect(result.finance.vehicleSpecs.brand).toBe('Toyota');
  });

  it('should return 401 when token is invalid', async () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer invalid-token'
      },
      user: undefined,
      body: {}
    } as any;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any;

    const mockNext = vi.fn();

    // Executar protectedMiddleware com token inválido
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        // O middleware não chama next() em caso de erro
        if (!mockNext.mock.calls.length) {
          resolve();
        }
      }, 500);

      protectedMiddleware(mockReq, mockRes, () => {
        mockNext();
        resolve();
      });
    });

    // Middleware não deve ter chamado next()
    expect(mockNext).not.toHaveBeenCalled();
    // Deve ter retornado 401
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });
});
