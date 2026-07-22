import { execSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

rmSync(dist, { recursive: true, force: true });

execSync('tsc -b', { cwd: root, stdio: 'inherit' });
execSync('vite build', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, VITE_BASE_PATH: '/' },
});

// Pages only enables its native SPA fallback (index.html on unknown paths)
// when no top-level 404.html exists; 404.html is the GitHub Pages hack anyway.
rmSync(resolve(dist, '404.html'), { force: true });

const redirects = [
  '/lang-nav       /            301',
  '/lang-nav/*     /:splat      301',
  '',
].join('\n');

writeFileSync(resolve(dist, '_redirects'), redirects);
console.log('\nBuilt for Cloudflare Pages at dist/ (base /) with _redirects');
