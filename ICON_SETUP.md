# 🐿️ CopyCache Logo Setup Guide

## Quick Setup Instructions:

### Option 1: Use the Icon Generator Tool (Recommended)
1. **Open the icon generator**: Double-click `icon_generator.html` in your file explorer
2. **Upload your logo**: Drag and drop your squirrel logo image into the tool
3. **Generate icons**: Click "Generate Icons" button
4. **Download all sizes**: Download icon16.png, icon32.png, icon48.png, and icon128.png
5. **Save to images folder**: Place all downloaded files in `d:\RNS\CopyCache\images\`

### Option 2: Use PowerShell Script
1. **Save your logo**: Save your squirrel logo as `logo.png` in the `images/` folder
2. **Run the script**: Right-click `create_icons.ps1` → "Run with PowerShell"
3. **Check output**: The script will create all required icon sizes automatically

### Option 3: Manual Creation
Use any image editor to create these sizes from your logo:
- `icon16.png` - 16×16 pixels (browser toolbar)
- `icon32.png` - 32×32 pixels (Windows taskbar)  
- `icon48.png` - 48×48 pixels (extension management)
- `icon128.png` - 128×128 pixels (Chrome Web Store)

## After Adding Icons:
1. Go to `chrome://extensions/`
2. Find your CopyCache extension
3. Click the refresh/reload button
4. Your beautiful squirrel logo should now appear! 🎉

## File Structure:
```
d:\RNS\CopyCache\
├── images/
│   ├── icon16.png   ← Your logo 16×16
│   ├── icon32.png   ← Your logo 32×32
│   ├── icon48.png   ← Your logo 48×48
│   └── icon128.png  ← Your logo 128×128
├── icon_generator.html ← Tool to create icons
├── create_icons.ps1    ← PowerShell script
└── manifest.json       ← Already configured!
```

## ✅ Ready to Use:
- Manifest.json is already configured with proper icon references
- Extension will automatically use your new logo once files are in place
- No code changes needed - just add the PNG files!

**The squirrel with circuit design will make a perfect tech logo for your clipboard manager extension!** 🐿️⚡