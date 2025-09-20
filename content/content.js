// Content script to capture copy events

console.log('CopyCache content script loaded');

document.addEventListener('copy', (event) => {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText && selectedText.length > 0) {
    console.log('Text copied:', selectedText);
    
    // Store the copied text
    chrome.storage.local.get(['copies'], (result) => {
      const copies = result.copies || [];
      
      // Avoid duplicates
      if (!copies.includes(selectedText)) {
        copies.push(selectedText);
        // Keep only last 10 copies
        if (copies.length > 10) {
          copies.shift();
        }
        
        chrome.storage.local.set({ copies }, () => {
          console.log('Saved copies:', copies);
        });
      }
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCopies') {
    chrome.storage.local.get(['copies'], (result) => {
      sendResponse({ copies: result.copies || [] });
    });
    return true; // Keep the message channel open for async response
  }
});