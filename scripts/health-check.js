/**
 * Health check script: verifies backend reachability (and optional env).
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
  const apiUrl = (env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  let passed = 0;
  let failed = 0;

  log(`  API base: ${apiUrl}`, 'reset');

  // Backend .env (optional - for AI)
  const backendEnvPath = path.join(root, 'backend', '.env');
  if (fs.existsSync(backendEnvPath)) {
    const content = fs.readFileSync(backendEnvPath, 'utf8');
    const hasAiKey = /OPENROUTER_API_KEY|MISTRAL_API_KEY/.test(content);
    if (hasAiKey) {
      log('✓ Backend: AI keys present (OPENROUTER_API_KEY or MISTRAL_API_KEY)', 'green');
      passed++;
    } else {
      log('○ Backend: No OPENROUTER_API_KEY or MISTRAL_API_KEY (AI will be disabled)', 'yellow');
    }
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
    log(`${failed} check(s) failed. Start the backend as needed.`, 'yellow');
  }
  log('');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
