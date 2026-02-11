/**
 * Feature verification script: validates backend APIs and env so all app features can work.
 * Run from AIra folder: node scripts/verify-features.js
 * For full verification, also run: npm run health-check && npm run build && npm run lint
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

async function fetchHealth(baseUrl, timeoutMs = 8000) {
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

function checkFilesExist(files) {
  const missing = [];
  for (const f of files) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) missing.push(f);
  }
  return missing;
}

async function main() {
  log('\n--- AIra feature verification ---\n', 'blue');

  const env = loadEnv();
  const apiUrl = (env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  let passed = 0;
  let failed = 0;

  log(`  API base: ${apiUrl} (set VITE_API_URL to override)`, 'reset');

  // 1. Backend reachability and AI models
  log('\nBackend & AI service...', 'blue');
  const health = await fetchHealth(apiUrl);
  if (health.ok && health.data) {
    log('✓ Backend reachable', 'green');
    passed++;
    const d = health.data;
    if (d.models) {
      const llama = d.models.llama ? '✓' : '✗';
      const mistral = d.models.mistral ? '✓' : '✗';
      log(`  Models: LLaMA=${llama}, Mistral=${mistral}`, d.models.llama || d.models.mistral ? 'green' : 'yellow');
      if (d.models.llama || d.models.mistral) passed++;
      else { log('  At least one AI model required for chat/teaching/studio', 'yellow'); failed++; }
    }
    if (d.limits && d.limits.maxPromptLength) {
      log(`  Max prompt length: ${d.limits.maxPromptLength}`, 'reset');
    }
  } else {
    log('✗ Backend not reachable', 'red');
    if (health.error) log(`  ${health.error}`, 'red');
    if (health.status) log(`  HTTP ${health.status}`, 'red');
    log('  Start backend: cd backend && npm run dev', 'yellow');
    failed++;
  }

  // 2. Key source files (routes and features exist)
  const requiredFiles = [
    'src/App.tsx',
    'src/main.tsx',
    'src/pages/LoginPage.tsx',
    'src/pages/OnboardingPage.tsx',
    'src/pages/TeachingPage.tsx',
    'src/pages/CurriculumPage.tsx',
    'src/pages/SettingsPage.tsx',
    'src/services/aiApi.ts',
    'src/services/backendService.ts',
    'src/components/teaching/DoubtPanel.tsx',
    'src/components/studio/NotesViewer.tsx',
    'src/components/studio/FlashcardViewer.tsx',
    'src/components/studio/MindMapViewer.tsx',
    'src/components/studio/QuizViewer.tsx',
  ];
  const missing = checkFilesExist(requiredFiles);
  if (missing.length === 0) {
    log('\n✓ All key feature files present', 'green');
    passed++;
  } else {
    log('\n✗ Missing files: ' + missing.join(', '), 'red');
    failed++;
  }

  log('');
  if (failed === 0) {
    log('Feature verification passed. Run the app and test UI flows (see VERIFICATION_CHECKLIST.md).', 'green');
  } else {
    log(`${failed} check(s) failed. Fix env or start backend, then re-run.`, 'yellow');
  }
  log('');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
