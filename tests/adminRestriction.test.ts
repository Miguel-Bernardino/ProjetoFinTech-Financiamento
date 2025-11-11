import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { startServer, stopServer, resetHandlers, server } from './setupTests';
import { protectedMiddleware } from '../src/middleware/protectedMiddleware';
import { http, HttpResponse} from 'msw';

// Mock dos modelos Mongoose
vi.mock('../src/models/User', () => ({
  User: {
    findOne: vi.fn(async (query: any) => {
      console.log('Mocked User.findOne called with query:', query);
      if (query.email === 'admin@example.com') {
        return { _id: 'admin-1', email: 'admin@example.com', role: 'admin' };
      }
      if (query._id === 'admin-1') {
        return { _id: 'admin-1', email: 'admin@example.com', role: 'admin' };
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
import { CreateFinance, GetFinancesByUserId, GetFinanceById, FullUpdateFinance, PartialUpdateFinance, DeleteFinance } from '../src/controllers/financeController';

beforeAll(() => {
  startServer();
  process.env.USER_SERVICE_URL = 'http://localhost:4000/api/users';
  process.env.VEHICLE_API_URL = 'https://api.exemplo.com/vehicle';
});

afterAll(() => stopServer());
beforeEach(() => {
  resetHandlers();
  
  // Adicionar handler específico para admin
  server.use(
    http.post('http://localhost:4000/api/users/validate-token', async ({ request }) => {
      const body = await request.json() as any;
      const { token } = body;

      if (token === 'admin-token') {
        return HttpResponse.json({
          user: {
            _id: 'admin-1',
            email: 'admin@example.com',
            role: 'admin'
          }
        }, { status: 200 });
      }

      return HttpResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      );
    })
  );
});

describe('Admin Restrictions - Finance Operations', () => {
  it('should prevent admin from creating finance', async () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer admin-token'
      },
      user: undefined,
      body: {
        userId: 'admin-1',
        value: 20000,
        countOfMonths: 12,
        brand: 'Toyota',
        modelName: 'Corolla',
        type: 'Sedan'
      }
    } as any;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any;

    const mockNext = vi.fn();

    // Executar protectedMiddleware
    await new Promise<void>((resolve) => {
      protectedMiddleware(mockReq, mockRes, () => {
        mockNext();
        resolve();
      });
    });

    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.role).toBe('admin');

    // Tentar criar financiamento
  await CreateFinance(mockReq, mockRes, mockNext);

    // Deve ter retornado 403
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Administradores não podem criar financiamentos.' });
  });

  it('should prevent admin from listing finances', async () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer admin-token'
      },
      user: undefined,
      query: {}
    } as any;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any;

    const mockNext = vi.fn();

    await new Promise<void>((resolve) => {
      protectedMiddleware(mockReq, mockRes, () => {
        mockNext();
        resolve();
      });
    });

    expect(mockReq.user.role).toBe('admin');

  await GetFinancesByUserId(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Administradores não possuem financiamentos próprios.' });
  });

  it('should prevent admin from getting finance by id', async () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer admin-token'
      },
      user: undefined,
      params: { id: 'finance-1' }
    } as any;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any;

    const mockNext = vi.fn();

    await new Promise<void>((resolve) => {
      protectedMiddleware(mockReq, mockRes, () => {
        mockNext();
        resolve();
      });
    });

    expect(mockReq.user.role).toBe('admin');

  await GetFinanceById(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Administradores não podem acessar financiamentos desta forma.' });
  });

  it('should prevent admin from updating finance', async () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer admin-token'
      },
      user: undefined,
      params: { id: 'finance-1' },
      body: { value: 25000 }
    } as any;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any;

    const mockNext = vi.fn();

    await new Promise<void>((resolve) => {
      protectedMiddleware(mockReq, mockRes, () => {
        mockNext();
        resolve();
      });
    });

    expect(mockReq.user.role).toBe('admin');

  await FullUpdateFinance(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Administradores não podem atualizar financiamentos como usuário comum.' });
  });

  it('should prevent admin from partial updating finance', async () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer admin-token'
      },
      user: undefined,
      params: { id: 'finance-1' },
      body: { value: 25000 }
    } as any;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any;

    const mockNext = vi.fn();

    await new Promise<void>((resolve) => {
      protectedMiddleware(mockReq, mockRes, () => {
        mockNext();
        resolve();
      });
    });

    expect(mockReq.user.role).toBe('admin');

  await PartialUpdateFinance(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Administradores não podem atualizar financiamentos como usuário comum.' });
  });

  it('should prevent admin from deleting finance', async () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer admin-token'
      },
      user: undefined,
      params: { id: 'finance-1' }
    } as any;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any;

    const mockNext = vi.fn();

    await new Promise<void>((resolve) => {
      protectedMiddleware(mockReq, mockRes, () => {
        mockNext();
        resolve();
      });
    });

    expect(mockReq.user.role).toBe('admin');

  await DeleteFinance(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Administradores não podem deletar financiamentos como usuário comum.' });
  });
});
