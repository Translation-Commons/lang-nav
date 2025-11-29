import './polyfills/storage';
import '@testing-library/jest-dom';

import { afterAll, afterEach, beforeAll } from 'vitest';

import { getServer } from './testServer';

// Mock ResizeObserver for tests
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Only if you want request mocking; otherwise remove this whole block + MSW deps
beforeAll(async () => {
  const server = await getServer();
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(async () => {
  const server = await getServer();
  server.resetHandlers();
});

afterAll(async () => {
  const server = await getServer();
  server.close();
});
