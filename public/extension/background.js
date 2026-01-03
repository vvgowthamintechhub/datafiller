chrome.runtime.onInstalled.addListener(() => {
  console.log('Excellent Data Filler extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getConfig') {
    chrome.storage.local.get(['siteConfigs'], (result) => {
      sendResponse(result.siteConfigs || []);
    });
    return true;
  }
});
