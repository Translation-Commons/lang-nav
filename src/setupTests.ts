import '@testing-library/jest-dom';

import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './testServer';

// Only if you want request mocking; otherwise remove this whole block + MSW deps
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
