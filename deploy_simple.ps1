# CopyCache Extension Deployment Script
Write-Host "CopyCache Extension Deployment" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Build the React popup
Write-Host "`nBuilding React popup..." -ForegroundColor Yellow
Set-Location ".\popup"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ".."

# Copy assets
Write-Host "`nCopying assets..." -ForegroundColor Yellow
if (Test-Path ".\images\copynew.png") {
    Copy-Item ".\images\copynew.png" ".\popup\build\copynew.png" -Force
}
if (Test-Path ".\images\moon.gif") {
    Copy-Item ".\images\moon.gif" ".\popup\build\moon.gif" -Force
}

# Validate files
Write-Host "`nValidating extension files..." -ForegroundColor Yellow
$required = @("manifest.json", "background\background.js", "content\content.js", "popup\build\index.html", "images\copynew.png")
$missing = @()
foreach ($file in $required) {
    if (!(Test-Path $file)) { $missing += $file }
}

if ($missing.Count -gt 0) {
    Write-Host "Missing files:" -ForegroundColor Red
    foreach ($file in $missing) { Write-Host "  - $file" -ForegroundColor Red }
    exit 1
}

Write-Host "`nExtension ready for deployment!" -ForegroundColor Green
Write-Host "`nTo load in Chrome:" -ForegroundColor Yellow
Write-Host "1. Open chrome://extensions/" -ForegroundColor White
Write-Host "2. Enable Developer mode" -ForegroundColor White
Write-Host "3. Click Load unpacked" -ForegroundColor White
Write-Host "4. Select this folder" -ForegroundColor White
Write-Host "`nAll files are ready!" -ForegroundColor Green