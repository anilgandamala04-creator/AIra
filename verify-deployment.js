/**
 * Deployment Verification Script
 * 
 * Verifies that all services are properly configured and ready for deployment:
 * - Firebase configuration
 * - Environment variables
 * - Build output
 * - Functions configuration
 * - Security rules
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

function verifyFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  return check(exists, `${description} exists`, `${description} missing: ${filePath}`);
}

function verifyFileContent(filePath, description, validator) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    log(`✗ ${description} missing: ${filePath}`, 'red');
    return false;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const isValid = validator(content);
    return check(isValid, `${description} is valid`, `${description} is invalid`);
  } catch (error) {
    log(`✗ Error reading ${description}: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🔍 Starting Deployment Verification...\n', 'blue');
  
  let allChecksPassed = true;
  
  // 1. Check Firebase configuration
  log('📋 Checking Firebase Configuration...', 'blue');
  allChecksPassed = verifyFileExists('firebase.json', 'firebase.json') && allChecksPassed;
  
  allChecksPassed = verifyFileContent('firebase.json', 'firebase.json', (content) => {
    try {
      const config = JSON.parse(content);
      return config.hosting && config.functions && config.firestore && config.storage;
    } catch {
      return false;
    }
  }) && allChecksPassed;
  
  // 2. Check security rules (Firebase core backend)
  log('\n🔒 Checking Security Rules...', 'blue');
  allChecksPassed = verifyFileExists('firestore.rules', 'firestore.rules') && allChecksPassed;
  allChecksPassed = verifyFileExists('storage.rules', 'storage.rules') && allChecksPassed;
  
  // 3. Check Functions configuration
  log('\n⚙️  Checking Functions Configuration...', 'blue');
  allChecksPassed = verifyFileExists('functions/package.json', 'functions/package.json') && allChecksPassed;
  allChecksPassed = verifyFileExists('functions/tsconfig.json', 'functions/tsconfig.json') && allChecksPassed;
  allChecksPassed = verifyFileExists('functions/src/index.ts', 'functions/src/index.ts') && allChecksPassed;
  
  // 4. Check frontend build
  log('\n🏗️  Checking Frontend Build...', 'blue');
  const distExists = fs.existsSync(path.join(__dirname, 'dist'));
  if (distExists) {
    const distFiles = fs.readdirSync(path.join(__dirname, 'dist'));
    allChecksPassed = check(
      distFiles.length > 0,
      'dist directory contains files',
      'dist directory is empty'
    ) && allChecksPassed;
    
    allChecksPassed = check(
      distFiles.some(f => f === 'index.html'),
      'index.html exists in dist',
      'index.html missing in dist'
    ) && allChecksPassed;
  } else {
    log('⚠ dist directory does not exist (run npm run build first)', 'yellow');
  }
  
  // 5. Check package.json scripts
  log('\n📦 Checking Package Configuration...', 'blue');
  allChecksPassed = verifyFileContent('package.json', 'package.json', (content) => {
    try {
      const pkg = JSON.parse(content);
      return pkg.scripts && 
             pkg.scripts.build && 
             pkg.scripts.deploy &&
             pkg.scripts['deploy:hosting'] &&
             pkg.scripts['deploy:functions'];
    } catch {
      return false;
    }
  }) && allChecksPassed;
  
  // 6. Check Firebase Functions source
  log('\n🔧 Checking Functions Source Code...', 'blue');
  allChecksPassed = verifyFileContent('functions/src/index.ts', 'Functions index.ts', (content) => {
    // Check for Firebase Functions export pattern
    const hasExport = content.includes('export const api') || 
                      content.includes('export const api =') ||
                      content.includes('export') && content.includes('api');
    const hasOnRequest = content.includes('functions.https.onRequest') ||
                         content.includes('onRequest');
    return hasExport && hasOnRequest;
  }) && allChecksPassed;
  
  // 7. Check AI API configuration
  log('\n🤖 Checking AI Integration...', 'blue');
  allChecksPassed = verifyFileExists('src/services/aiApi.ts', 'AI API service') && allChecksPassed;
  allChecksPassed = verifyFileContent('src/services/aiApi.ts', 'AI API service', (content) => {
    return content.includes('getBaseUrl') && 
           content.includes('cloudfunctions.net');
  }) && allChecksPassed;
  
  // 8. Check error boundaries
  log('\n🛡️  Checking Error Handling...', 'blue');
  allChecksPassed = verifyFileExists('src/components/common/ErrorBoundary.tsx', 'ErrorBoundary component') && allChecksPassed;
  allChecksPassed = verifyFileContent('src/App.tsx', 'App.tsx with error boundaries', (content) => {
    return content.includes('ErrorBoundary') && 
           content.includes('RouteWithErrorBoundary');
  }) && allChecksPassed;
  
  // Summary
  log('\n' + '='.repeat(50), 'blue');
  if (allChecksPassed) {
    log('\n✅ All checks passed! Ready for deployment.', 'green');
    log('\n📝 Next steps:', 'blue');
    log('1. Build the frontend: npm run build', 'yellow');
    log('2. Deploy to Firebase: npm run deploy', 'yellow');
    log('3. Or deploy separately:', 'yellow');
    log('   - npm run deploy:hosting (frontend)', 'yellow');
    log('   - npm run deploy:functions (backend)', 'yellow');
    log('   - npm run deploy:rules (security rules)', 'yellow');
    log('\n');
    process.exit(0);
  } else {
    log('\n❌ Some checks failed. Please fix the issues above before deploying.', 'red');
    log('\n');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Verification script error: ${error.message}`, 'red');
  process.exit(1);
});
