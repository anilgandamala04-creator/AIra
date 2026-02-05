/**
 * Integration Verification Script
 * 
 * Tests all backend endpoints to ensure proper integration with frontend.
 * Run this script after starting the backend server.
 * 
 * Usage: node verify-integration.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

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

async function testEndpoint(name, method, path, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}${path}`, options);
    const latency = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));
    
    if (response.ok) {
      log(`✓ ${name} - OK (${latency}ms)`, 'green');
      return { success: true, latency, data };
    } else {
      log(`✗ ${name} - FAILED (${response.status}) - ${data.error || 'Unknown error'}`, 'red');
      return { success: false, status: response.status, error: data.error };
    }
  } catch (error) {
    log(`✗ ${name} - ERROR - ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🧪 Starting Integration Verification Tests\n', 'blue');
  log(`Testing backend at: ${BASE_URL}\n`, 'yellow');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };
  
  // Test 1: Health Check
  log('1. Testing Health Endpoint...', 'yellow');
  const healthResult = await testEndpoint('Health Check', 'GET', '/health');
  results.total++;
  if (healthResult.success) {
    results.passed++;
    if (healthResult.data.models) {
      log(`   Models available: LLaMA=${healthResult.data.models.llama ? '✓' : '✗'}, Mistral=${healthResult.data.models.mistral ? '✓' : '✗'}`, 'blue');
    }
  } else {
    results.failed++;
  }
  
  // Test 2: Generate Content
  log('\n2. Testing Generate Content Endpoint...', 'yellow');
  const contentResult = await testEndpoint(
    'Generate Content',
    'POST',
    '/api/generate-content',
    { prompt: 'Say hello in one word.', model: 'llama' }
  );
  results.total++;
  if (contentResult.success) {
    results.passed++;
    if (contentResult.data.content) {
      log(`   Response length: ${contentResult.data.content.length} characters`, 'blue');
    }
  } else {
    results.failed++;
  }
  
  // Test 3: Resolve Doubt
  log('\n3. Testing Resolve Doubt Endpoint...', 'yellow');
  const doubtResult = await testEndpoint(
    'Resolve Doubt',
    'POST',
    '/api/resolve-doubt',
    { question: 'What is 2+2?', context: 'Basic arithmetic', model: 'llama' }
  );
  results.total++;
  if (doubtResult.success) {
    results.passed++;
    if (doubtResult.data.explanation) {
      log(`   Explanation provided: ${doubtResult.data.explanation.substring(0, 50)}...`, 'blue');
    }
  } else {
    results.failed++;
  }
  
  // Test 4: Generate Teaching Content
  log('\n4. Testing Generate Teaching Content Endpoint...', 'yellow');
  const teachingResult = await testEndpoint(
    'Generate Teaching Content',
    'POST',
    '/api/generate-teaching-content',
    { topic: 'Introduction to Mathematics', model: 'llama' }
  );
  results.total++;
  if (teachingResult.success) {
    results.passed++;
    if (teachingResult.data.sections) {
      log(`   Sections generated: ${teachingResult.data.sections.length}`, 'blue');
    }
  } else {
    results.failed++;
  }
  
  // Test 5: Generate Quiz
  log('\n5. Testing Generate Quiz Endpoint...', 'yellow');
  const quizResult = await testEndpoint(
    'Generate Quiz',
    'POST',
    '/api/generate-quiz',
    { topic: 'Basic Math', context: 'Elementary education', model: 'llama' }
  );
  results.total++;
  if (quizResult.success) {
    results.passed++;
    if (quizResult.data.questions) {
      log(`   Questions generated: ${quizResult.data.questions.length}`, 'blue');
    }
  } else {
    results.failed++;
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('📊 Test Summary', 'blue');
  log('='.repeat(50), 'blue');
  log(`Total Tests: ${results.total}`, 'yellow');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n✅ All integration tests passed!', 'green');
    log('🎉 Backend is fully operational and ready for frontend integration.\n', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Please check the backend configuration and ensure:', 'red');
    log('   1. Backend server is running on port 5000', 'yellow');
    log('   2. API keys are configured in backend/.env', 'yellow');
    log('   3. All dependencies are installed (npm install)', 'yellow');
    log('   4. Network connectivity is working\n', 'yellow');
    process.exit(1);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  log('❌ This script requires Node.js 18+ or fetch polyfill', 'red');
  log('   Install: npm install node-fetch', 'yellow');
  process.exit(1);
}

runTests().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
