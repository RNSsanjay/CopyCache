// Background script for CopyCache extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('CopyCache extension installed');
});

// Listen for clipboard changes or copy events
// Note: Direct clipboard access is limited, but we can use content scripts

// For now, we'll rely on content script to capture copies