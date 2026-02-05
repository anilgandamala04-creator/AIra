# Install Supabase CLI on Windows
# Run this script in PowerShell (may require Administrator privileges)

Write-Host "Downloading Supabase CLI..." -ForegroundColor Green

# Get the latest release from GitHub API
try {
    $latestUrl = "https://api.github.com/repos/supabase/cli/releases/latest"
    $release = Invoke-RestMethod -Uri $latestUrl -UseBasicParsing
    $asset = $release.assets | Where-Object { $_.name -match "windows.*amd64.*zip" -or $_.name -match "supabase.*windows.*zip" } | Select-Object -First 1
    
    if ($asset) {
        $downloadUrl = $asset.browser_download_url
        Write-Host "Found release: $($release.tag_name)" -ForegroundColor Cyan
    } else {
        # Fallback: try common naming pattern
        $version = $release.tag_name -replace '^v', ''
        $downloadUrl = "https://github.com/supabase/cli/releases/download/$($release.tag_name)/supabase_${version}_windows_amd64.zip"
        Write-Host "Using fallback URL pattern" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error fetching release info: $_" -ForegroundColor Red
    Write-Host "Using hardcoded latest known version..." -ForegroundColor Yellow
    # Fallback to a known working version
    $downloadUrl = "https://github.com/supabase/cli/releases/download/v1.200.0/supabase_1.200.0_windows_amd64.zip"
}
$zipPath = "$env:TEMP\supabase-cli.zip"
$extractPath = "$env:LOCALAPPDATA\supabase"

Write-Host "Downloading from: $downloadUrl" -ForegroundColor Yellow
Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing

Write-Host "Extracting..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path $extractPath | Out-Null
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

# Find the executable
$exePath = Get-ChildItem -Path $extractPath -Recurse -Filter "supabase.exe" | Select-Object -First 1

if (-not $exePath) {
    Write-Host "Error: Could not find supabase.exe" -ForegroundColor Red
    exit 1
}

# Add to user PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$($exePath.DirectoryName)*") {
    Write-Host "Adding to PATH..." -ForegroundColor Green
    $newPath = $userPath + ";$($exePath.DirectoryName)"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:Path += ";$($exePath.DirectoryName)"
}

Write-Host "Supabase CLI installed successfully!" -ForegroundColor Green
Write-Host "Location: $($exePath.FullName)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please restart your terminal and run: supabase --version" -ForegroundColor Yellow
Write-Host "Or run this command now: $($exePath.FullName) --version" -ForegroundColor Yellow

# Clean up
Remove-Item $zipPath -ErrorAction SilentlyContinue
