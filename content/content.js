// Content script to capture copy events

document.addEventListener('copy', (event) => {
  const selectedText = window.getSelection().toString();
  if (selectedText) {
    // Store the copied text
    chrome.storage.local.get(['copies'], (result) => {
      const copies = result.copies || [];
      copies.push(selectedText);
      // Keep only last 10 copies
      if (copies.length > 10) {
        copies.shift();
      }
      chrome.storage.local.set({ copies });
    });
  }
});

// Also listen for paste to potentially manage clipboard
document.addEventListener('paste', (event) => {
  // Optional: handle paste events
});