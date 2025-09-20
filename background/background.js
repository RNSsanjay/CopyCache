// Background script for CopyCache extension

console.log('CopyCache background script starting...');

chrome.runtime.onInstalled.addListener(() => {
  console.log('CopyCache extension installed');
  
  // Initialize storage
  chrome.storage.local.set({ copies: [] }, () => {
    console.log('Storage initialized');
  });
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('CopyCache extension started');
});

// Handle action button click to open window
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked');
  
  // Check if window already exists
  const windows = await chrome.windows.getAll({ type: 'popup' });
  const existingWindow = windows.find(window => window.type === 'popup');
  
  if (existingWindow) {
    // Focus existing window
    chrome.windows.update(existingWindow.id, { focused: true });
  } else {
    // Get current screen info
    try {
      const currentWindow = await chrome.windows.getCurrent();
      const displays = await chrome.system.display.getInfo();
      
      // Use the primary display or current display
      const primaryDisplay = displays.find(display => display.isPrimary) || displays[0];
      const screenWidth = primaryDisplay.bounds.width;
      const screenHeight = primaryDisplay.bounds.height;
      
      const windowWidth = 450;
      const windowHeight = 650;
      const margin = 20;
      
      // Position in top-right corner with margin
      const left = screenWidth - windowWidth - margin;
      const top = margin;
      
      // Create new window positioned on the right side
      chrome.windows.create({
        url: 'popup/popup.html',
        type: 'popup',
        width: windowWidth,
        height: windowHeight,
        left: left,
        top: top,
        focused: true,
        state: 'normal'
      }, (window) => {
        console.log('CopyCache window created:', window.id);
        console.log(`Window positioned at: left=${left}, top=${top}, width=${windowWidth}, height=${windowHeight}`);
      });
      
    } catch (error) {
      console.error('Error getting display info:', error);
      
      // Fallback positioning
      const windowWidth = 450;
      const windowHeight = 650;
      
      chrome.windows.create({
        url: 'popup/popup.html',
        type: 'popup',
        width: windowWidth,
        height: windowHeight,
        left: 1450, // Fallback position
        top: 20,
        focused: true,
        state: 'normal'
      }, (window) => {
        console.log('CopyCache window created with fallback positioning:', window.id);
      });
    }
  }
});

// Clipboard monitoring and management
let lastClipboardText = '';
const MAX_ITEMS = 100;

// Function to add new clipboard item
async function addClipboardItem(text) {
  if (!text || text === lastClipboardText) return;
  
  try {
    const result = await chrome.storage.local.get(['copies']);
    let copies = result.copies || [];
    
    // Remove if already exists to move to top
    copies = copies.filter(item => item !== text);
    
    // Add to beginning
    copies.unshift(text);
    
    // Limit to MAX_ITEMS
    if (copies.length > MAX_ITEMS) {
      copies = copies.slice(0, MAX_ITEMS);
    }
    
    // Save back to storage
    await chrome.storage.local.set({ copies });
    
    lastClipboardText = text;
    console.log('Added clipboard item:', text.substring(0, 50) + '...');
  } catch (error) {
    console.error('Error adding clipboard item:', error);
  }
}

// Periodic clipboard check (fallback for Windows clipboard integration)
setInterval(async () => {
  try {
    // This is a fallback - proper Windows clipboard integration would need native messaging
    // For now, we'll rely on the popup to manage clipboard items
  } catch (error) {
    console.error('Clipboard check error:', error);
  }
}, 1000);

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'ping') {
    sendResponse({ status: 'pong' });
  } else if (request.action === 'addClipboardItem') {
    addClipboardItem(request.text);
    sendResponse({ status: 'added' });
  } else if (request.action === 'getClipboardItems') {
    chrome.storage.local.get(['copies'], (result) => {
      sendResponse({ copies: result.copies || [] });
    });
    return true; // Keep message channel open for async response
  }
  
  return true;
});