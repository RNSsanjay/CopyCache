// Content script to capture copy events

console.log('CopyCache content script loaded');

// Function to detect content type
function detectContentType(text) {
  if (!text) return 'empty';
  
  // URL detection
  const urlRegex = /^https?:\/\/[^\s]+$/i;
  if (urlRegex.test(text.trim())) return 'url';
  
  // Email detection
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(text.trim())) return 'email';
  
  // Phone number detection
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (phoneRegex.test(text.replace(/[\s\-\(\)]/g, ''))) return 'phone';
  
  // Number detection
  if (!isNaN(text.trim()) && text.trim() !== '') return 'number';
  
  // Code detection (simple heuristic)
  if (text.includes('{') || text.includes('function') || text.includes('class ') || text.includes('import ')) return 'code';
  
  // Long text
  if (text.length > 100) return 'longtext';
  
  return 'text';
}

document.addEventListener('copy', async (event) => {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText && selectedText.length > 0) {
    console.log('Text copied:', selectedText);
    
    try {
      // Send to background script for processing
      chrome.runtime.sendMessage({
        action: 'addClipboardItem',
        text: selectedText
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
        } else {
          console.log('Clipboard item added:', response);
        }
      });
    } catch (error) {
      console.error('Error processing copy event:', error);
    }
  }
});

// Also listen for paste events to detect clipboard usage
document.addEventListener('paste', async (event) => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText && clipboardText.trim().length > 0) {
      chrome.runtime.sendMessage({
        action: 'addClipboardItem',
        text: clipboardText.trim()
      });
    }
  } catch (error) {
    // Clipboard access might be restricted, ignore silently
    console.log('Cannot access clipboard on paste:', error);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCopies') {
    chrome.storage.local.get(['copies'], (result) => {
      sendResponse({ copies: result.copies || [] });
    });
    return true; // Keep the message channel open for async response
  } else if (request.action === 'copyToClipboard') {
    navigator.clipboard.writeText(request.text).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

// Monitor clipboard changes periodically (fallback)
let lastClipboardContent = '';
setInterval(async () => {
  try {
    const currentContent = await navigator.clipboard.readText();
    if (currentContent && currentContent !== lastClipboardContent && currentContent.trim().length > 0) {
      lastClipboardContent = currentContent;
      chrome.runtime.sendMessage({
        action: 'addClipboardItem',
        text: currentContent.trim()
      });
    }
  } catch (error) {
    // Clipboard access might be restricted, ignore silently
  }
}, 1000); // Check every second