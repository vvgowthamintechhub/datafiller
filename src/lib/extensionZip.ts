import JSZip from 'jszip';

const manifestJson = `{
  "manifest_version": 3,
  "name": "Excellent Data Filler",
  "version": "4.0.0",
  "description": "Automate form filling with Excel data",
  "permissions": ["activeTab", "storage", "scripting"],
  "host_permissions": ["<all_urls>"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`;

const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { width: 320px; padding: 16px; font-family: system-ui, sans-serif; background: #1a1a2e; color: #eee; margin: 0; }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #00d4ff, #0066ff); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; color: #fff; }
    h1 { margin: 0; font-size: 16px; }
    .subtitle { color: #888; font-size: 12px; }
    .toggle-container { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #2a2a4a; border-radius: 8px; margin-bottom: 12px; }
    .toggle-label { font-size: 14px; font-weight: 500; }
    .toggle { position: relative; width: 50px; height: 26px; cursor: pointer; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #dc3545; border-radius: 26px; transition: 0.3s; }
    .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.3s; }
    input:checked + .slider { background-color: #0066ff; }
    input:checked + .slider:before { transform: translateX(24px); }
    .status { padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 12px; display: flex; align-items: center; gap: 8px; }
    .status.on { background: rgba(0, 102, 255, 0.2); color: #00d4ff; }
    .status.off { background: rgba(220, 53, 69, 0.2); color: #dc3545; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status.on .status-dot { background: #00d4ff; }
    .status.off .status-dot { background: #dc3545; }
    .btn { width: 100%; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-top: 8px; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    .btn-primary { background: linear-gradient(135deg, #00d4ff, #0066ff); color: #fff; }
    .btn-secondary { background: #2a2a4a; color: #fff; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .site-info { padding: 8px 12px; background: #2a2a4a; border-radius: 6px; margin-bottom: 12px; font-size: 11px; color: #888; }
    .site-info.matched { background: rgba(40, 167, 69, 0.2); color: #28a745; }
  </style>
</head>
<body>
  <div class="logo">
    <div class="logo-icon">Ex</div>
    <div>
      <h1>Excellent Data Filler</h1>
      <div class="subtitle">v4.0</div>
    </div>
  </div>
  
  <div class="toggle-container">
    <span class="toggle-label">Extension</span>
    <label class="toggle">
      <input type="checkbox" id="extensionToggle">
      <span class="slider"></span>
    </label>
  </div>
  
  <div class="status off" id="statusBar">
    <span class="status-dot"></span>
    <span id="statusText">Extension is OFF</span>
  </div>
  
  <div class="site-info" id="siteInfo">Current site: Not configured</div>
  
  <button class="btn btn-primary" id="openApp">Open Configuration</button>
  <button class="btn btn-secondary" id="runFill" disabled>Run Auto-Fill</button>
  
  <script src="popup.js"></script>
</body>
</html>`;

const popupJs = `// Configuration URL - change this to your app URL
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
      const regex = new RegExp(page.url);
      return regex.test(tab.url);
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
    chrome.tabs.sendMessage(tab.id, { 
      action: 'toggleExtension', 
      enabled: enabled 
    });
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
    chrome.tabs.sendMessage(tab.id, { action: 'runFill' });
    window.close();
  });
});`;

const backgroundJs = `// Excellent Data Filler - Background Service Worker
console.log('Excellent Data Filler extension installed');

chrome.runtime.onInstalled.addListener(() => {
  // Initialize extension state
  chrome.storage.local.set({ 
    extensionEnabled: false,
    siteConfigs: []
  });
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
});`;

const contentJs = `// Excellent Data Filler - Content Script
console.log('Excellent Data Filler content script loaded');

let isEnabled = false;
let currentConfig = null;
let excelData = null;
let currentRowIndex = 0;

// Initialize
async function init() {
  const result = await chrome.runtime.sendMessage({ action: 'getConfig' });
  isEnabled = result.enabled;
  
  if (isEnabled) {
    checkForMatchingSite(result.configs);
  }
}

// Check if current URL matches any configured site
function checkForMatchingSite(configs) {
  const currentUrl = window.location.href;
  
  for (const site of configs) {
    if (!site.pages || !site.status === 'active') continue;
    
    for (const page of site.pages) {
      if (!page.active) continue;
      
      let matches = false;
      switch (page.matchType) {
        case 'regex':
          matches = new RegExp(page.url).test(currentUrl);
          break;
        case 'exact':
          matches = currentUrl === page.url;
          break;
        case 'contains':
          matches = currentUrl.includes(page.url);
          break;
      }
      
      if (matches) {
        currentConfig = { site, page };
        console.log('Matched site:', site.name, 'Page:', page.url);
        highlightConfiguredFields();
        return;
      }
    }
  }
}

// Highlight fields that are configured for auto-fill
function highlightConfiguredFields() {
  if (!currentConfig || !currentConfig.page.fields) return;
  
  currentConfig.page.fields.forEach(field => {
    if (!field.enabled) return;
    
    const element = findElement(field);
    if (element) {
      element.style.outline = '2px dashed #0066ff';
      element.title = 'Auto-fill: ' + field.name;
    }
  });
}

// Find element using selector
function findElement(field) {
  try {
    switch (field.selectorType) {
      case 'xpath':
        const result = document.evaluate(
          field.selectorQuery, 
          document, 
          null, 
          XPathResult.FIRST_ORDERED_NODE_TYPE, 
          null
        );
        return result.singleNodeValue;
      case 'selector':
        return document.querySelector(field.selectorQuery);
      case 'name':
        return document.querySelector('[name="' + field.selectorQuery + '"]');
      case 'id':
        return document.getElementById(field.selectorQuery);
      default:
        return document.querySelector(field.selectorQuery);
    }
  } catch (e) {
    console.error('Error finding element:', e);
    return null;
  }
}

// Fill form with data
async function fillForm() {
  if (!currentConfig || !isEnabled) {
    console.log('Cannot fill: extension disabled or no config');
    return { success: false, message: 'Extension disabled or no matching config' };
  }
  
  const fields = currentConfig.page.fields || [];
  let filledCount = 0;
  let errors = [];
  
  // Get Excel data for current row
  const excelResult = await chrome.runtime.sendMessage({ action: 'getExcelData' });
  const rowData = excelResult?.rows?.[currentRowIndex] || {};
  
  for (const field of fields) {
    if (!field.enabled) continue;
    
    const element = findElement(field);
    if (!element) {
      errors.push('Element not found: ' + field.name);
      continue;
    }
    
    try {
      let value = field.value;
      
      // Replace Excel column placeholders
      value = value.replace(/\\{\\$([^}]+)\\$\\}/g, (match, columnName) => {
        return rowData[columnName] || '';
      });
      
      // Execute JavaScript if enabled
      if (field.runJs && field.jsCode) {
        try {
          const fn = new Function('element', 'value', 'rowData', field.jsCode);
          fn(element, value, rowData);
          filledCount++;
          continue;
        } catch (jsError) {
          errors.push('JS Error in ' + field.name + ': ' + jsError.message);
          continue;
        }
      }
      
      // Fill based on field type
      await fillField(element, field, value);
      filledCount++;
      
    } catch (e) {
      errors.push('Error filling ' + field.name + ': ' + e.message);
    }
  }
  
  return { 
    success: errors.length === 0, 
    filledCount, 
    errors,
    message: 'Filled ' + filledCount + ' fields' + (errors.length > 0 ? ' with ' + errors.length + ' errors' : '')
  };
}

// Fill individual field based on type
async function fillField(element, field, value) {
  const tagName = element.tagName.toLowerCase();
  const inputType = element.type?.toLowerCase();
  
  // Add small delay between actions for stability
  await delay(50);
  
  switch (field.fieldType) {
    case 'text':
    case 'textarea':
      element.focus();
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      break;
      
    case 'select':
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      break;
      
    case 'checkbox':
      const shouldCheck = value === 'true' || value === '1' || value === 'yes';
      if (element.checked !== shouldCheck) {
        element.click();
      }
      break;
      
    case 'radio':
      const radio = document.querySelector('input[type="radio"][name="' + element.name + '"][value="' + value + '"]');
      if (radio) radio.click();
      break;
      
    case 'button':
      element.click();
      break;
      
    case 'date':
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      break;
      
    default:
      // Default text input behavior
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleExtension') {
    isEnabled = message.enabled;
    if (isEnabled) {
      chrome.runtime.sendMessage({ action: 'getConfig' }).then(result => {
        checkForMatchingSite(result.configs);
      });
    } else {
      // Remove highlights
      document.querySelectorAll('[style*="outline: 2px dashed"]').forEach(el => {
        el.style.outline = '';
      });
    }
    sendResponse({ success: true });
  }
  
  if (message.action === 'runFill') {
    fillForm().then(result => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  }
  
  if (message.action === 'setRowIndex') {
    currentRowIndex = message.index;
    sendResponse({ success: true });
  }
});

// Initialize on load
init();`;

const readmeContent = `# Excellent Data Filler - Chrome Extension

## Installation

1. Open Chrome and go to \`chrome://extensions/\`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select this extracted folder
5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon to open the popup
2. Toggle the extension ON (blue) or OFF (red)
3. Click "Open Configuration" to open the web app and configure your sites
4. Navigate to a configured website
5. Click "Run Auto-Fill" to fill the form

## Configuration

The web app (running at http://localhost:3000) allows you to:
- Add and configure sites with URL patterns
- Set up form fields with selectors
- Upload Excel data for form filling
- Map Excel columns to form fields

## Files

- \`manifest.json\` - Extension configuration
- \`popup.html/js\` - Extension popup UI
- \`background.js\` - Background service worker
- \`content.js\` - Content script for form interaction

## Icons

Create icon files (icon16.png, icon48.png, icon128.png) in the icons/ folder.
You can use any icon or create one with "Ex" text.
`;

export async function generateExtensionZip(): Promise<Blob> {
  const zip = new JSZip();
  
  // Add main files
  zip.file('manifest.json', manifestJson);
  zip.file('popup.html', popupHtml);
  zip.file('popup.js', popupJs);
  zip.file('background.js', backgroundJs);
  zip.file('content.js', contentJs);
  zip.file('README.md', readmeContent);
  
  // Create icons folder with placeholder SVG icons
  const iconsFolder = zip.folder('icons');
  
  // Generate simple placeholder icons as data URLs
  const icon16 = generateIconSvg(16);
  const icon48 = generateIconSvg(48);
  const icon128 = generateIconSvg(128);
  
  iconsFolder?.file('icon16.png', icon16, { base64: true });
  iconsFolder?.file('icon48.png', icon48, { base64: true });
  iconsFolder?.file('icon128.png', icon128, { base64: true });
  
  // Generate the zip file
  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

// Generate a simple icon as base64 PNG (using SVG converted to base64)
function generateIconSvg(size: number): string {
  // This creates a simple gradient icon with "Ex" text
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#00d4ff"/>
        <stop offset="100%" style="stop-color:#0066ff"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.4}">Ex</text>
  </svg>`;
  
  // Return as base64 (browsers can use SVG as icon, but we'll keep PNG extension for compatibility)
  return btoa(svg);
}

export function downloadExtension() {
  generateExtensionZip().then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'excellent-data-filler-extension.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
