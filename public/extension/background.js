/**
 * QAFormFiller - Background Service Worker (ORCHESTRATOR)
 * EDF v4 Style Architecture
 * 
 * This is the BRAIN of the extension:
 * - Controls tab navigation
 * - Orchestrates workflows
 * - Manages state and storage
 * - Handles retries and errors
 * 
 * UI and Content Scripts NEVER control tabs directly.
 */

// IMPORTANT: Navigate to /app page, not root
const APP_URL = 'http://localhost:3000/app';

// ============= STATE MANAGEMENT =============
let extensionState = {
  configured: false,
  enabled: false,
  currentWorkflow: null,
  workflowStep: 0,
  errors: [],
  lastError: null
};

// ============= CONTEXT MENU SETUP =============
async function setupContextMenu() {
  try {
    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
      id: 'qaff_toggle_enabled',
      title: 'Enable QAFormFiller',
      type: 'checkbox',
      checked: extensionState.enabled,
      contexts: ['action']
    });
  } catch (e) {
    console.log('[EDF] Context menu setup error (expected on reload):', e.message);
  }
}

// ============= INITIALIZATION =============
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[EDF] QAFormFiller v2.0 installed');
  await initializeExtension();
});

// Also run on startup (for when browser restarts)
chrome.runtime.onStartup.addListener(async () => {
  console.log('[EDF] QAFormFiller starting up');
  await initializeExtension();
});

async function initializeExtension() {
  // Check if already configured
  const result = await chrome.storage.local.get(['configured', 'extensionEnabled', 'siteConfigs']);

  extensionState.configured = result.configured || false;
  // EDF v4 default: OFF until user enables via right-click menu
  extensionState.enabled = result.extensionEnabled ?? false;

  // Initialize storage
  await chrome.storage.local.set({
    configured: extensionState.configured,
    extensionEnabled: extensionState.enabled,
    siteConfigs: result.siteConfigs || [],
    errors: [],
    workflows: []
  });

  // Setup right-click context menu
  await setupContextMenu();
  updateBadge();
}

// Ensure context menu exists when service worker wakes up
(async () => {
  const result = await chrome.storage.local.get(['extensionEnabled']);
  extensionState.enabled = result.extensionEnabled ?? false;
  await setupContextMenu();
  updateBadge();
})();

// ============= ICON CLICK HANDLER =============
// EDF v4 Style: Click opens full tab, NOT popup
chrome.action.onClicked.addListener(async (tab) => {
  // Always open the /app dashboard in a new tab
  const existingTabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
  
  if (existingTabs.length > 0) {
    // Focus existing tab and navigate to /app
    await chrome.tabs.update(existingTabs[0].id, { active: true, url: APP_URL });
    await chrome.windows.update(existingTabs[0].windowId, { focused: true });
  } else {
    // Open new tab with /app
    await chrome.tabs.create({ url: APP_URL });
  }
});

// ============= BADGE MANAGEMENT =============
function updateBadge() {
  if (extensionState.enabled) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
  }
}

// Storage change listener for badge + context menu
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.extensionEnabled) {
    extensionState.enabled = changes.extensionEnabled.newValue;
    updateBadge();
    try {
      await chrome.contextMenus.update('qaff_toggle_enabled', { checked: extensionState.enabled });
    } catch (e) {
      // Menu might not exist yet, recreate it
      await setupContextMenu();
    }
  }
  if (changes.configured) {
    extensionState.configured = changes.configured.newValue;
  }
});

// Right-click menu click handler (checkbox)
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'qaff_toggle_enabled') return;
  const enabled = !!info.checked;
  await handleMessage({ action: 'setEnabled', enabled }, null);
});

// ============= WORKFLOW ENGINE =============
/**
 * Execute a JSON-driven workflow
 * Supports: openTab, fill, click, wait, navigate, download
 */
async function executeWorkflow(workflow, data = {}) {
  extensionState.currentWorkflow = workflow;
  extensionState.workflowStep = 0;
  
  console.log('[EDF] Starting workflow:', workflow.name || 'Unnamed');
  
  for (let i = 0; i < workflow.steps.length; i++) {
    extensionState.workflowStep = i;
    const step = workflow.steps[i];
    
    try {
      console.log(`[EDF] Step ${i + 1}/${workflow.steps.length}:`, step.action);
      await executeStep(step, data);
      
      // Default delay between steps
      if (step.delay || workflow.defaultDelay) {
        await delay(step.delay || workflow.defaultDelay || 100);
      }
    } catch (error) {
      console.error(`[EDF] Step ${i + 1} failed:`, error);
      await logError({
        workflow: workflow.name,
        step: i + 1,
        action: step.action,
        error: error.message
      });
      
      if (workflow.stopOnError !== false) {
        throw error;
      }
    }
  }
  
  extensionState.currentWorkflow = null;
  console.log('[EDF] Workflow completed successfully');
  return { success: true };
}

async function executeStep(step, data) {
  switch (step.action) {
    case 'openTab':
      return await openTab(step.url, step.waitForLoad);
      
    case 'navigateTo':
      return await navigateTo(step.url, step.tabId);
      
    case 'fill':
      return await sendToContent(step.tabId, {
        action: 'fill',
        selector: step.selector,
        selectorType: step.selectorType || 'selector',
        value: replaceVariables(step.value, data),
        fieldType: step.fieldType || 'text'
      });
      
    case 'click':
      return await sendToContent(step.tabId, {
        action: 'click',
        selector: step.selector,
        selectorType: step.selectorType || 'selector'
      });
      
    case 'wait':
      return await delay(step.time || 1000);
      
    case 'waitForElement':
      return await sendToContent(step.tabId, {
        action: 'waitForElement',
        selector: step.selector,
        selectorType: step.selectorType || 'selector',
        timeout: step.timeout || 10000
      });
      
    case 'waitForNavigation':
      return await waitForNavigation(step.tabId, step.timeout);
      
    case 'executeScript':
      return await sendToContent(step.tabId, {
        action: 'executeScript',
        code: step.code
      });
      
    case 'download':
      return await chrome.downloads.download({
        url: step.url,
        filename: step.filename
      });
      
    default:
      throw new Error(`Unknown action: ${step.action}`);
  }
}

// ============= TAB CONTROL =============
async function openTab(url, waitForLoad = true) {
  const tab = await chrome.tabs.create({ url, active: true });
  
  if (waitForLoad) {
    await waitForTabLoad(tab.id);
  }
  
  return { tabId: tab.id };
}

async function navigateTo(url, tabId) {
  if (!tabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tab.id;
  }
  
  await chrome.tabs.update(tabId, { url });
  await waitForTabLoad(tabId);
  
  return { tabId };
}

function waitForTabLoad(tabId, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.webNavigation.onCompleted.removeListener(listener);
      reject(new Error('Tab load timeout'));
    }, timeout);
    
    const listener = (details) => {
      if (details.tabId === tabId && details.frameId === 0) {
        clearTimeout(timer);
        chrome.webNavigation.onCompleted.removeListener(listener);
        setTimeout(resolve, 500); // Small buffer for dynamic content
      }
    };
    
    chrome.webNavigation.onCompleted.addListener(listener);
  });
}

function waitForNavigation(tabId, timeout = 30000) {
  return waitForTabLoad(tabId, timeout);
}

// ============= CONTENT SCRIPT COMMUNICATION =============
async function sendToContent(tabId, message) {
  if (!tabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tab.id;
  }
  
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    // Content script might not be loaded, inject it
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    
    // Retry
    await delay(500);
    return await chrome.tabs.sendMessage(tabId, message);
  }
}

// ============= UTILITY FUNCTIONS =============
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function replaceVariables(value, data) {
  if (!value || typeof value !== 'string') return value;
  
  return value.replace(/\{\$([^}]+)\$\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

async function logError(error) {
  extensionState.errors.push({
    ...error,
    timestamp: Date.now()
  });
  
  // Keep last 100 errors
  if (extensionState.errors.length > 100) {
    extensionState.errors = extensionState.errors.slice(-100);
  }
  
  await chrome.storage.local.set({ errors: extensionState.errors });
}

// ============= MESSAGE HANDLERS =============
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(err => {
    console.error('[EDF] Message handler error:', err);
    sendResponse({ success: false, error: err.message });
  });
  return true; // Async response
});

async function handleMessage(message, sender) {
  switch (message.action) {
    // ===== STATE & CONFIG =====
    case 'getConfig':
      const config = await chrome.storage.local.get(['siteConfigs', 'extensionEnabled', 'configured']);
      return {
        configs: config.siteConfigs || [],
        enabled: config.extensionEnabled ?? false,
        configured: config.configured || false
      };
      
    case 'saveConfig':
      await chrome.storage.local.set({ 
        siteConfigs: message.configs,
        configured: true 
      });
      return { success: true };
      
    case 'setEnabled':
      await chrome.storage.local.set({ extensionEnabled: message.enabled });
      extensionState.enabled = message.enabled;
      updateBadge();
      
      // Notify all tabs
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, { 
            action: 'toggleExtension', 
            enabled: message.enabled 
          });
        } catch (e) {
          // Tab doesn't have content script
        }
      }
      return { success: true };
      
    // ===== EXCEL DATA =====
    case 'getExcelData':
      const excelResult = await chrome.storage.local.get(['excelData', 'currentRowIndex']);
      return {
        data: excelResult.excelData || null,
        currentRow: excelResult.currentRowIndex || 0
      };
      
    case 'setExcelData':
      await chrome.storage.local.set({ 
        excelData: message.data,
        currentRowIndex: 0
      });
      return { success: true };
      
    case 'setRowIndex':
      await chrome.storage.local.set({ currentRowIndex: message.index });
      return { success: true };
      
    // ===== WORKFLOW EXECUTION =====
    case 'runWorkflow':
      return await executeWorkflow(message.workflow, message.data || {});
      
    case 'runSiteAutomation':
      return await runSiteAutomation(message.siteId, message.rowData);
      
    // ===== TAB CONTROL =====
    case 'openTab':
      return await openTab(message.url, message.waitForLoad);
      
    case 'focusTab':
      if (message.url) {
        const matchingTabs = await chrome.tabs.query({ url: message.url + '*' });
        if (matchingTabs.length > 0) {
          await chrome.tabs.update(matchingTabs[0].id, { active: true });
          await chrome.windows.update(matchingTabs[0].windowId, { focused: true });
          return { success: true, tabId: matchingTabs[0].id };
        }
      }
      return { success: false, error: 'Tab not found' };
      
    case 'getCurrentTab':
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return { tab: currentTab };
      
    // ===== HIGHLIGHT FIELD =====
    case 'highlightField':
      return await highlightFieldInTab(message);
      
    // ===== ERRORS =====
    case 'getErrors':
      const errorResult = await chrome.storage.local.get(['errors']);
      return { errors: errorResult.errors || [] };
      
    case 'clearErrors':
      extensionState.errors = [];
      await chrome.storage.local.set({ errors: [] });
      return { success: true };
      
    // ===== RECORDING =====
    case 'startRecording':
      return await startRecording(message.tabId);
      
    case 'stopRecording':
      return await stopRecording();
      
    default:
      return { success: false, error: 'Unknown action' };
  }
}

// ============= SITE AUTOMATION =============
async function runSiteAutomation(siteId, rowData = {}) {
  const config = await chrome.storage.local.get(['siteConfigs', 'extensionEnabled']);
  
  if (!config.extensionEnabled) {
    throw new Error('Extension is disabled');
  }
  
  const site = config.siteConfigs?.find(s => s.id === siteId);
  if (!site) {
    throw new Error('Site not found');
  }
  
  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Build workflow from site config
  const workflow = {
    name: site.name,
    steps: [],
    defaultDelay: 100,
    stopOnError: true
  };
  
  // Add steps for each page
  for (const page of site.pages || []) {
    if (!page.active) continue;
    
    // Add delay before page
    if (page.delayBefore) {
      workflow.steps.push({ action: 'wait', time: page.delayBefore });
    }
    
    // Add field fills
    for (const field of page.fields || []) {
      if (!field.enabled) continue;
      
      if (field.waitForElement) {
        workflow.steps.push({
          action: 'waitForElement',
          tabId: tab.id,
          selector: field.selectorQuery,
          selectorType: field.selectorType,
          timeout: field.waitTimeout || 5000
        });
      }
      
      if (field.fieldType === 'button') {
        workflow.steps.push({
          action: 'click',
          tabId: tab.id,
          selector: field.selectorQuery,
          selectorType: field.selectorType
        });
      } else {
        workflow.steps.push({
          action: 'fill',
          tabId: tab.id,
          selector: field.selectorQuery,
          selectorType: field.selectorType,
          value: field.value,
          fieldType: field.fieldType,
          delay: field.delayAfter
        });
      }
    }
    
    // Add delay after page
    if (page.delayAfter) {
      workflow.steps.push({ action: 'wait', time: page.delayAfter });
    }
  }
  
  return await executeWorkflow(workflow, rowData);
}

// ============= HIGHLIGHT FIELD =============
async function highlightFieldInTab(message) {
  const { url, field, matchType = 'contains', openIfNotFound = false } = message;

  if (!extensionState.enabled) {
    return { success: false, error: 'Extension is disabled. Right-click extension icon → Enable QAFormFiller' };
  }

  // Find an already-opened tab that matches the configured page URL
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

  // If no tab found, open a new tab with the URL
  if (!targetTab) {
    // Construct full URL if needed
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }
    
    // Open new tab and wait for load
    const newTab = await chrome.tabs.create({ url: fullUrl, active: true });
    await waitForTabLoad(newTab.id);
    await delay(1000); // Extra delay for dynamic content
    targetTab = newTab;
  } else {
    // Focus the existing tab
    await chrome.tabs.update(targetTab.id, { active: true });
    await chrome.windows.update(targetTab.windowId, { focused: true });
  }

  // Send highlight command
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

// ============= RECORDING (Stub for future) =============
let recordingState = {
  active: false,
  tabId: null,
  steps: []
};

async function startRecording(tabId) {
  if (!tabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tab.id;
  }
  
  recordingState = {
    active: true,
    tabId,
    steps: []
  };
  
  await chrome.tabs.sendMessage(tabId, { action: 'startRecording' });
  return { success: true };
}

async function stopRecording() {
  if (recordingState.tabId) {
    try {
      const result = await chrome.tabs.sendMessage(recordingState.tabId, { action: 'stopRecording' });
      recordingState.steps = result.steps || [];
    } catch (e) {}
  }
  
  const steps = recordingState.steps;
  recordingState = { active: false, tabId: null, steps: [] };
  
  return { success: true, steps };
}

// ============= TAB UPDATE LISTENER (Auto-fill on navigation) =============
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only act when page finishes loading
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
  
  // Check if extension is enabled
  const result = await chrome.storage.local.get(['extensionEnabled']);
  if (!result.extensionEnabled) return;
  
  // Notify content script to check for matching site
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'checkSiteMatch' });
  } catch (e) {
    // Content script not loaded yet, that's okay
  }
});

console.log('[EDF] Background service worker initialized');
