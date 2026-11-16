// Compiles the data engine snapshot into .cache/engine/.
// Usage: npm run engine:compile [-- <LanguageSource> ...]   (default: Combined ISO; the first is the base)
// Vite's SSR loader runs the TypeScript sources directly, so no extra tooling is needed.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const alias = Object.fromEntries(
  ['app', 'pages', 'widgets', 'features', 'entities', 'shared', 'strings', 'tests'].map((name) => [
    `@${name}`,
    path.resolve(root, 'src', name),
  ]),
);
alias['@'] = path.resolve(root, 'src');

const server = await createServer({
  root,
  configFile: false,
  logLevel: 'warn',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  esbuild: { jsx: 'automatic' },
  resolve: { alias },
});

try {
  const { runCompiler } = await server.ssrLoadModule(
    '/src/features/data/engine/compiler/runCompiler.ts',
  );
  await runCompiler({
    root,
    outDir: path.join(root, '.cache/engine'),
    args: process.argv.slice(2),
  });
} finally {
  await server.close();
}
