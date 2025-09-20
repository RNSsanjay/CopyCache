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

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'ping') {
    sendResponse({ status: 'pong' });
  }
  
  return true;
});