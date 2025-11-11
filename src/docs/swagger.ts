import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

// Vercel executa código a partir de /var/task/, precisamos ajustar caminhos
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Em produção/Vercel, apontar para .js compilado com caminho absoluto
const apisPaths = isProduction
  ? [path.join(process.cwd(), 'dist', 'routes', '*.js')]
  : ['./src/routes/*.ts'];

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
