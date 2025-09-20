// Background script for CopyCache extension

console.log('CopyCache background script starting...');

// Store window ID to track our extension window
let copyCacheWindowId = null;

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

// Handle window removal to clear stored window ID
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === copyCacheWindowId) {
    copyCacheWindowId = null;
    console.log('CopyCache window closed, cleared window ID');
  }
});

// Handle action button click to open in browser tab
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked');
  
  // Check if we already have a CopyCache tab open
  const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('popup/popup.html') });
  
  if (tabs.length > 0) {
    // Focus existing tab
    const existingTab = tabs[0];
    await chrome.tabs.update(existingTab.id, { active: true });
    await chrome.windows.update(existingTab.windowId, { focused: true });
    console.log('Focused existing CopyCache tab');
  } else {
    // Create new tab with CopyCache
    const newTab = await chrome.tabs.create({
      url: chrome.runtime.getURL('popup/popup.html'),
      active: true
    });
    copyCacheWindowId = newTab.id;
    console.log('Created new CopyCache tab:', newTab.id);
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