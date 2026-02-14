// ManoProtect Shield - Background Service Worker
const API_BASE = 'https://payment-dashboard-70.preview.emergentagent.com/api';

// Check URL against ManoProtect threat intelligence
async function checkUrl(url) {
  try {
    const response = await fetch(`${API_BASE}/realtime/check/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return await response.json();
  } catch (error) {
    console.error('ManoProtect API error:', error);
    return { error: true, message: error.message };
  }
}

// Context menu for checking links
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'manoprotect-check-link',
    title: 'Verificar con ManoProtect',
    contexts: ['link']
  });
  
  chrome.contextMenus.create({
    id: 'manoprotect-check-selection',
    title: 'Verificar seleccion con ManoProtect',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let valueToCheck = '';
  
  if (info.menuItemId === 'manoprotect-check-link') {
    valueToCheck = info.linkUrl;
  } else if (info.menuItemId === 'manoprotect-check-selection') {
    valueToCheck = info.selectionText;
  }
  
  if (valueToCheck) {
    const result = await checkUrl(valueToCheck);
    
    // Send result to content script
    chrome.tabs.sendMessage(tab.id, {
      type: 'MANOPROTECT_RESULT',
      data: result,
      checkedValue: valueToCheck
    });
  }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_URL') {
    checkUrl(message.url).then(result => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'GET_CURRENT_TAB_URL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({ url: tabs[0].url });
      }
    });
    return true;
  }
});
