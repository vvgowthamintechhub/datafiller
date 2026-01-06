// Configuration URL - change this to your app URL
const APP_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('extensionToggle');
  const statusBar = document.getElementById('statusBar');
  const statusText = document.getElementById('statusText');
  const siteInfo = document.getElementById('siteInfo');
  const runFillBtn = document.getElementById('runFill');
  
  // Load saved state
  const result = await chrome.storage.local.get(['extensionEnabled', 'siteConfigs']);
  toggle.checked = result.extensionEnabled || false;
  updateStatus(toggle.checked);
  
  // Check current tab for matching site config
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const configs = result.siteConfigs || [];
  const matchedSite = configs.find(site => {
    if (!site.pages) return false;
    return site.pages.some(page => {
      try {
        const regex = new RegExp(page.url);
        return regex.test(tab.url);
      } catch {
        return tab.url.includes(page.url);
      }
    });
  });
  
  if (matchedSite) {
    siteInfo.textContent = 'Site: ' + matchedSite.name;
    siteInfo.classList.add('matched');
    runFillBtn.disabled = !toggle.checked;
  }
  
  // Toggle handler
  toggle.addEventListener('change', async () => {
    const enabled = toggle.checked;
    await chrome.storage.local.set({ extensionEnabled: enabled });
    updateStatus(enabled);
    runFillBtn.disabled = !enabled || !matchedSite;
    
    // Notify content script
    try {
      chrome.tabs.sendMessage(tab.id, { 
        action: 'toggleExtension', 
        enabled: enabled 
      });
    } catch (e) {
      console.log('Could not send message to content script');
    }
  });
  
  function updateStatus(enabled) {
    if (enabled) {
      statusBar.className = 'status on';
      statusText.textContent = 'Extension is ON';
    } else {
      statusBar.className = 'status off';
      statusText.textContent = 'Extension is OFF';
    }
  }
  
  // Open app button
  document.getElementById('openApp').addEventListener('click', () => {
    chrome.tabs.create({ url: APP_URL });
  });
  
  // Run fill button
  runFillBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
      chrome.tabs.sendMessage(tab.id, { action: 'runFill' });
      window.close();
    } catch (e) {
      console.log('Could not send fill message');
    }
  });
});
