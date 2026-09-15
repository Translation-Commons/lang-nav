/**
 * Build and preview with `base: '/'`, for Playwright's webServer.
 *
 * WHY THIS EXISTS. Both Playwright configs used to run
 * `VITE_BASE_PATH=/ npm run build && VITE_BASE_PATH=/ npm run preview`.
 * That is POSIX env-prefix syntax: cmd.exe reads `VITE_BASE_PATH=/` as a
 * command name, so on Windows the webServer never starts and every e2e test
 * fails with "Process from config.webServer was not able to start", which
 * looks like a Playwright problem rather than a shell one.
 *
 * Setting `env` on a spawn is the same fix `build-cf.mjs` already uses, and it
 * needs no new dependency - `cross-env` would also work but is one more
 * package to install for one line of shell.
 *
 * The default base is `/lang-nav/` for GitHub Pages; the preview server serves
 * from the root, so the tests need the root build.
 */
import { spawnSync, spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const env = { ...process.env, VITE_BASE_PATH: '/' };
// npm is a shell script on Windows, so it needs a shell to be found on PATH.
const opts = { cwd: root, stdio: 'inherit', env, shell: true };

const build = spawnSync('npm', ['run', 'build'], opts);
if (build.status !== 0) process.exit(build.status ?? 1);

// Not spawnSync: preview must keep running for Playwright to connect to it.
const preview = spawn('npm', ['run', 'preview'], opts);
preview.on('exit', (code) => process.exit(code ?? 0));
