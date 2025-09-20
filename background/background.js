// Background script for CopyCache extension

console.log('CopyCache background script starting...');

// Storage for clipboard monitoring
let lastClipboardText = '';
const MAX_ITEMS = 200;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('CopyCache extension installed');
  chrome.storage.local.set({ copies: [] }, () => {
    console.log('Storage initialized');
  });
});

chrome.runtime.onStartup.addListener(() => {
  console.log('CopyCache extension started');
});

// Handle extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked for tab:', tab.id);
  
  try {
    // Check if we can inject scripts into this tab
    const url = tab.url;
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || 
        url.startsWith('edge://') || url.startsWith('about:') || url.startsWith('moz-extension://')) {
      console.log('Cannot inject into system page, opening popup instead');
      await openFallbackTab();
      return;
    }

    // Try to inject the side panel
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggleCopyCacheSidePanel
    });
    
    console.log('CopyCache side panel injected successfully');
  } catch (error) {
    console.error('Error injecting side panel:', error);
    console.log('Opening fallback tab due to injection failure');
    await openFallbackTab();
  }
});

// Fallback function to open in new tab
async function openFallbackTab() {
  try {
    const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('popup/popup.html') });
    
    if (tabs.length > 0) {
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('popup/popup.html'),
        active: true
      });
    }
  } catch (error) {
    console.error('Error opening fallback tab:', error);
  }
}

// Main function to inject into web pages
function toggleCopyCacheSidePanel() {
  try {
    const PANEL_ID = 'copycache-side-panel';
    const existingPanel = document.getElementById(PANEL_ID);
    
    if (existingPanel) {
      // Remove existing panel with animation
      existingPanel.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (existingPanel.parentNode) {
          existingPanel.remove();
        }
      }, 300);
      return;
    }
    
    // Create side panel
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.style.cssText = 
      'position: fixed;' +
      'top: 0;' +
      'right: 0;' +
      'width: 420px;' +
      'height: 100vh;' +
      'background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);' +
      'color: white;' +
      'z-index: 2147483647;' +
      'box-shadow: -5px 0 25px rgba(0, 0, 0, 0.6);' +
      'border-left: 2px solid rgba(255, 255, 255, 0.2);' +
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
      'overflow: hidden;' +
      'transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);' +
      'transform: translateX(100%);' +
      'backdrop-filter: blur(10px);';
    
    // Panel content
    panel.innerHTML = 
      '<div style="height: 100%; display: flex; flex-direction: column;">' +
        '<!-- Header -->' +
        '<div style="background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding: 20px; display: flex; align-items: center; justify-content: space-between;">' +
          '<div style="display: flex; align-items: center; gap: 12px;">' +
            '<div style="width: 60px; height: 48px; background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05)); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3); position: relative; overflow: hidden;">' +
              '<div style="position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%); animation: slideLeftRight 3s ease-in-out infinite;"></div>' +
              '<span style="font-size: 18px; font-weight: 800; z-index: 1; position: relative; letter-spacing: 2px; color: #ffffff; text-shadow: 0 0 10px rgba(255,255,255,0.5); font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">RNS</span>' +
            '</div>' +
            '<div>' +
              '<h2 style="margin: 0; font-size: 20px; font-weight: 700;">CopyCache</h2>' +
              '<p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.7);">Smart Clipboard Manager</p>' +
            '</div>' +
          '</div>' +
          '<button id="copycache-close-btn" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); color: white; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; transition: all 0.2s ease;">×</button>' +
        '</div>' +
        
        '<!-- Content Area -->' +
        '<div style="flex: 1; overflow-y: auto; padding: 20px;">' +
          '<!-- Quick Actions -->' +
          '<div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 20px; margin-bottom: 20px;">' +
            '<h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Quick Actions</h3>' +
            '<div style="display: grid; gap: 12px;">' +
              '<button onclick="openFullCopyCache()" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 14px 16px; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.3s ease; display: flex; align-items: center; gap: 10px; font-size: 14px;">' +
                '<span style="font-size: 18px;">📋</span>' +
                '<span>View Full Clipboard History</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
          
          '<!-- Recent Clipboard Items -->' +
          '<div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 20px; margin-bottom: 20px;">' +
            '<h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Recent Clips</h3>' +
            '<div id="copycache-clips" style="display: grid; gap: 12px; max-height: 350px; overflow-y: auto;">' +
              '<div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 16px; text-align: center; color: rgba(255, 255, 255, 0.6);">' +
                '<p style="margin: 0; font-size: 14px;">Loading clipboard items...</p>' +
                '<small style="color: rgba(255, 255, 255, 0.4);">Copy text to see it here</small>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        
        '<!-- Chat Input Area -->' +
        '<div style="background: linear-gradient(180deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.98)); backdrop-filter: blur(20px); border-top: 1px solid rgba(255, 255, 255, 0.15); padding: 20px;">' +
          '<div style="display: flex; gap: 12px; align-items: end;">' +
            '<textarea placeholder="Type your message here..." style="width: 100%; background: rgba(255, 255, 255, 0.08); border: 2px solid rgba(255, 255, 255, 0.15); color: white; padding: 16px 20px; border-radius: 16px; resize: none; min-height: 52px; max-height: 140px; font-family: inherit; font-size: 15px; outline: none; box-sizing: border-box;"></textarea>' +
            '<button style="background: linear-gradient(135deg, rgba(74, 144, 226, 0.8), rgba(56, 119, 200, 0.9)); border: 2px solid rgba(255, 255, 255, 0.2); color: white; width: 52px; height: 52px; border-radius: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">→</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      
      '<style>' +
        '@keyframes slideLeftRight {' +
          '0% { transform: translateX(-100%); opacity: 0; }' +
          '50% { opacity: 1; }' +
          '100% { transform: translateX(100%); opacity: 0; }' +
        '}' +
      '</style>';
    
    // Add to page
    document.body.appendChild(panel);
    
    // Animate in
    setTimeout(() => {
      panel.style.transform = 'translateX(0)';
    }, 10);
    
    // Setup event handlers
    const closeBtn = document.getElementById('copycache-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        panel.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (panel.parentNode) {
            panel.remove();
          }
        }, 300);
      };
    }
    
    // Global functions for the panel
    window.openFullCopyCache = () => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const url = chrome.runtime.getURL('popup/popup.html');
        window.open(url, '_blank');
      }
    };
    
    window.copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        showCopyFeedback();
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    };
    
    function showCopyFeedback() {
      const feedback = document.createElement('div');
      feedback.style.cssText = 
        'position: fixed; top: 20px; right: 440px; background: rgba(255, 255, 255, 0.9); color: black; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 500; z-index: 2147483648; transition: all 0.3s ease; opacity: 0;';
      feedback.textContent = 'Copied to clipboard!';
      document.body.appendChild(feedback);
      
      setTimeout(() => feedback.style.opacity = '1', 10);
      setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => {
          if (feedback.parentNode) {
            feedback.remove();
          }
        }, 300);
      }, 2000);
    }
    
    // Load clipboard items
    loadClipboardItems();
    
    // Prevent panel from interfering with page
    panel.addEventListener('mousedown', (e) => e.stopPropagation());
    panel.addEventListener('click', (e) => e.stopPropagation());
    panel.addEventListener('keydown', (e) => e.stopPropagation());
    
  } catch (error) {
    console.error('Error creating side panel:', error);
  }
  
  // Function to load clipboard items into the panel
  function loadClipboardItems() {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    
    chrome.storage.local.get(['copies'], (result) => {
      const copies = result.copies || [];
      const clipsContainer = document.getElementById('copycache-clips');
      
      if (!clipsContainer) return;
      
      if (copies.length === 0) {
        clipsContainer.innerHTML = 
          '<div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 16px; text-align: center; color: rgba(255, 255, 255, 0.6);">' +
            '<p style="margin: 0; font-size: 14px;">No clipboard items yet</p>' +
            '<small style="color: rgba(255, 255, 255, 0.4);">Copy text to see it here</small>' +
          '</div>';
        return;
      }
      
      const itemsHtml = copies.slice(0, 5).map((item) => {
        const text = typeof item === 'string' ? item : item.text;
        const type = typeof item === 'object' && item.type ? item.type.toUpperCase() : 'TEXT';
        const preview = text.length > 60 ? text.substring(0, 60) + '...' : text;
        const safeText = text.replace(/'/g, '&apos;').replace(/"/g, '&quot;');
        
        let typeColor = 'rgba(255, 255, 255, 0.1)';
        if (type === 'URL') typeColor = 'rgba(74, 144, 226, 0.2)';
        else if (type === 'EMAIL') typeColor = 'rgba(34, 197, 94, 0.2)';
        else if (type === 'CODE') typeColor = 'rgba(239, 68, 68, 0.2)';
        
        return (
          '<div style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.2s ease;" ' +
          'onmouseover="this.style.background=\'rgba(255, 255, 255, 0.12)\'; this.style.transform=\'translateY(-1px)\'" ' +
          'onmouseout="this.style.background=\'rgba(255, 255, 255, 0.08)\'; this.style.transform=\'translateY(0)\'" ' +
          'onclick="copyToClipboard(\'' + safeText + '\');">' +
            '<p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; line-height: 1.4;">' + preview + '</p>' +
            '<div style="display: flex; justify-content: space-between; align-items: center;">' +
              '<small style="color: rgba(255, 255, 255, 0.5); font-size: 11px;">Just now • ' + text.length + ' chars</small>' +
              '<span style="background: ' + typeColor + '; padding: 2px 6px; border-radius: 4px; font-size: 10px; color: rgba(255, 255, 255, 0.8);">' + type + '</span>' +
            '</div>' +
          '</div>'
        );
      }).join('');
      
      clipsContainer.innerHTML = itemsHtml;
    });
  }
}

// Clipboard management functions
function detectContentType(text) {
  if (!text) return 'empty';
  
  const urlRegex = /^https?:\/\/[^\s]+$/i;
  if (urlRegex.test(text.trim())) return 'url';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(text.trim())) return 'email';
  
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (phoneRegex.test(text.replace(/[\s\-\(\)]/g, ''))) return 'phone';
  
  if (!isNaN(text.trim()) && text.trim() !== '') return 'number';
  
  if (text.includes('{') || text.includes('function') || text.includes('class ') || text.includes('import ')) return 'code';
  
  if (text.length > 100) return 'longtext';
  
  return 'text';
}

async function addClipboardItem(text) {
  if (!text || text === lastClipboardText) return;
  
  try {
    const result = await chrome.storage.local.get(['copies']);
    let copies = result.copies || [];
    
    copies = copies.filter(item => {
      const itemText = typeof item === 'string' ? item : item.text;
      return itemText !== text;
    });
    
    const newItem = {
      text: text,
      timestamp: Date.now(),
      type: detectContentType(text),
      id: Date.now() + Math.random()
    };
    
    copies.unshift(newItem);
    
    if (copies.length > MAX_ITEMS) {
      copies = copies.slice(0, MAX_ITEMS);
    }
    
    await chrome.storage.local.set({ copies });
    lastClipboardText = text;
    console.log('Added clipboard item:', text.substring(0, 50) + '...');
  } catch (error) {
    console.error('Error adding clipboard item:', error);
  }
}

// Message handling
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
    return true;
  }
  
  return true;
});

console.log('CopyCache background script loaded successfully');
  
  // Panel content with improved UI
  panel.innerHTML = `
    <div style="height: 100%; display: flex; flex-direction: column;">
      <!-- Header with animated logo -->
      <div style="
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div id="copycache-logo" style="
            width: 60px;
            height: 48px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid rgba(255, 255, 255, 0.3);
            position: relative;
            overflow: hidden;
            animation: logoGlow 3s ease-in-out infinite alternate;
          ">
            <div style="
              position: absolute;
              inset: 0;
              background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
              animation: slideLeftRight 3s ease-in-out infinite;
            "></div>
            <span style="
              font-size: 18px; 
              font-weight: 800; 
              z-index: 1; 
              position: relative; 
              letter-spacing: 2px;
              color: #ffffff;
              text-shadow: 0 0 10px rgba(255,255,255,0.5);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              animation: textPulse 2s ease-in-out infinite;
            ">RNS</span>
          </div>
          <div>
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">CopyCache</h2>
            <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.7);">Smart Clipboard Manager</p>
          </div>
        </div>
        <button id="copycache-close-btn" style="
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          transition: all 0.2s ease;
        ">×</button>
      </div>
      
      <!-- Scrollable Content Area -->
      <div style="flex: 1; overflow-y: auto; padding: 20px;">
        <!-- Quick Actions -->
        <div style="
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        ">
          <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Quick Actions</h3>
          <div style="display: grid; gap: 12px;">
            <button style="
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: white;
              padding: 14px 16px;
              border-radius: 10px;
              cursor: pointer;
              text-align: left;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              gap: 10px;
              font-size: 14px;
            ">
              <span style="font-size: 18px;">📋</span>
              <span>View Full Clipboard History</span>
            </button>
            <button style="
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: white;
              padding: 14px 16px;
              border-radius: 10px;
              cursor: pointer;
              text-align: left;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              gap: 10px;
              font-size: 14px;
            ">
              <span style="font-size: 18px;">💬</span>
              <span>Open AI Assistant</span>
            </button>
          </div>
        </div>
        
        <!-- Recent Clipboard Items -->
        <div style="
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        ">
          <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Recent Clips</h3>
          <div id="copycache-clips" style="display: grid; gap: 12px; max-height: 350px; overflow-y: auto;">
            <!-- Clipboard items will be loaded here -->
            <div style="
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              padding: 16px;
              text-align: center;
              color: rgba(255, 255, 255, 0.6);
            ">
              <p style="margin: 0; font-size: 14px;">Loading clipboard items...</p>
              <small style="color: rgba(255, 255, 255, 0.4);">Copy text to see it here</small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Fixed Chat Input Area -->
      <div style="
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.98));
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        padding: 20px;
        position: relative;
      ">
        <div style="display: flex; gap: 12px; align-items: end;">
          <div style="flex: 1; position: relative;">
            <textarea placeholder="Type your message here..." style="
              width: 100%;
              background: rgba(255, 255, 255, 0.08);
              border: 2px solid rgba(255, 255, 255, 0.15);
              color: white;
              padding: 16px 20px;
              border-radius: 16px;
              resize: none;
              min-height: 52px;
              max-height: 140px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 15px;
              line-height: 1.5;
              box-sizing: border-box;
              transition: all 0.3s ease;
              outline: none;
              scrollbar-width: thin;
              scrollbar-color: rgba(255,255,255,0.3) transparent;
            " onfocus="
              this.style.borderColor='rgba(255, 255, 255, 0.4)'; 
              this.style.background='rgba(255, 255, 255, 0.12)';
              this.style.boxShadow='0 0 0 3px rgba(255, 255, 255, 0.1)';
            " onblur="
              this.style.borderColor='rgba(255, 255, 255, 0.15)'; 
              this.style.background='rgba(255, 255, 255, 0.08)';
              this.style.boxShadow='none';
            " oninput="
              // Auto-resize functionality
              this.style.height = 'auto';
              const newHeight = Math.min(Math.max(this.scrollHeight, 52), 140);
              this.style.height = newHeight + 'px';
            " onkeydown="
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                const message = this.value.trim();
                if (message) {
                  sendMessage(message);
                  this.value = '';
                  this.style.height = '52px';
                }
              }
            "></textarea>
            <!-- Character counter -->
            <div style="
              position: absolute;
              bottom: -22px;
              right: 8px;
              font-size: 11px;
              color: rgba(255, 255, 255, 0.4);
              pointer-events: none;
            ">Press Enter to send • Shift+Enter for new line</div>
          </div>
          <button onclick="
            const input = this.parentElement.querySelector('textarea');
            const message = input.value.trim();
            if (message) {
              sendMessage(message);
              input.value = '';
              input.style.height = '52px';
              input.focus();
            }
          " style="
            background: linear-gradient(135deg, rgba(74, 144, 226, 0.8), rgba(56, 119, 200, 0.9));
            border: 2px solid rgba(255, 255, 255, 0.2);
            color: white;
            width: 52px;
            height: 52px;
            border-radius: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
          " onmouseover="
            this.style.background='linear-gradient(135deg, rgba(74, 144, 226, 1), rgba(56, 119, 200, 1))';
            this.style.transform='scale(1.05) translateY(-2px)';
            this.style.boxShadow='0 6px 20px rgba(74, 144, 226, 0.4)';
          " onmouseout="
            this.style.background='linear-gradient(135deg, rgba(74, 144, 226, 0.8), rgba(56, 119, 200, 0.9))';
            this.style.transform='scale(1) translateY(0)';
            this.style.boxShadow='0 4px 12px rgba(74, 144, 226, 0.3)';
          " onmousedown="this.style.transform='scale(0.95) translateY(0)'" onmouseup="this.style.transform='scale(1.05) translateY(-2px)'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes logoGlow {
        0% { 
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }
        100% { 
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }
      }
      @keyframes slideLeftRight {
        0% { transform: translateX(-100%); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
      }
      @keyframes textPulse {
        0% { 
          text-shadow: 0 0 10px rgba(255,255,255,0.5);
          transform: scale(1);
        }
        50% { 
          text-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.4);
          transform: scale(1.05);
        }
        100% { 
          text-shadow: 0 0 10px rgba(255,255,255,0.5);
          transform: scale(1);
        }
      }
      #copycache-side-panel *::-webkit-scrollbar {
        width: 6px;
      }
      #copycache-side-panel *::-webkit-scrollbar-track {
        background: transparent;
      }
      #copycache-side-panel *::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }
      #copycache-side-panel *::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    </style>
    
    <script>
      // Send message function for chat
      function sendMessage(message) {
        if (!message || !message.trim()) return;
        
        console.log('Sending message:', message);
        
        // Add message to chat (placeholder for now)
        const chatArea = document.querySelector('#copycache-clips');
        if (chatArea) {
          const messageDiv = document.createElement('div');
          messageDiv.style.cssText = 
            'background: rgba(74, 144, 226, 0.1);' +
            'border: 1px solid rgba(74, 144, 226, 0.3);' +
            'border-radius: 10px;' +
            'padding: 14px;' +
            'margin-bottom: 8px;' +
            'color: rgba(255, 255, 255, 0.9);' +
            'font-size: 13px;' +
            'line-height: 1.4;';
          
          messageDiv.innerHTML = 
            '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">' +
            '<strong style="color: rgba(74, 144, 226, 1);">You:</strong>' +
            '<small style="color: rgba(255, 255, 255, 0.5); font-size: 11px;">now</small>' +
            '</div>' +
            '<p style="margin: 0;">' + message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>';
          
          chatArea.insertBefore(messageDiv, chatArea.firstChild);
          
          // Simulate AI response after a delay
          setTimeout(() => {
            const responseDiv = document.createElement('div');
            responseDiv.style.cssText = 
              'background: rgba(255, 255, 255, 0.08);' +
              'border: 1px solid rgba(255, 255, 255, 0.15);' +
              'border-radius: 10px;' +
              'padding: 14px;' +
              'margin-bottom: 8px;' +
              'color: rgba(255, 255, 255, 0.9);' +
              'font-size: 13px;' +
              'line-height: 1.4;';
            
            responseDiv.innerHTML = 
              '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">' +
              '<strong style="color: rgba(255, 255, 255, 0.8);">CopyCache AI:</strong>' +
              '<small style="color: rgba(255, 255, 255, 0.5); font-size: 11px;">now</small>' +
              '</div>' +
              '<p style="margin: 0;">I understand you want to work with: "' + message.substring(0, 50) + (message.length > 50 ? '..." ' : '" ') + 'How can I help you with your clipboard management?</p>';
            
            chatArea.insertBefore(responseDiv, chatArea.firstChild);
          }, 1000);
        }
      }
      
      // Copy to clipboard function
      function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          // Show feedback
          const button = event.target.closest('div');
          const originalBg = button.style.background;
          button.style.background = 'rgba(74, 144, 226, 0.2)';
          button.style.borderColor = 'rgba(74, 144, 226, 0.4)';
          
          setTimeout(() => {
            button.style.background = originalBg;
            button.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }, 200);
        });
      }
      
      // Load and display clipboard items
      function loadClipboardItems() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.get(['copies'], (result) => {
            const copies = result.copies || [];
            const clipsContainer = document.getElementById('copycache-clips');
            
            if (!clipsContainer) return;
            
            if (copies.length === 0) {
              clipsContainer.innerHTML = 
                '<div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 16px; text-align: center; color: rgba(255, 255, 255, 0.6);">' +
                '<p style="margin: 0; font-size: 14px;">No clipboard items yet</p>' +
                '<small style="color: rgba(255, 255, 255, 0.4);">Copy text to see it here</small>' +
                '</div>';
              return;
            }
            
            const itemsHtml = copies.slice(0, 5).map((item, index) => {
              const text = typeof item === 'string' ? item : item.text;
              const type = typeof item === 'object' && item.type ? item.type.toUpperCase() : 'TEXT';
              const preview = text.length > 60 ? text.substring(0, 60) + '...' : text;
              
              let typeColor = 'rgba(255, 255, 255, 0.1)';
              if (type === 'URL') typeColor = 'rgba(74, 144, 226, 0.2)';
              else if (type === 'EMAIL') typeColor = 'rgba(34, 197, 94, 0.2)';
              else if (type === 'CODE') typeColor = 'rgba(239, 68, 68, 0.2)';
              
              return 
                '<div style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.2s ease;" ' +
                'onmouseover="this.style.background=\\'rgba(255, 255, 255, 0.12)\\'; this.style.transform=\\'translateY(-1px)\\'" ' +
                'onmouseout="this.style.background=\\'rgba(255, 255, 255, 0.08)\\'; this.style.transform=\\'translateY(0)\\'" ' +
                'onclick="copyToClipboard(\\''+text.replace(/'/g, "\\\\'")+'\\'); event.stopPropagation();">' +
                '<p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; line-height: 1.4;">' + preview + '</p>' +
                '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                '<small style="color: rgba(255, 255, 255, 0.5); font-size: 11px;">Just now • ' + text.length + ' chars</small>' +
                '<span style="background: ' + typeColor + '; padding: 2px 6px; border-radius: 4px; font-size: 10px; color: rgba(255, 255, 255, 0.8);">' + type + '</span>' +
                '</div>' +
                '</div>';
            }).join('');
            
            clipsContainer.innerHTML = itemsHtml;
          });
        }
      }
      
      // Load items when panel opens
      loadClipboardItems();
      
      // Listen for storage changes to update items
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.onChanged.addListener((changes, namespace) => {
          if (namespace === 'local' && changes.copies) {
            loadClipboardItems();
          }
        });
      }
    </script>
  `;
  
  // Add to page
  document.body.appendChild(panel);
  
  // Animate in
  setTimeout(() => {
    panel.style.transform = 'translateX(0)';
  }, 10);
  
  // Close button handler
  document.getElementById('copycache-close-btn').onclick = () => {
    panel.style.transform = 'translateX(100%)';
    setTimeout(() => panel.remove(), 300);
  };
  
  // Helper functions
  window.copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show copied feedback
      const feedback = document.createElement('div');
      feedback.style.cssText = 
        'position: fixed;' +
        'top: 20px;' +
        'right: 440px;' +
        'background: rgba(255, 255, 255, 0.9);' +
        'color: black;' +
        'padding: 8px 16px;' +
        'border-radius: 6px;' +
        'font-size: 12px;' +
        'font-weight: 500;' +
        'z-index: 2147483648;' +
        'transition: all 0.3s ease;' +
        'transform: translateX(100px);' +
        'opacity: 0;';
      feedback.textContent = 'Copied to clipboard!';
      document.body.appendChild(feedback);
      
      setTimeout(() => {
        feedback.style.transform = 'translateX(0)';
        feedback.style.opacity = '1';
      }, 10);
      
      setTimeout(() => {
        feedback.style.transform = 'translateX(100px)';
        feedback.style.opacity = '0';
        setTimeout(() => feedback.remove(), 300);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  window.sendMessage = (message) => {
    if (!message.trim()) return;
    console.log('Sending message:', message);
    // Add message handling logic here
  };
  
  window.openFullCopyCache = () => {
    window.open(chrome.runtime.getURL('popup/popup.html'), '_blank');
  };
  
  // Prevent panel from interfering with page interactions
  panel.addEventListener('mousedown', (e) => e.stopPropagation());
  panel.addEventListener('click', (e) => e.stopPropagation());
  panel.addEventListener('keydown', (e) => e.stopPropagation());


// Clipboard monitoring and management
// let lastClipboardText = '';
// const MAX_ITEMS = 100;

// Function to add new clipboard item
async function addClipboardItem(text) {
  if (!text || text === lastClipboardText) return;
  
  try {
    const result = await chrome.storage.local.get(['copies']);
    let copies = result.copies || [];
    
    // Remove if already exists to move to top
    copies = copies.filter(item => item !== text);
    
    // Add to beginning with metadata
    const newItem = {
      text: text,
      timestamp: Date.now(),
      type: detectContentType(text),
      id: Date.now() + Math.random()
    };
    
    copies.unshift(newItem);
    
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

// Enhanced clipboard monitoring with active tab focus
async function startClipboardMonitoring() {
  console.log('Starting clipboard monitoring...');
  
  // Check clipboard every 500ms when extension is active
  setInterval(async () => {
    try {
      // Get the current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs.length) return;
      
      // Inject clipboard reading script into active tab
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: readClipboardContent
        });
        
        if (results && results[0] && results[0].result) {
          const clipboardText = results[0].result;
          if (clipboardText && clipboardText !== lastClipboardText) {
            await addClipboardItem(clipboardText);
          }
        }
      } catch (scriptError) {
        // Silently ignore injection errors (some pages block scripts)
        // console.log('Could not inject clipboard reader:', scriptError.message);
      }
    } catch (error) {
      console.error('Clipboard monitoring error:', error);
    }
  }, 500);
}

// Function to inject into web pages to read clipboard
function readClipboardContent() {
  try {
    return navigator.clipboard.readText().then(text => text).catch(() => null);
  } catch (error) {
    return null;
  }
}

// Start clipboard monitoring when extension loads
chrome.runtime.onStartup.addListener(startClipboardMonitoring);
chrome.runtime.onInstalled.addListener(startClipboardMonitoring);

// Immediate start
startClipboardMonitoring();

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