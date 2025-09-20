# PowerShell script to create Chrome extension icons from your logo
# This script requires the original logo image to be saved as 'logo.png' in the images folder

param(
    [string]$SourceImage = "d:\RNS\CopyCache\images\logo.png"
)

# Check if source image exists
if (-not (Test-Path $SourceImage)) {
    Write-Host "ERROR: Please save your logo image as 'logo.png' in the images folder first!" -ForegroundColor Red
    Write-Host "Expected location: $SourceImage" -ForegroundColor Yellow
    exit 1
}

# Define the sizes needed for Chrome extension
$sizes = @(16, 32, 48, 128)
$outputDir = "d:\RNS\CopyCache\images"

Write-Host "Creating Chrome extension icons from $SourceImage..." -ForegroundColor Green

# Function to resize image using .NET (if available)
function Resize-Image {
    param($InputPath, $OutputPath, $Size)
    
    try {
        Add-Type -AssemblyName System.Drawing
        $image = [System.Drawing.Image]::FromFile($InputPath)
        $resized = New-Object System.Drawing.Bitmap($Size, $Size)
        $graphics = [System.Drawing.Graphics]::FromImage($resized)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($image, 0, 0, $Size, $Size)
        $resized.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $graphics.Dispose()
        $resized.Dispose()
        $image.Dispose()
        Write-Host "Created: $OutputPath ($Size x $Size)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Failed to create $OutputPath : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Create icons for each required size
$success = $true
foreach ($size in $sizes) {
    $outputPath = Join-Path $outputDir "icon$size.png"
    if (-not (Resize-Image -InputPath $SourceImage -OutputPath $outputPath -Size $size)) {
        $success = $false
    }
}

if ($success) {
    Write-Host "`nSuccess! All icon sizes created:" -ForegroundColor Green
    foreach ($size in $sizes) {
        $iconPath = "images/icon$size.png"
        Write-Host "  - $iconPath ($size x $size pixels)" -ForegroundColor Cyan
    }
    Write-Host "`nYour Chrome extension is now ready with the new logo!" -ForegroundColor Green
    Write-Host "Reload the extension in chrome://extensions/ to see the changes." -ForegroundColor Yellow
} else {
    Write-Host "`nSome icons could not be created. You may need to use an image editing tool." -ForegroundColor Red
    Write-Host "Alternative: Use online tools like ResizeImage.net or Canva" -ForegroundColor Yellow
}