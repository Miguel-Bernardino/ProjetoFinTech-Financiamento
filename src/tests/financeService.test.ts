import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { startServer, stopServer, resetHandlers, server } from './setupTests';
import { http, HttpResponse } from 'msw';

// Mocks para modelos do Mongoose (interceptamos findOne e create)
vi.mock('../models/User', () => ({
  User: {
    findOne: vi.fn(
        async (query: any) => { 
            console.log('Mocked User.findOne called with query:', query);
            return { _id: query._id , role: 'client' } 
        }
    )
  }
}));

vi.mock('../models/Finance', () => ({
  Finance: {
    create: vi.fn(async (payload: any) => ({ _id: 'finance-1', ...payload }))
  }
}));

import financeService from '../services/FinanceServices';

beforeAll(() => startServer());
afterAll(() => stopServer());
beforeEach(() => resetHandlers());

describe('createFinance with MSW', () => {
  it('should create finance and include vehicleSpecs when VEHICLE_API_URL responds', async () => {
    process.env.VEHICLE_API_URL = 'https://api.exemplo.com/vehicle';

    const payload = {
      userId: 'user-1',
      value: 20000,
      countOfMonths: 12
    } as any;

    const result = await financeService.createFinance('user-1', payload);
    expect(result.status).toBe(201);
    expect(result.finance).toBeDefined();
    expect(result.finance.vehicleSpecs).toBeDefined();
    expect(result.finance.vehicleSpecs.brand).toBe('Toyota');
  });

  it('should return 500 when VEHICLE_API_URL returns error', async () => {
    process.env.VEHICLE_API_URL = 'https://api.exemplo.com/vehicle';

    // Forçar a API de veículo a responder com erro (MSW v2 syntax)
    server.use(
      http.get('https://api.exemplo.com/vehicle', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const payload = {
      userId: 'user-1',
      value: 20000,
      countOfMonths: 12
    } as any;

    const result = await financeService.createFinance('user-1', payload);
    // A função captura o erro e retorna status 500
    expect(result.status).toBe(500);
  });
});
