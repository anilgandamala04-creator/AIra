# Push Project AIra to GitHub
# Run from: C:\Users\HP\Downloads\Project AIra\AIra

Set-Location $PSScriptRoot

Write-Host "=== Git Status ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Staging all changes ===" -ForegroundColor Cyan
git add .

Write-Host "`n=== Committing ===" -ForegroundColor Cyan
git commit -m "Add Vercel API, Firebase and Vercel deployment guides"

Write-Host "`n=== Pulling remote changes (rebase) ===" -ForegroundColor Cyan
git pull --rebase origin main

Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Cyan
git push -u origin main

Write-Host "`n=== Done ===" -ForegroundColor Green
