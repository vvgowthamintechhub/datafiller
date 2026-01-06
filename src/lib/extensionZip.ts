import JSZip from 'jszip';

const manifestJson = `{
  "manifest_version": 3,
  "name": "QAFormFiller",
  "version": "1.0.0",
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
    body { width: 320px; padding: 16px; font-family: system-ui, sans-serif; background: #ffffff; color: #1a1a2e; margin: 0; }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; color: #fff; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3); }
    h1 { margin: 0; font-size: 16px; color: #1f2937; }
    .subtitle { color: #6b7280; font-size: 12px; }
    .toggle-container { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f3f4f6; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e5e7eb; }
    .toggle-label { font-size: 14px; font-weight: 500; color: #374151; }
    .toggle { position: relative; width: 50px; height: 26px; cursor: pointer; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #dc3545; border-radius: 26px; transition: 0.3s; }
    .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.3s; }
    input:checked + .slider { background-color: #2563eb; }
    input:checked + .slider:before { transform: translateX(24px); }
    .status { padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 12px; display: flex; align-items: center; gap: 8px; }
    .status.on { background: rgba(37, 99, 235, 0.1); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.2); }
    .status.off { background: rgba(220, 53, 69, 0.1); color: #dc3545; border: 1px solid rgba(220, 53, 69, 0.2); }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status.on .status-dot { background: #2563eb; }
    .status.off .status-dot { background: #dc3545; }
    .btn { width: 100%; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-top: 8px; transition: all 0.2s; }
    .btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3); }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .site-info { padding: 8px 12px; background: #f9fafb; border-radius: 6px; margin-bottom: 12px; font-size: 11px; color: #6b7280; border: 1px solid #e5e7eb; }
    .site-info.matched { background: rgba(34, 197, 94, 0.1); color: #16a34a; border: 1px solid rgba(34, 197, 94, 0.2); }
  </style>
</head>
<body>
  <div class="logo">
    <div class="logo-icon">Qa</div>
    <div>
      <h1>QAFormFiller</h1>
      <div class="subtitle">v1.0</div>
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
    
    // Notify content script (may not exist on all pages)
    chrome.tabs.sendMessage(tab.id, { 
      action: 'toggleExtension', 
      enabled: enabled 
    }).catch(() => {
      // Content script not loaded on this page - that's OK
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
    chrome.tabs.sendMessage(tab.id, { action: 'runFill' })
      .then(() => window.close())
      .catch(() => {
        siteInfo.textContent = 'Content script not loaded. Refresh the page.';
        siteInfo.classList.remove('matched');
      });
  });
});`;

const backgroundJs = `// QAFormFiller - Background Service Worker
console.log('QAFormFiller extension installed');

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
      color: enabled ? '#2563eb' : '#dc3545' 
    });
  }
});`;

const contentJs = `// QAFormFiller - Content Script with Enhanced Console Logging
console.log('%c🚀 QAFormFiller Extension Loaded', 'background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');

let isEnabled = false;
let currentConfig = null;
let currentRowIndex = 0;

const Logger = {
  styles: {
    success: 'background: #16a34a; color: white; padding: 2px 6px; border-radius: 3px;',
    error: 'background: #dc2626; color: white; padding: 2px 6px; border-radius: 3px;',
    info: 'background: #0891b2; color: white; padding: 2px 6px; border-radius: 3px;',
    field: 'background: #7c3aed; color: white; padding: 2px 6px; border-radius: 3px;',
    wait: 'background: #6366f1; color: white; padding: 2px 6px; border-radius: 3px;',
  },
  group(title) { if (!isEnabled) return { end: () => {} }; console.groupCollapsed('%c' + title, this.styles.field); return { end: () => console.groupEnd() }; },
  success(msg, d='') { if (isEnabled) console.log('%c✓ SUCCESS', this.styles.success, msg, d); },
  error(msg, d='') { if (isEnabled) console.log('%c✗ ERROR', this.styles.error, msg, d); },
  info(msg, d='') { if (isEnabled) console.log('%c● INFO', this.styles.info, msg, d); },
};

async function init() {
  try {
    const result = await chrome.runtime.sendMessage({ action: 'getConfig' });
    isEnabled = result.enabled;
    if (isEnabled) checkForMatchingSite(result.configs);
  } catch (e) {}
}

function checkForMatchingSite(configs) {
  if (!isEnabled || !configs) return;
  const currentUrl = window.location.href;
  for (const site of configs) {
    if (!site.pages || site.status !== 'active') continue;
    for (const page of site.pages) {
      if (!page.active) continue;
      let matches = false;
      try {
        switch (page.matchType) {
          case 'regex': matches = new RegExp(page.url).test(currentUrl); break;
          case 'exact': matches = currentUrl === page.url; break;
          default: matches = currentUrl.includes(page.url);
        }
      } catch { matches = currentUrl.includes(page.url); }
      if (matches) {
        currentConfig = { site, page };
        Logger.success('Site Matched: ' + site.name);
        highlightConfiguredFields();
        return;
      }
    }
  }
}

function highlightConfiguredFields() {
  if (!isEnabled || !currentConfig?.page?.fields) return;
  currentConfig.page.fields.forEach(field => {
    if (!field.enabled) return;
    const el = findElement(field);
    if (el) { el.style.outline = '2px dashed #2563eb'; el.title = 'QAFormFiller: ' + field.name; }
  });
}

function findElement(field) {
  try {
    switch (field.selectorType) {
      case 'xpath': return document.evaluate(field.selectorQuery, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      case 'name': return document.querySelector('[name="' + field.selectorQuery + '"]');
      case 'id': return document.getElementById(field.selectorQuery);
      default: return document.querySelector(field.selectorQuery);
    }
  } catch { return null; }
}

async function fillForm() {
  if (!isEnabled) return { success: false, message: 'Extension disabled' };
  if (!currentConfig) return { success: false, message: 'No config' };
  const fields = currentConfig.page.fields || [];
  let filled = 0, errors = [];
  let rowData = {};
  try { const r = await chrome.runtime.sendMessage({ action: 'getExcelData' }); rowData = r?.rows?.[currentRowIndex] || {}; } catch {}
  
  for (const field of fields) {
    if (!field.enabled) continue;
    const group = Logger.group(field.name);
    const el = findElement(field);
    if (!el) { Logger.error('Not found'); errors.push(field.name); group.end(); continue; }
    Logger.success('Found');
    try {
      let value = (field.value || '').replace(/\\{\\$([^}]+)\\$\\}/g, (_, c) => rowData[c] || '');
      if (field.runJs && field.jsCode) { new Function('element','value','rowData',field.jsCode)(el,value,rowData); }
      else { el.value = value; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
      Logger.success('Filled');
      filled++;
    } catch (e) { Logger.error(e.message); errors.push(field.name); }
    group.end();
  }
  return { success: errors.length === 0, filledCount: filled, errors, message: 'Filled ' + filled + ' fields' };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'toggleExtension') {
    isEnabled = msg.enabled;
    if (isEnabled) chrome.runtime.sendMessage({ action: 'getConfig' }).then(r => checkForMatchingSite(r.configs));
    else { document.querySelectorAll('[style*="outline"]').forEach(e => e.style.outline = ''); currentConfig = null; }
    sendResponse({ success: true });
  }
  if (msg.action === 'runFill') { fillForm().then(r => sendResponse(r)); return true; }
  if (msg.action === 'setRowIndex') { currentRowIndex = msg.index; sendResponse({ success: true }); }
  return true;
});

init();`;

const readmeContent = `# QAFormFiller - Chrome Extension

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

## Extension States

- **ON (Blue toggle)**: Extension is active and will auto-detect configured sites
- **OFF (Red toggle)**: Extension is disabled and won't interact with any site

## Files

- \`manifest.json\` - Extension configuration
- \`popup.html/js\` - Extension popup UI with ON/OFF toggle
- \`background.js\` - Background service worker
- \`content.js\` - Content script for form interaction

## Icons

The icons/ folder contains the extension icons (icon16.png, icon48.png, icon128.png).

## Changing the App URL

By default, the extension opens \`http://localhost:3000\`. To change this:
1. Edit \`popup.js\`
2. Change the \`APP_URL\` constant at the top of the file
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
  // This creates a simple gradient icon with "Qa" text
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2563eb"/>
        <stop offset="100%" style="stop-color:#1d4ed8"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.35}">Qa</text>
  </svg>`;
  
  // Return as base64 (browsers can use SVG as icon, but we'll keep PNG extension for compatibility)
  return btoa(svg);
}

export function downloadExtension() {
  generateExtensionZip().then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qaformfiller-extension.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
