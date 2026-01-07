import JSZip from 'jszip';

const manifestJson = `{
  "manifest_version": 3,
  "name": "QAFormFiller",
  "version": "2.0.0",
  "description": "EDF-style browser automation - Form filling with Excel data",
  "permissions": [
    "activeTab",
    "storage",
    "scripting",
    "tabs",
    "webNavigation",
    "downloads",
    "contextMenus"
  ],
  "host_permissions": ["<all_urls>"],
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    },
    "default_title": "QAFormFiller - Click to open dashboard"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
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

const backgroundJs = `/**
 * QAFormFiller - Background Service Worker (ORCHESTRATOR)
 * EDF v4 Style Architecture
 */

// IMPORTANT: Navigate to /app page, not root
const APP_URL = 'http://localhost:3000/app';

let extensionState = {
  configured: false,
  enabled: false, // EDF v4 default: OFF until user enables
  errors: []
};

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[EDF] QAFormFiller v2.0 installed');
  const result = await chrome.storage.local.get(['configured', 'extensionEnabled', 'siteConfigs']);
  extensionState.configured = result.configured || false;
  extensionState.enabled = result.extensionEnabled ?? false;
  await chrome.storage.local.set({
    configured: extensionState.configured,
    extensionEnabled: extensionState.enabled,
    siteConfigs: result.siteConfigs || [],
    errors: []
  });

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'qaff_toggle_enabled',
      title: 'Enable QAFormFiller',
      type: 'checkbox',
      checked: extensionState.enabled,
      contexts: ['action']
    });
  });

  updateBadge();
});

// Icon click opens full tab at /app (EDF style - no popup)
chrome.action.onClicked.addListener(async () => {
  const existingTabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
  if (existingTabs.length > 0) {
    await chrome.tabs.update(existingTabs[0].id, { active: true, url: APP_URL });
    await chrome.windows.update(existingTabs[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: APP_URL });
  }
});

function updateBadge() {
  chrome.action.setBadgeText({ text: extensionState.enabled ? 'ON' : 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: extensionState.enabled ? '#22c55e' : '#dc2626' });
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.extensionEnabled) {
    extensionState.enabled = changes.extensionEnabled.newValue;
    updateBadge();
    try { chrome.contextMenus.update('qaff_toggle_enabled', { checked: extensionState.enabled }); } catch (e) {}
  }
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'qaff_toggle_enabled') return;
  await handleMessage({ action: 'setEnabled', enabled: !!info.checked });
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendToContent(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (e) {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    await delay(500);
    return await chrome.tabs.sendMessage(tabId, message);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(err => {
    sendResponse({ success: false, error: err.message });
  });
  return true;
});

async function handleMessage(message) {
  switch (message.action) {
    case 'getConfig':
      const config = await chrome.storage.local.get(['siteConfigs', 'extensionEnabled', 'configured']);
      return { configs: config.siteConfigs || [], enabled: config.extensionEnabled || false, configured: config.configured || false };
    
    case 'saveConfig':
      await chrome.storage.local.set({ siteConfigs: message.configs, configured: true });
      return { success: true };
    
    case 'setEnabled':
      await chrome.storage.local.set({ extensionEnabled: message.enabled });
      extensionState.enabled = message.enabled;
      updateBadge();
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try { await chrome.tabs.sendMessage(tab.id, { action: 'toggleExtension', enabled: message.enabled }); } catch (e) {}
      }
      return { success: true };
    
    case 'getExcelData':
      const excelResult = await chrome.storage.local.get(['excelData', 'currentRowIndex']);
      return { data: excelResult.excelData || null, currentRow: excelResult.currentRowIndex || 0 };
    
    case 'setExcelData':
      await chrome.storage.local.set({ excelData: message.data, currentRowIndex: 0 });
      return { success: true };
    
    case 'highlightField':
      return await highlightFieldInTab(message);
    
    case 'getErrors':
      const errorResult = await chrome.storage.local.get(['errors']);
      return { errors: errorResult.errors || [] };
    
    default:
      return { success: false, error: 'Unknown action' };
  }
}

async function highlightFieldInTab(message) {
  const { url, field, matchType = 'contains' } = message;
  const enabled = (await chrome.storage.local.get(['extensionEnabled'])).extensionEnabled ?? false;
  if (!enabled) return { success: false, error: 'Extension is disabled. Enable it first, then try highlight.' };

  const allTabs = await chrome.tabs.query({});
  let targetTab = null;

  for (const tab of allTabs) {
    if (!tab.url) continue;
    let matches = false;
    try {
      if (matchType === 'regex') matches = new RegExp(url).test(tab.url);
      else if (matchType === 'exact') matches = tab.url === url;
      else matches = tab.url.includes(url);
    } catch {
      matches = tab.url.includes(url);
    }

    if (matches) {
      targetTab = tab;
      break;
    }
  }

  if (!targetTab) {
    return { success: false, error: 'Please open the URL first and then try to highlight: ' + url };
  }

  await chrome.tabs.update(targetTab.id, { active: true });
  await chrome.windows.update(targetTab.windowId, { focused: true });

  try {
    return await sendToContent(targetTab.id, {
      action: 'highlightElement',
      selector: field.selectorQuery,
      selectorType: field.selectorType,
      fieldName: field.name
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

console.log('[EDF] Background service worker initialized');
`;

const contentJs = `/**
 * QAFormFiller - Content Script (DOM EXECUTOR)
 * EDF v4 Style Architecture
 */

let isEnabled = false;
let currentConfig = null;

const Logger = {
  styles: {
    header: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 14px;',
    success: 'background: #10b981; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    error: 'background: #ef4444; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    info: 'background: #3b82f6; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    field: 'background: #8b5cf6; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    divider: 'color: #6366f1; font-weight: bold;'
  },
  header(msg) { if (!isEnabled) return; console.log('%c🚀 ' + msg, this.styles.header); },
  divider() { if (!isEnabled) return; console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', this.styles.divider); },
  success(msg) { if (!isEnabled) return; console.log('%c✓ SUCCESS', this.styles.success, msg); },
  error(msg) { if (!isEnabled) return; console.log('%c✗ ERROR', this.styles.error, msg); },
  info(msg) { if (!isEnabled) return; console.log('%c● INFO', this.styles.info, msg); },
  field(name, idx, total) { if (!isEnabled) return; console.log('%c▶ FIELD [' + idx + '/' + total + ']', this.styles.field, name); },
  state(enabled) { console.log('%c' + (enabled ? '✓ QAFormFiller ENABLED' : '⏸ QAFormFiller DISABLED'), enabled ? 'background: #10b981; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold;' : 'background: #6b7280; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold;'); }
};

function findElement(selector, selectorType) {
  try {
    switch (selectorType) {
      case 'xpath': return document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      case 'id': return document.getElementById(selector);
      case 'name': return document.querySelector('[name="' + selector + '"]');
      default: return document.querySelector(selector);
    }
  } catch (e) { return null; }
}

async function waitForElement(selector, selectorType, timeout) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = findElement(selector, selectorType);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return el;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return null;
}

async function fillField(element, value, fieldType) {
  element.focus();
  await new Promise(r => setTimeout(r, 50));
  
  if (fieldType === 'checkbox') {
    const shouldCheck = value === 'true' || value === '1' || value === 'yes';
    if (element.checked !== shouldCheck) element.click();
  } else if (fieldType === 'radio' || fieldType === 'button') {
    element.click();
  } else if (fieldType === 'select') {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (setter) setter.call(element, value); else element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  element.blur();
}

function highlightElement(selector, selectorType, fieldName) {
  document.querySelectorAll('.qaff-highlight, .qaff-label').forEach(el => {
    if (el.classList.contains('qaff-label')) el.remove();
    else { el.style.outline = ''; el.classList.remove('qaff-highlight'); }
  });
  
  const element = findElement(selector, selectorType);
  if (element) {
    element.style.outline = '3px solid #22c55e';
    element.style.outlineOffset = '3px';
    element.classList.add('qaff-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    const label = document.createElement('div');
    label.className = 'qaff-label';
    label.style.cssText = 'position:fixed;top:10px;right:10px;background:#22c55e;color:white;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:bold;z-index:999999;font-family:system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
    label.textContent = '✓ Found: ' + (fieldName || 'Field');
    document.body.appendChild(label);
    
    setTimeout(() => {
      element.style.outline = '';
      element.classList.remove('qaff-highlight');
      label.remove();
    }, 5000);
    
    Logger.success('Field highlighted: ' + fieldName);
    return { success: true, message: 'Element found and highlighted' };
  } else {
    Logger.error('Field not found: ' + fieldName);
    return { success: false, message: 'Element not found on this page' };
  }
}

async function runFormFill() {
  if (!isEnabled) return { success: false, message: 'Extension is disabled' };
  if (!currentConfig) return { success: false, message: 'No matching site configuration' };
  
  const fields = currentConfig.page?.fields || [];
  Logger.header('STARTING FORM FILL');
  Logger.divider();
  
  let filled = 0, errors = 0;
  let rowData = {};
  try {
    const r = await chrome.runtime.sendMessage({ action: 'getExcelData' });
    if (r?.data?.rows?.[r.currentRow || 0]) {
      const row = r.data.rows[r.currentRow || 0];
      (r.data.headers || []).forEach((h, i) => { rowData[h] = row[i] || ''; });
    }
  } catch (e) {}
  
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (!field.enabled) continue;
    Logger.field(field.name, i + 1, fields.length);
    
    let element = field.waitForElement ? await waitForElement(field.selectorQuery, field.selectorType, field.waitTimeout || 5000) : findElement(field.selectorQuery, field.selectorType);
    
    if (!element) { Logger.error('Not found'); errors++; continue; }
    Logger.success('Found');
    
    try {
      let value = (field.value || '').replace(/\\{\\$([^}]+)\\$\\}/g, (_, k) => rowData[k] || '');
      if (!value && field.defaultValue) value = field.defaultValue;
      
      if (field.fieldType === 'button') {
        element.click();
      } else if (field.runJs && field.jsCode) {
        new Function('element', 'value', 'rowData', field.jsCode)(element, value, rowData);
      } else {
        await fillField(element, value, field.fieldType);
      }
      Logger.success('Filled');
      filled++;
      if (field.delayAfter) await new Promise(r => setTimeout(r, field.delayAfter));
    } catch (e) { Logger.error(e.message); errors++; }
  }
  
  Logger.divider();
  return { success: errors === 0, filledCount: filled, errorCount: errors, message: 'Filled ' + filled + ' fields' + (errors > 0 ? ', ' + errors + ' errors' : '') };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg.action) {
      case 'toggleExtension':
        isEnabled = msg.enabled;
        Logger.state(isEnabled);
        if (!isEnabled) { document.querySelectorAll('.qaff-highlight, .qaff-label').forEach(el => el.remove?.() || (el.style.outline = '')); currentConfig = null; }
        else await init();
        sendResponse({ success: true });
        break;
      case 'highlightElement':
        sendResponse(highlightElement(msg.selector, msg.selectorType, msg.fieldName));
        break;
      case 'runFill':
        sendResponse(await runFormFill());
        break;
      case 'getStatus':
        sendResponse({ enabled: isEnabled, hasConfig: !!currentConfig, siteName: currentConfig?.site?.name });
        break;
      default:
        sendResponse({ success: false });
    }
  })();
  return true;
});

async function init() {
  try {
    const result = await chrome.runtime.sendMessage({ action: 'getConfig' });
    isEnabled = result.enabled;
    if (isEnabled) {
      Logger.state(true);
      checkForMatchingSite(result.configs);
    }
  } catch (e) {}
}

function checkForMatchingSite(configs) {
  if (!isEnabled || !configs) return;
  const url = window.location.href;
  for (const site of configs) {
    if (!site.pages || site.status !== 'active') continue;
    for (const page of site.pages) {
      if (!page.active) continue;
      let matches = false;
      try {
        switch (page.matchType) {
          case 'regex': matches = new RegExp(page.url).test(url); break;
          case 'exact': matches = url === page.url; break;
          default: matches = url.includes(page.url);
        }
      } catch { matches = url.includes(page.url); }
      if (matches) {
        currentConfig = { site, page };
        Logger.header('Site Matched: ' + site.name);
        Logger.info('URL: ' + url);
        return;
      }
    }
  }
}

init();
`;

const readmeContent = `# QAFormFiller - Chrome Extension v2.0

## EDF v4 Style Architecture

This extension uses a professional 3-layer architecture:
- **Background Script (Orchestrator)**: Controls tabs, manages state
- **Content Script (DOM Executor)**: Only handles DOM operations
- **Web Dashboard**: Full page configuration (no popups)

## Installation

1. Open Chrome and go to \`chrome://extensions/\`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder

## Usage

1. Click the extension icon to open the Dashboard
2. Configure your sites and fields
3. Navigate to a configured website
4. The extension will auto-detect and highlight configured fields
5. Use "Run Auto-Fill" from the dashboard

## Key Features

- **No Popup Mode**: Click icon opens full dashboard tab
- **JSON Workflow Engine**: Supports complex automation
- **React/Angular/Vue Compatible**: Proper input event handling
- **Visual Field Highlighting**: Verify selectors work
- **Error Dashboard**: Track all automation errors

## Files

- \`manifest.json\` - Extension configuration (no popup)
- \`background.js\` - Service worker (orchestrator)
- \`content.js\` - Content script (DOM executor)
`;

export async function generateExtensionZip(): Promise<Blob> {
  const zip = new JSZip();
  
  zip.file('manifest.json', manifestJson);
  zip.file('background.js', backgroundJs);
  zip.file('content.js', contentJs);
  zip.file('README.md', readmeContent);
  
  const iconsFolder = zip.folder('icons');
  const icon16 = generateIconSvg(16);
  const icon48 = generateIconSvg(48);
  const icon128 = generateIconSvg(128);
  
  iconsFolder?.file('icon16.png', icon16, { base64: true });
  iconsFolder?.file('icon48.png', icon48, { base64: true });
  iconsFolder?.file('icon128.png', icon128, { base64: true });
  
  return await zip.generateAsync({ type: 'blob' });
}

function generateIconSvg(size: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea"/>
        <stop offset="100%" style="stop-color:#764ba2"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.35}">Qa</text>
  </svg>`;
  return btoa(svg);
}

export function downloadExtension() {
  generateExtensionZip().then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qaformfiller-extension-v2.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
