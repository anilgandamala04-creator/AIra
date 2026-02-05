/**
 * Setup script to create .env file for local development
 * Run: node setup-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Firebase Functions Environment Variables
# This file is for LOCAL DEVELOPMENT ONLY
# For production, use Firebase Secrets or Firebase Config
# DO NOT COMMIT THIS FILE TO VERSION CONTROL

# OpenRouter API Key (for LLaMA models)
OPENROUTER_API_KEY=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

# OpenRouter Model (optional)
OPENROUTER_MODEL=qwen/qwen-2.5-7b-instruct

# OpenRouter API URL (optional)
OPENROUTER_API_URL=https://openrouter.ai/api/v1

# AI Provider
AI_PROVIDER=openrouter

# AI Request Timeout (milliseconds)
AI_REQUEST_TIMEOUT_MS=60000

# Doubt Resolution Model
DOUBT_RESOLUTION_MODEL=llama
`;

const envPath = path.join(__dirname, '.env');
const gitignorePath = path.join(__dirname, '.gitignore');

try {
  // Create .env file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with OpenRouter API key');
  
  // Ensure .gitignore includes .env
  let gitignore = '';
  if (fs.existsSync(gitignorePath)) {
    gitignore = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  if (!gitignore.includes('.env')) {
    gitignore += '\n# Environment variables\n.env\n';
    fs.writeFileSync(gitignorePath, gitignore);
    console.log('✅ Updated .gitignore to exclude .env');
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Install dotenv: npm install dotenv');
  console.log('2. For production deployment, use Firebase Secrets:');
  console.log('   firebase functions:secrets:set OPENROUTER_API_KEY');
  console.log('\n✅ Environment setup complete!');
} catch (error) {
  console.error('❌ Error setting up environment:', error.message);
  process.exit(1);
}
