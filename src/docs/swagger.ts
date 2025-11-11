import swaggerJsdoc from 'swagger-jsdoc';

// Para produção na Vercel, usar caminhos .js (após build) e no dev aceitar .ts
const apisPaths = [
  './src/routes/*.ts', // dev
  './dist/routes/*.js' // build
];

const swaggerDefinition = {
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
  security: [{ bearerAuth: [] }]
};

const options = {
  swaggerDefinition,
  apis: apisPaths
};

const swaggerSpec = swaggerJsdoc(options as any);
export default swaggerSpec;
