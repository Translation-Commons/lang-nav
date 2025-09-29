import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Add/adjust handlers as your API layers evolve
export const handlers = [http.get('/api/health', () => HttpResponse.json({ ok: true }))];

export const server = setupServer(...handlers);
