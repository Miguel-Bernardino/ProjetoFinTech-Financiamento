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

  // USER_SERVICE_URL exemplo (não usado diretamente por createFinance no momento,
  // mas adicionado para cobrir testes que possam requisitar essa URL)
  http.get('http://localhost:4000/api/users', () => {
    return HttpResponse.json([{ id: 'user-1', role: 'client' }]);
  })
];

export default handlers;
