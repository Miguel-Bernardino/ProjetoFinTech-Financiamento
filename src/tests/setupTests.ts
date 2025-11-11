import { setupServer } from 'msw/node';
import handlers from './msw/handlers';

export const server = setupServer(...handlers);

export const startServer = () => server.listen({ onUnhandledRequest: 'warn' });
export const stopServer = () => server.close();
export const resetHandlers = () => server.resetHandlers();
