// Configuration URL - change this to your app URL
const APP_URL = 'http://localhost:3000';

let matchedSite = null;
let matchedSiteId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('extensionToggle');
  const statusBar = document.getElementById('statusBar');
  const statusText = document.getElementById('statusText');
  const siteInfo = document.getElementById('siteInfo');
  const runFillBtn = document.getElementById('runFill');
  const openAppBtn = document.getElementById('openApp');
  
  // Load saved state
  const result = await chrome.storage.local.get(['extensionEnabled', 'siteConfigs']);
  toggle.checked = result.extensionEnabled || false;
  updateStatus(toggle.checked);
  
  // Check current tab for matching site config
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const configs = result.siteConfigs || [];
  
  matchedSite = configs.find(site => {
    if (!site.pages || site.status !== 'active') return false;
    return site.pages.some(page => {
      if (!page.active) return false;
      try {
        let matches = false;
        switch (page.matchType) {
          case 'regex':
            matches = new RegExp(page.url).test(tab.url);
            break;
          case 'exact':
            matches = tab.url === page.url;
            break;
          case 'contains':
          default:
            matches = tab.url.includes(page.url);
        }
        return matches;
      } catch {
        return tab.url.includes(page.url);
      }
    });
  });
  
  if (matchedSite) {
    matchedSiteId = matchedSite.id;
    siteInfo.innerHTML = `<strong>✓ Matched:</strong> ${matchedSite.name}`;
    siteInfo.classList.add('matched');
    siteInfo.classList.remove('not-matched');
    runFillBtn.disabled = !toggle.checked;
  } else {
    siteInfo.innerHTML = `<strong>⚠ Not Configured:</strong> No matching site found`;
    siteInfo.classList.add('not-matched');
    siteInfo.classList.remove('matched');
    runFillBtn.disabled = true;
  }
  
  // Toggle handler
  toggle.addEventListener('change', async () => {
    const enabled = toggle.checked;
    await chrome.storage.local.set({ extensionEnabled: enabled });
    updateStatus(enabled);
    runFillBtn.disabled = !enabled || !matchedSite;
    
    // Notify content script
    try {
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'toggleExtension', 
        enabled: enabled 
      });
    } catch (e) {
      // Content script not loaded - that's OK
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
  
  // Open app button - Navigate to site config if matched, otherwise to sites list
  openAppBtn.addEventListener('click', () => {
    if (matchedSiteId) {
      chrome.tabs.create({ url: `${APP_URL}/sites/${matchedSiteId}` });
    } else {
      chrome.tabs.create({ url: `${APP_URL}/sites` });
    }
  });
  
  // Run fill button
  runFillBtn.addEventListener('click', async () => {
    if (!toggle.checked) {
      siteInfo.innerHTML = '<strong>⚠ Error:</strong> Enable extension first';
      return;
    }
    
    runFillBtn.disabled = true;
    runFillBtn.textContent = '⏳ Running...';
    
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'runFill' });
      if (response.success) {
        siteInfo.innerHTML = `<strong>✓ Success:</strong> ${response.message}`;
        siteInfo.classList.add('matched');
      } else {
        siteInfo.innerHTML = `<strong>⚠ Warning:</strong> ${response.message}`;
        siteInfo.classList.add('not-matched');
      }
    } catch (e) {
      siteInfo.innerHTML = '<strong>✗ Error:</strong> Content script not loaded. Refresh the page.';
      siteInfo.classList.remove('matched');
      siteInfo.classList.add('not-matched');
    }
    
    runFillBtn.disabled = false;
    runFillBtn.textContent = '▶ Run Auto-Fill';
  });
});
