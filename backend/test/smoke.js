/**
 * Smoke test for the Express backend. Requires the server to be running (e.g. npm run dev).
 * Usage: node test/smoke.js   or  npm test (from AIra/backend)
 * In CI: start server in background, then run this script.
 * Uses Node http module for compatibility (fetch can fail on localhost on some Windows/Node setups).
 */
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

function connectionHint() {
  console.error(`\nTip: Ensure the backend is running on port ${PORT}: from AIra/backend run "npm run dev"`);
}

function request(method, pathname, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: HOST,
      port: PORT,
      path: pathname,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, data: null });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function run() {
  let passed = 0;
  let failed = 0;

  // 1. Health
  try {
    const { status, data } = await request('GET', '/health');
    if (status === 200 && data && data.status === 'ok') {
      console.log('OK /health');
      passed++;
    } else {
      console.error('FAIL /health:', status, data);
      failed++;
    }
  } catch (e) {
    console.error('FAIL /health:', e.message);
    connectionHint();
    failed++;
  }

  // 2. One AI route (validation only – no API key needed for 400)
  try {
    const { status, data } = await request('POST', '/api/resolve-doubt', {});
    if (status === 400 && data && data.error) {
      console.log('OK /api/resolve-doubt (validation)');
      passed++;
    } else if (status === 500 && data && data.error) {
      console.log('OK /api/resolve-doubt (route reached, backend error)');
      passed++;
    } else {
      console.error('FAIL /api/resolve-doubt:', status, data);
      failed++;
    }
  } catch (e) {
    console.error('FAIL /api/resolve-doubt:', e.message);
    if (failed === 0) connectionHint();
    failed++;
  }

  console.log(`\nSmoke: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
