/**
 * Health check script: verifies frontend env and backend reachability.
 * Run from AIra folder: npm run health-check
 * Use after starting dev:all to confirm frontend + backend are ready.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m' };
function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function loadEnv() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return {};
  const text = fs.readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

async function pingBackend(baseUrl, timeoutMs = 5000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/health`, { method: 'GET', signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return { ok: false, status: res.status };
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, error: e.message || String(e) };
  }
}

async function main() {
  log('\n--- AIra health check ---\n', 'blue');

  const env = loadEnv();

  // Frontend env
  const firebaseKey = env.VITE_FIREBASE_API_KEY;
  const firebaseProject = env.VITE_FIREBASE_PROJECT_ID;
  const apiUrl = (env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  let passed = 0;
  let failed = 0;

  if (firebaseKey && firebaseKey.length > 10) {
    log('✓ Frontend: VITE_FIREBASE_API_KEY set', 'green');
    passed++;
  } else {
    log('✗ Frontend: VITE_FIREBASE_API_KEY missing or invalid in .env', 'red');
    failed++;
  }

  if (firebaseProject) {
    log('✓ Frontend: VITE_FIREBASE_PROJECT_ID set', 'green');
    passed++;
  } else {
    log('✗ Frontend: VITE_FIREBASE_PROJECT_ID missing in .env', 'red');
    failed++;
  }

  log(`  API base: ${apiUrl}`, 'reset');

  const hasAiKey = !!(env.OPENROUTER_API_KEY || env.MISTRAL_API_KEY);
  if (hasAiKey) {
    log('✓ AI keys present (OPENROUTER_API_KEY or MISTRAL_API_KEY)', 'green');
    passed++;
  } else {
    log('✗ No OPENROUTER_API_KEY or MISTRAL_API_KEY in .env (backend AI will be disabled)', 'yellow');
  }

  // Backend reachability
  log('\nChecking backend...', 'blue');
  const backend = await pingBackend(apiUrl);
  if (backend.ok) {
    log('✓ Backend reachable', 'green');
    passed++;
    const d = backend.data || {};
    if (d.models) {
      log(`  Models: LLaMA=${d.models.llama ? '✓' : '✗'}, Mistral=${d.models.mistral ? '✓' : '✗'}`, 'reset');
    }
  } else {
    log('✗ Backend not reachable', 'red');
    if (backend.error) log(`  ${backend.error}`, 'red');
    if (backend.status) log(`  HTTP ${backend.status}`, 'red');
    log('  Start backend with: npm run dev:backend (or npm run dev:all)', 'yellow');
    failed++;
  }

  log('');
  if (failed === 0) {
    log('All checks passed. You can run the app (npm run dev or npm run dev:all).', 'green');
  } else {
    log(`${failed} check(s) failed. Fix .env or start the backend as needed.`, 'yellow');
  }
  log('');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
