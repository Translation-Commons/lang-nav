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

// Embla carousel reads media queries and observes slide visibility
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

window.IntersectionObserver ??=
  IntersectionObserver as unknown as typeof window.IntersectionObserver;

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
