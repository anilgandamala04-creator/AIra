# Simple PowerShell script to create .env file
# Run: .\create-env.ps1

$envFile = Join-Path $PSScriptRoot ".env"

# Remove existing file if it exists
if (Test-Path $envFile) {
    Remove-Item $envFile -Force
}

# Create .env file line by line
$lines = @(
    "# Backend Environment Variables",
    "# DO NOT commit this file to version control",
    "",
    "# API Keys (Required)",
    "OPENROUTER_API_KEY=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",
    "MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862",
    "",
    "# Server Configuration",
    "PORT=5000",
    "NODE_ENV=development",
    "",
    "# CORS Configuration",
    "FRONTEND_URL=http://localhost:5173,http://localhost:3000,https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com",
    "",
    "# AI Provider Configuration",
    "AI_PROVIDER=openrouter",
    "OPENROUTER_MODEL=qwen/qwen-2.5-7b-instruct",
    "MISTRAL_MODEL=mistral-small-latest",
    "DOUBT_RESOLUTION_MODEL=llama",
    "",
    "# Timeout Configuration",
    "AI_REQUEST_TIMEOUT_MS=60000"
)

# Write all lines to file
$lines | Out-File -FilePath $envFile -Encoding utf8

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host "📝 Location: $envFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Install dependencies: npm install"
Write-Host "2. Start server: npm run dev"
Write-Host "3. Test: curl http://localhost:5000/health"
