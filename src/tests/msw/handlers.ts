import { http, HttpResponse } from 'msw';

// Handlers para as chamadas externas usadas nos testes (MSW v2 syntax)
export const handlers = [
  // VEHICLE_API_URL handler - GET simples que RETORNA dados do veículo
  http.get('https://api.exemplo.com/vehicle', () => {
    // API retorna os dados disponíveis (não recebe parâmetros)
    return HttpResponse.json({ 
      brand: 'Toyota', 
      modelname: 'Corolla', 
      type: 'Sedan', 
      horsepower: 150, 
      doors: 4 
    });
  }),

  // USER_SERVICE_URL/validate-token - Valida token JWT
  http.post('http://localhost:4000/api/users/validate-token', async ({ request }) => {
    const body = await request.json() as any;
    const { token } = body;

    // Simula validação de token
    if (token === 'valid-token') {
      return HttpResponse.json({
        user: {
          _id: 'user-1',
          email: 'test@example.com',
          role: 'user'
        }
      }, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Token inválido' },
      { status: 401 }
    );
  })
];

export default handlers;
