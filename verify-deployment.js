/**
 * Deployment Verification Script
 *
 * Verifies that the frontend is ready for deployment (build output and key files).
 * App uses Firebase (Hosting, Auth, Firestore, Storage, Cloud Functions). Deploy with: npm run deploy (from repo root).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(condition, message, errorMessage) {
  if (condition) {
    log(`✓ ${message}`, 'green');
    return true;
  } else {
    log(`✗ ${errorMessage || message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🔍 Deployment verification (Firebase)\n', 'blue');

  let allChecksPassed = true;

  // 1. Frontend build
  log('🏗️  Frontend build...', 'blue');
  const distExists = fs.existsSync(path.join(__dirname, 'dist'));
  if (distExists) {
    const distFiles = fs.readdirSync(path.join(__dirname, 'dist'));
    allChecksPassed = check(distFiles.length > 0, 'dist contains files', 'dist is empty') && allChecksPassed;
    allChecksPassed = check(
      distFiles.some((f) => f === 'index.html'),
      'index.html in dist',
      'index.html missing'
    ) && allChecksPassed;
  } else {
    log('⚠ dist missing (run: npm run build)', 'yellow');
    allChecksPassed = false;
  }

  // 2. Package.json has build
  const pkgPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      allChecksPassed = check(!!pkg.scripts?.build, 'package.json has build script', 'Missing build script') && allChecksPassed;
    } catch {
      allChecksPassed = false;
    }
  }

  // 3. Key source files
  log('\n📁 Key files...', 'blue');
  const keyFiles = ['src/App.tsx', 'src/main.tsx', 'src/services/aiApi.ts', 'src/services/backendService.ts'];
  for (const f of keyFiles) {
    const full = path.join(__dirname, f);
    allChecksPassed = check(fs.existsSync(full), f, `${f} missing`) && allChecksPassed;
  }

  log('\n' + '='.repeat(50), 'blue');
  if (allChecksPassed) {
    log('\n✅ Checks passed. Deploy with: npm run deploy (from repo root) for Hosting + Functions.', 'green');
    log('   Or: npx firebase deploy --only hosting (hosting only).\n', 'reset');
    process.exit(0);
  } else {
    log('\n❌ Some checks failed. Run npm run build and fix issues above.\n', 'red');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
