# CopyCache
CopyCache is a Chrome extension that manages copied text from Windows and provides a chat feature with Gemini AI.

## Features
- Capture copied text automatically
- Store up to 10 recent copies
- Chat with Gemini AI about your copied data
- Full black theme

## Setup

### Backend Server
1. Navigate to the `server` folder
2. Run `npm install`
3. Run `npm start` to start the server on port 3001

### Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `d:\RNS\CopyCache` folder
5. The extension should load and appear in the extensions list

### Frontend
The React popup is already built in `popup/build/`

## Usage
- Copy text in any webpage
- Click the extension icon to open the popup
- View your copied items
- Chat with Gemini about your copies

## API Key
The Gemini API key is hardcoded in `server/server.js`. In production, consider using environment variables.
