// Excellent Data Filler - Content Script
console.log('Excellent Data Filler content script loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'runFill') {
    console.log('Running form fill...');
    // Form filling logic would go here
    sendResponse({ success: true });
  }
});
