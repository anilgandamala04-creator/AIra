# Direct Installation Script for Supabase CLI
# Run this in PowerShell (may require Administrator for PATH changes)

Write-Host "=== Supabase CLI Installation ===" -ForegroundColor Green
Write-Host ""

# Step 1: Get latest version from GitHub API
Write-Host "Fetching latest version..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/supabase/cli/releases/latest" -UseBasicParsing
    $version = $response.tag_name -replace '^v', ''
    $assets = $response.assets
    
    # Find Windows 64-bit zip
    $windowsAsset = $assets | Where-Object { 
        $_.name -match "windows" -and $_.name -match "amd64" -and $_.name -match "\.zip$"
    } | Select-Object -First 1
    
    if (-not $windowsAsset) {
        throw "Windows release not found"
    }
    
    $downloadUrl = $windowsAsset.browser_download_url
    Write-Host "Found version: $version" -ForegroundColor Green
    Write-Host "Download URL: $downloadUrl" -ForegroundColor Cyan
} catch {
    Write-Host "Error fetching release info: $_" -ForegroundColor Red
    Write-Host "Using fallback version..." -ForegroundColor Yellow
    $version = "2.75.0"
    $downloadUrl = "https://github.com/supabase/cli/releases/download/v$version/supabase_${version}_windows_amd64.zip"
}

# Step 2: Download
Write-Host ""
Write-Host "Downloading Supabase CLI..." -ForegroundColor Yellow
$zipPath = "$env:TEMP\supabase-cli.zip"
$extractPath = "$env:LOCALAPPDATA\supabase"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "Download complete!" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download manually from:" -ForegroundColor Yellow
    Write-Host "https://github.com/supabase/cli/releases/latest" -ForegroundColor Cyan
    Write-Host "Look for: supabase_windows_amd64.zip" -ForegroundColor Yellow
    exit 1
}

# Step 3: Extract
Write-Host ""
Write-Host "Extracting..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $extractPath | Out-Null
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

# Step 4: Find executable
$exePath = Get-ChildItem -Path $extractPath -Recurse -Filter "supabase.exe" | Select-Object -First 1

if (-not $exePath) {
    Write-Host "Error: supabase.exe not found in extracted files" -ForegroundColor Red
    Write-Host "Extracted to: $extractPath" -ForegroundColor Yellow
    exit 1
}

$exeDir = $exePath.DirectoryName
Write-Host "Found: $($exePath.FullName)" -ForegroundColor Green

# Step 5: Add to PATH
Write-Host ""
Write-Host "Adding to PATH..." -ForegroundColor Yellow
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($userPath -notlike "*$exeDir*") {
    $newPath = if ($userPath) { "$userPath;$exeDir" } else { $exeDir }
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:Path += ";$exeDir"
    Write-Host "Added to PATH!" -ForegroundColor Green
} else {
    Write-Host "Already in PATH" -ForegroundColor Cyan
}

# Step 6: Verify
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow
try {
    $versionOutput = & "$($exePath.FullName)" --version 2>&1
    Write-Host "Success! Supabase CLI installed:" -ForegroundColor Green
    Write-Host $versionOutput -ForegroundColor Cyan
} catch {
    Write-Host "Installation complete, but verification failed." -ForegroundColor Yellow
    Write-Host "Please restart your terminal and run: supabase --version" -ForegroundColor Yellow
}

# Cleanup
Remove-Item $zipPath -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your terminal (or run: `$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')`)" -ForegroundColor Cyan
Write-Host "2. Run: supabase login" -ForegroundColor Cyan
Write-Host "3. Run: supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor Cyan
Write-Host ""
