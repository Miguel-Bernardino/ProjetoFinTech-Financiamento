// Spec estático do Swagger - garante que funciona na Vercel
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'FinTech Finance API',
    version: '1.0.0',
    description: 'Documentação da API de financiamentos. Autenticação via Bearer token.'
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Finance: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          brand: { type: 'string' },
          modelName: { type: 'string' },
          type: { type: 'string' },
          value: { type: 'number' },
          countOfMonths: { type: 'number' },
          downPayment: { type: 'number' },
          interestRate: { type: 'number' },
          installmentValue: { type: 'number' },
          financeDate: { type: 'string', format: 'date-time' },
          status: { type: 'string' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: { message: { type: 'string' } }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/finances': {
      post: {
        tags: ['Finances'],
        summary: 'Criar um financiamento',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Finance' }
            }
          }
        },
        responses: {
          '201': { description: 'Financiamento criado' },
          '400': { description: 'Requisição inválida' },
          '401': { description: 'Não autorizado' },
          '403': { description: 'Proibido' }
        }
      },
      get: {
        tags: ['Finances'],
        summary: 'Listar financiamentos do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK' }
        }
      }
    },
    '/api/finances/{id}': {
      get: {
        tags: ['Finances'],
        summary: 'Obter financiamento por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'OK' },
          '404': { description: 'Não encontrado' }
        }
      },
      put: {
        tags: ['Finances'],
        summary: 'Atualizar completamente um financiamento',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Finance' }
            }
          }
        },
        responses: {
          '200': { description: 'OK' }
        }
      },
      patch: {
        tags: ['Finances'],
        summary: 'Atualização parcial',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'OK' }
        }
      },
      delete: {
        tags: ['Finances'],
        summary: 'Deletar financiamento',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'OK' }
        }
      }
    },
    '/api/finances/{id}/restore': {
      patch: {
        tags: ['Finances'],
        summary: 'Restaurar financiamento',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '501': { description: 'Não implementado' }
        }
      }
    },
    '/api/finances/{id}/sign-contract': {
      post: {
        tags: ['Finances'],
        summary: 'Assinar contrato de financiamento',
        description: 'Assina o contrato de um financiamento aprovado e notifica o microserviço de pontos',
        security: [{ bearerAuth: [] }],
        parameters: [
          { 
            in: 'path', 
            name: 'id', 
            required: true, 
            schema: { type: 'string' },
            description: 'ID do financiamento'
          }
        ],
        responses: {
          '200': { 
            description: 'Contrato assinado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Finance' }
                  }
                }
              }
            }
          },
          '400': { 
            description: 'Requisição inválida ou contrato já assinado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '401': { 
            description: 'Não autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '403': { 
            description: 'Usuário não é proprietário do financiamento',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '404': { 
            description: 'Financiamento não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  }
};

export default swaggerSpec;
