// Excellent Data Filler - Background Service Worker
console.log('Excellent Data Filler extension installed');

chrome.runtime.onInstalled.addListener(() => {
  // Initialize extension state
  chrome.storage.local.set({ 
    extensionEnabled: false,
    siteConfigs: []
  });
  
  // Set initial badge
  chrome.action.setBadgeText({ text: 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: '#dc3545' });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getConfig') {
    chrome.storage.local.get(['siteConfigs', 'extensionEnabled'], (result) => {
      sendResponse({
        configs: result.siteConfigs || [],
        enabled: result.extensionEnabled || false
      });
    });
    return true;
  }
  
  if (message.action === 'saveConfig') {
    chrome.storage.local.set({ siteConfigs: message.configs }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.action === 'getExcelData') {
    chrome.storage.local.get(['excelData'], (result) => {
      sendResponse(result.excelData || null);
    });
    return true;
  }
});

// Badge update based on extension state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.extensionEnabled) {
    const enabled = changes.extensionEnabled.newValue;
    chrome.action.setBadgeText({ text: enabled ? 'ON' : 'OFF' });
    chrome.action.setBadgeBackgroundColor({ 
      color: enabled ? '#0066ff' : '#dc3545' 
    });
  }
});
