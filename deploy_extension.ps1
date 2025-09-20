# CopyCache Extension Deployment Script
# This script prepares the extension for deployment

Write-Host "🚀 CopyCache Extension Deployment" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Step 1: Build the React popup
Write-Host "`n📦 Building React popup..." -ForegroundColor Yellow
Set-Location ".\popup"
& npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Set-Location ".."

# Step 2: Copy essential assets
Write-Host "`n📁 Copying assets..." -ForegroundColor Yellow
if (Test-Path ".\images\copynew.png") {
    Copy-Item ".\images\copynew.png" ".\popup\build\copynew.png" -Force
}
if (Test-Path ".\images\moon.gif") {
    Copy-Item ".\images\moon.gif" ".\popup\build\moon.gif" -Force
}
if (Test-Path ".\images\") {
    if (!(Test-Path ".\popup\build\images\")) {
        New-Item -ItemType Directory -Path ".\popup\build\images\" -Force
    }
    Copy-Item ".\images\*" ".\popup\build\images\" -Recurse -Force
}

# Step 3: Validate required files
Write-Host "`n✅ Validating extension files..." -ForegroundColor Yellow

$requiredFiles = @(
    "manifest.json",
    "background\background.js", 
    "content\content.js",
    "popup\build\index.html",
    "images\copynew.png"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        $missingFiles += $file
    }
}

# Check for JS and CSS files with wildcards
$jsFiles = Get-ChildItem ".\popup\build\static\js\*.js" -ErrorAction SilentlyContinue
$cssFiles = Get-ChildItem ".\popup\build\static\css\*.css" -ErrorAction SilentlyContinue

if ($jsFiles.Count -eq 0) {
    $missingFiles += "popup\build\static\js\*.js"
}
if ($cssFiles.Count -eq 0) {
    $missingFiles += "popup\build\static\css\*.css"
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    exit 1
}

# Step 4: Display deployment summary
Write-Host "`n🎉 Extension ready for deployment!" -ForegroundColor Green
Write-Host "`n📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "   ✓ Manifest configured with build popup" -ForegroundColor Green
Write-Host "   ✓ Background script ready" -ForegroundColor Green
Write-Host "   ✓ Content script with copy monitoring" -ForegroundColor Green
Write-Host "   ✓ React popup built and optimized" -ForegroundColor Green
Write-Host "   ✓ All assets copied" -ForegroundColor Green

Write-Host "`n🔧 To load in Chrome:" -ForegroundColor Yellow
Write-Host "   1. Open Chrome and go to chrome://extensions/" -ForegroundColor White
Write-Host "   2. Enable 'Developer mode'" -ForegroundColor White
Write-Host "   3. Click 'Load unpacked'" -ForegroundColor White
Write-Host "   4. Select this folder: $PWD" -ForegroundColor White

Write-Host "`n🧪 To test copy functionality:" -ForegroundColor Yellow
Write-Host "   1. Copy any text (Ctrl+C)" -ForegroundColor White
Write-Host "   2. Click the CopyCache extension icon" -ForegroundColor White
Write-Host "   3. View your copied items in the popup" -ForegroundColor White
Write-Host "   4. Click any item to copy it back" -ForegroundColor White

Write-Host "`n📄 Files structure:" -ForegroundColor Cyan
Write-Host "   📁 CopyCache/" -ForegroundColor Blue
Write-Host "   ├── 📄 manifest.json (Extension config)" -ForegroundColor Gray
Write-Host "   ├── 📁 background/ (Service worker)" -ForegroundColor Gray
Write-Host "   ├── 📁 content/ (Page scripts)" -ForegroundColor Gray  
Write-Host "   ├── 📁 images/ (Icons)" -ForegroundColor Gray
Write-Host "   └── 📁 popup/build/ (React app)" -ForegroundColor Gray

Write-Host "`n✨ Extension is ready!" -ForegroundColor Green