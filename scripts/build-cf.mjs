import { execSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const subdir = resolve(dist, 'lang-nav');

rmSync(dist, { recursive: true, force: true });

execSync('tsc -b', { cwd: root, stdio: 'inherit' });
execSync(`vite build --outDir ${subdir} --emptyOutDir`, { cwd: root, stdio: 'inherit' });

const redirects = [
  '/               /lang-nav/             301',
  '/lang-nav       /lang-nav/             301',
  '/lang-nav/*     /lang-nav/index.html   200',
  '',
].join('\n');

writeFileSync(resolve(dist, '_redirects'), redirects);
console.log('\nBuilt for Cloudflare Pages at dist/lang-nav/ with _redirects at dist/_redirects');
