/**
 * QAFormFiller - Content Script (DOM EXECUTOR)
 * EDF v4 Style Architecture
 * 
 * This script ONLY handles DOM operations:
 * - Finding elements
 * - Filling inputs
 * - Clicking buttons
 * - Highlighting elements
 * 
 * It NEVER controls tabs or navigation.
 * All orchestration comes from the Background script.
 */

// ============= STATE =============
let isEnabled = true; // Default to enabled
let currentConfig = null;
let isRecording = false;
let recordedSteps = [];

// ============= CONSOLE LOGGING THEME =============
const Logger = {
  styles: {
    header: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 14px;',
    success: 'background: #10b981; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    error: 'background: #ef4444; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    warning: 'background: #f59e0b; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    info: 'background: #3b82f6; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    field: 'background: #8b5cf6; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    action: 'background: #06b6d4; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    selector: 'background: #fbbf24; color: #1f2937; padding: 3px 8px; border-radius: 4px; font-weight: 600;',
    value: 'background: #e5e7eb; color: #1f2937; padding: 3px 8px; border-radius: 4px;',
    divider: 'color: #6366f1; font-weight: bold;'
  },
  
  header(msg) {
    if (!isEnabled) return;
    console.log(`%c🚀 ${msg}`, this.styles.header);
  },
  
  divider() {
    if (!isEnabled) return;
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', this.styles.divider);
  },
  
  siteMatched(siteName, url) {
    if (!isEnabled) return;
    this.divider();
    console.log(`%c📋 SITE MATCHED %c${siteName}`, this.styles.info, 'color: #3b82f6; font-weight: bold; font-size: 13px;');
    console.log(`%c🔗 URL: %c${url}`, 'color: #6b7280;', 'color: #3b82f6; text-decoration: underline;');
  },
  
  fieldExecute(name, index, total) {
    if (!isEnabled) return;
    console.log('');
    console.log(`%c▶ FIELD [${index}/${total}] %c${name}`, this.styles.field, 'color: #8b5cf6; font-weight: bold;');
  },
  
  selector(type, query) {
    if (!isEnabled) return;
    console.log(`  %cSelector: %c${type.toUpperCase()} %c→ %c${query}`, 
      'color: #6b7280;', this.styles.selector, 'color: #6b7280;', this.styles.value);
  },
  
  elementFound(tagName, details = '') {
    if (!isEnabled) return;
    console.log(`  %c✓ FOUND %c<${tagName}> ${details}`, this.styles.success, 'color: #10b981;');
  },
  
  elementNotFound() {
    if (!isEnabled) return;
    console.log(`  %c✗ NOT FOUND %cElement does not exist in DOM`, this.styles.error, 'color: #ef4444;');
  },
  
  fillAction(type, value) {
    if (!isEnabled) return;
    const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
    console.log(`  %c⚡ ${type.toUpperCase()} %c→ %c"${displayValue}"`, 
      this.styles.action, 'color: #6b7280;', 'color: #10b981;');
  },
  
  success(msg) {
    if (!isEnabled) return;
    console.log(`  %c✓ SUCCESS %c${msg}`, this.styles.success, 'color: #10b981;');
  },
  
  error(msg) {
    if (!isEnabled) return;
    console.log(`  %c✗ ERROR %c${msg}`, this.styles.error, 'color: #ef4444;');
  },
  
  warning(msg) {
    if (!isEnabled) return;
    console.log(`  %c⚠ WARNING %c${msg}`, this.styles.warning, 'color: #f59e0b;');
  },
  
  waiting(msg) {
    if (!isEnabled) return;
    console.log(`  %c⏳ WAITING %c${msg}`, 'background: #6366f1; color: white; padding: 3px 8px; border-radius: 4px;', 'color: #6366f1;');
  },
  
  report(results) {
    if (!isEnabled) return;
    this.divider();
    console.log('%c📊 EXECUTION REPORT', this.styles.header);
    console.table(results);
  },
  
  extensionState(enabled) {
    console.log(`%c${enabled ? '✓ QAFormFiller ENABLED' : '⏸ QAFormFiller DISABLED'}`, 
      enabled ? 'background: #10b981; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold;' 
              : 'background: #6b7280; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold;');
  }
};

// ============= ELEMENT FINDING =============
function findElement(selector, selectorType = 'selector') {
  try {
    switch (selectorType) {
      case 'xpath':
        const result = document.evaluate(
          selector,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        return result.singleNodeValue;
        
      case 'id':
        return document.getElementById(selector);
        
      case 'name':
        return document.querySelector(`[name="${selector}"]`);
        
      case 'selector':
      default:
        return document.querySelector(selector);
    }
  } catch (e) {
    Logger.error(`Selector error: ${e.message}`);
    return null;
  }
}

function findAllElements(selector, selectorType = 'selector') {
  try {
    switch (selectorType) {
      case 'xpath':
        const result = document.evaluate(
          selector,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        const elements = [];
        for (let i = 0; i < result.snapshotLength; i++) {
          elements.push(result.snapshotItem(i));
        }
        return elements;
        
      case 'id':
        const el = document.getElementById(selector);
        return el ? [el] : [];
        
      case 'name':
        return Array.from(document.querySelectorAll(`[name="${selector}"]`));
        
      case 'selector':
      default:
        return Array.from(document.querySelectorAll(selector));
    }
  } catch (e) {
    return [];
  }
}

// ============= WAIT FOR ELEMENT =============
async function waitForElement(selector, selectorType, timeout = 10000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = findElement(selector, selectorType);
    if (element) {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 &&
        window.getComputedStyle(element).visibility !== 'hidden' &&
        window.getComputedStyle(element).display !== 'none';
      
      if (isVisible) {
        return element;
      }
    }
    await delay(100);
  }
  
  return null;
}

// ============= FIELD FILLING (React/Angular/Vue Compatible) =============
async function fillField(element, value, fieldType = 'text') {
  // Focus first
  element.focus();
  await delay(50);
  
  switch (fieldType) {
    case 'text':
    case 'textarea':
    case 'password':
    case 'email':
    case 'number':
    case 'tel':
    case 'url':
    case 'search':
      await fillTextInput(element, value);
      break;
      
    case 'select':
      await fillSelect(element, value);
      break;
      
    case 'multipleSelect':
      await fillMultiSelect(element, value);
      break;
      
    case 'checkbox':
      await fillCheckbox(element, value);
      break;
      
    case 'radio':
      await fillRadio(element, value);
      break;
      
    case 'date':
    case 'datePicker':
      await fillDateInput(element, value);
      break;
      
    case 'materialSelect':
      await fillMaterialSelect(element, value);
      break;
      
    default:
      await fillTextInput(element, value);
  }
  
  // Blur to finalize
  element.blur();
}

async function fillTextInput(element, value) {
  // Clear existing value
  element.value = '';
  
  // Dispatch events for React/Angular/Vue compatibility
  element.dispatchEvent(new Event('focus', { bubbles: true }));
  
  // Set value using native setter (React compatibility)
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  )?.set || Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, 'value'
  )?.set;
  
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else {
    element.value = value;
  }
  
  // Dispatch all relevant events
  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
  element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
}

async function fillSelect(element, value) {
  element.value = value;
  element.dispatchEvent(new Event('change', { bubbles: true }));
  
  // For Angular
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

async function fillMultiSelect(element, values) {
  const valueArray = Array.isArray(values) ? values : values.split(',').map(v => v.trim());
  
  Array.from(element.options).forEach(option => {
    option.selected = valueArray.includes(option.value);
  });
  
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

async function fillCheckbox(element, value) {
  const shouldCheck = value === 'true' || value === '1' || value === 'yes' || value === true;
  
  if (element.checked !== shouldCheck) {
    element.click();
    // Also dispatch change for frameworks
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

async function fillRadio(element, value) {
  element.click();
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

async function fillDateInput(element, value) {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

async function fillMaterialSelect(element, value) {
  // Material UI / Angular Material select handling
  element.click();
  await delay(300);
  
  // Find and click the option
  const options = document.querySelectorAll('[role="option"], .mat-option, .MuiMenuItem-root');
  for (const option of options) {
    if (option.textContent?.trim() === value || option.getAttribute('data-value') === value) {
      option.click();
      break;
    }
  }
}

// ============= CLICK HANDLING =============
async function clickElement(element) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await delay(100);
  
  // Dispatch full click sequence
  element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

// ============= HIGHLIGHTING =============
function highlightElement(selector, selectorType, fieldName) {
  // Remove previous highlights
  document.querySelectorAll('.qaff-highlight').forEach(el => {
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.classList.remove('qaff-highlight');
    
    // Remove label
    const label = el.querySelector('.qaff-label');
    if (label) label.remove();
  });
  
  const element = findElement(selector, selectorType);
  
  if (element) {
    element.style.outline = '3px solid #22c55e';
    element.style.outlineOffset = '3px';
    element.classList.add('qaff-highlight');
    
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add floating label
    const label = document.createElement('div');
    label.className = 'qaff-label';
    label.style.cssText = `
      position: absolute;
      background: #22c55e;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 999999;
      pointer-events: none;
      font-family: system-ui, sans-serif;
    `;
    label.textContent = `✓ ${fieldName || 'Field Found'}`;
    
    const rect = element.getBoundingClientRect();
    label.style.top = `${window.scrollY + rect.top - 30}px`;
    label.style.left = `${window.scrollX + rect.left}px`;
    document.body.appendChild(label);
    
    // Remove after 5 seconds
    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
      element.classList.remove('qaff-highlight');
      label.remove();
    }, 5000);
    
    Logger.success(`Field highlighted: ${fieldName}`);
    return { success: true, message: 'Element found and highlighted' };
  } else {
    Logger.error(`Field not found: ${fieldName}`);
    return { success: false, message: 'Element not found on this page' };
  }
}

// ============= RECORDING =============
function startRecording() {
  isRecording = true;
  recordedSteps = [];
  
  // Record clicks
  document.addEventListener('click', recordClick, true);
  
  // Record inputs
  document.addEventListener('input', recordInput, true);
  
  Logger.header('Recording started...');
}

function stopRecording() {
  isRecording = false;
  
  document.removeEventListener('click', recordClick, true);
  document.removeEventListener('input', recordInput, true);
  
  Logger.header('Recording stopped');
  return recordedSteps;
}

function recordClick(e) {
  if (!isRecording) return;
  
  const selector = generateSelector(e.target);
  recordedSteps.push({
    action: 'click',
    selector,
    selectorType: 'selector',
    timestamp: Date.now()
  });
}

function recordInput(e) {
  if (!isRecording) return;
  
  const selector = generateSelector(e.target);
  recordedSteps.push({
    action: 'fill',
    selector,
    selectorType: 'selector',
    value: e.target.value,
    fieldType: e.target.type || 'text',
    timestamp: Date.now()
  });
}

function generateSelector(element) {
  if (element.id) return `#${element.id}`;
  if (element.name) return `[name="${element.name}"]`;
  
  // Build a path
  const path = [];
  let el = element;
  while (el && el !== document.body) {
    let selector = el.tagName.toLowerCase();
    if (el.className) {
      const classes = el.className.split(' ').filter(c => c && !c.includes('qaff'));
      if (classes.length) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }
    path.unshift(selector);
    el = el.parentElement;
  }
  return path.join(' > ');
}

// ============= UTILITY =============
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============= MESSAGE HANDLER =============
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch(err => {
    Logger.error(err.message);
    sendResponse({ success: false, error: err.message });
  });
  return true;
});

async function handleMessage(message) {
  switch (message.action) {
    case 'toggleExtension':
      isEnabled = message.enabled;
      Logger.extensionState(isEnabled);
      if (!isEnabled) {
        // Remove all highlights
        document.querySelectorAll('.qaff-highlight, .qaff-label').forEach(el => el.remove?.() || (el.style.outline = ''));
        currentConfig = null;
      } else {
        await init();
      }
      return { success: true };
      
    case 'fill':
      Logger.selector(message.selectorType, message.selector);
      const fillEl = findElement(message.selector, message.selectorType);
      if (!fillEl) {
        Logger.elementNotFound();
        throw new Error('Element not found');
      }
      Logger.elementFound(fillEl.tagName);
      await fillField(fillEl, message.value, message.fieldType);
      Logger.fillAction(message.fieldType, message.value);
      Logger.success('Field filled');
      return { success: true };
      
    case 'click':
      Logger.selector(message.selectorType, message.selector);
      const clickEl = findElement(message.selector, message.selectorType);
      if (!clickEl) {
        Logger.elementNotFound();
        throw new Error('Element not found');
      }
      Logger.elementFound(clickEl.tagName);
      await clickElement(clickEl);
      Logger.success('Element clicked');
      return { success: true };
      
    case 'waitForElement':
      Logger.waiting(`Element: ${message.selector}`);
      const waitEl = await waitForElement(message.selector, message.selectorType, message.timeout);
      if (!waitEl) {
        Logger.error('Timeout waiting for element');
        throw new Error('Element not found within timeout');
      }
      Logger.elementFound(waitEl.tagName);
      return { success: true };
      
    case 'highlightElement':
      return highlightElement(message.selector, message.selectorType, message.fieldName);
      
    case 'executeScript':
      try {
        const result = eval(message.code);
        return { success: true, result };
      } catch (e) {
        throw new Error(`Script error: ${e.message}`);
      }
      
    case 'runFill':
      return await runFormFill();
      
    case 'getStatus':
      return {
        enabled: isEnabled,
        hasConfig: !!currentConfig,
        siteName: currentConfig?.site?.name || null,
        url: window.location.href
      };
      
    case 'startRecording':
      startRecording();
      return { success: true };
      
    case 'stopRecording':
      const steps = stopRecording();
      return { success: true, steps };
      
    default:
      return { success: false, error: 'Unknown action' };
  }
}

// ============= FORM FILL EXECUTION =============
async function runFormFill() {
  if (!isEnabled) {
    return { success: false, message: 'Extension is disabled' };
  }
  
  if (!currentConfig) {
    return { success: false, message: 'No matching site configuration' };
  }
  
  const fields = currentConfig.page?.fields || [];
  if (fields.length === 0) {
    return { success: false, message: 'No fields configured' };
  }
  
  Logger.header('STARTING FORM FILL');
  Logger.siteMatched(currentConfig.site.name, window.location.href);
  
  let filledCount = 0;
  let errorCount = 0;
  const results = [];
  
  // Get Excel data
  let rowData = {};
  try {
    const excelResult = await chrome.runtime.sendMessage({ action: 'getExcelData' });
    if (excelResult?.data?.rows?.[excelResult.currentRow || 0]) {
      const row = excelResult.data.rows[excelResult.currentRow || 0];
      const headers = excelResult.data.headers || [];
      headers.forEach((header, i) => {
        rowData[header] = row[i] || '';
      });
    }
  } catch (e) {
    Logger.warning('No Excel data available');
  }
  
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (!field.enabled) continue;
    
    Logger.fieldExecute(field.name, i + 1, fields.length);
    Logger.selector(field.selectorType, field.selectorQuery);
    
    // Wait for element if configured
    let element;
    if (field.waitForElement) {
      Logger.waiting('Element to be visible...');
      element = await waitForElement(field.selectorQuery, field.selectorType, field.waitTimeout || 5000);
    } else {
      element = findElement(field.selectorQuery, field.selectorType);
    }
    
    if (!element) {
      Logger.elementNotFound();
      results.push({ field: field.name, status: 'error', message: 'Not found' });
      errorCount++;
      continue;
    }
    
    Logger.elementFound(element.tagName, element.id ? `#${element.id}` : '');
    
    try {
      // Replace variables in value
      let value = field.value || '';
      value = value.replace(/\{\$([^}]+)\$\}/g, (_, key) => rowData[key] || '');
      if (!value && field.defaultValue) value = field.defaultValue;
      
      // Execute based on field type
      if (field.fieldType === 'button') {
        Logger.fillAction('click', 'button');
        await clickElement(element);
      } else if (field.runJs && field.jsCode) {
        Logger.fillAction('javascript', 'custom code');
        const fn = new Function('element', 'value', 'rowData', field.jsCode);
        fn(element, value, rowData);
      } else {
        Logger.fillAction(field.fieldType, value);
        await fillField(element, value, field.fieldType);
      }
      
      Logger.success('Completed');
      results.push({ field: field.name, status: 'success', message: 'Filled' });
      filledCount++;
      
      // Delay after field
      if (field.delayAfter) {
        await delay(field.delayAfter);
      }
    } catch (e) {
      Logger.error(e.message);
      results.push({ field: field.name, status: 'error', message: e.message });
      errorCount++;
    }
  }
  
  Logger.report(results);
  Logger.divider();
  
  return {
    success: errorCount === 0,
    filledCount,
    errorCount,
    message: `Filled ${filledCount} fields` + (errorCount > 0 ? `, ${errorCount} errors` : '')
  };
}

// ============= INITIALIZATION =============
async function init() {
  try {
    const result = await chrome.runtime.sendMessage({ action: 'getConfig' });
    // Default to enabled if not explicitly set
    isEnabled = result.enabled ?? true;
    
    if (isEnabled) {
      Logger.extensionState(true);
      await checkForMatchingSite(result.configs);
    } else {
      Logger.extensionState(false);
    }
  } catch (e) {
    // Extension context might not be ready, default to enabled
    isEnabled = true;
    Logger.extensionState(true);
  }
}

async function checkForMatchingSite(configs) {
  if (!isEnabled || !configs) return;
  
  const currentUrl = window.location.href;
  
  for (const site of configs) {
    if (!site.pages || site.status !== 'active') continue;
    
    for (const page of site.pages) {
      if (!page.active) continue;
      
      let matches = false;
      try {
        switch (page.matchType) {
          case 'regex':
            matches = new RegExp(page.url).test(currentUrl);
            break;
          case 'exact':
            matches = currentUrl === page.url;
            break;
          case 'contains':
          default:
            matches = currentUrl.includes(page.url);
        }
      } catch (e) {
        matches = currentUrl.includes(page.url);
      }
      
      if (matches) {
        currentConfig = { site, page };
        Logger.siteMatched(site.name, currentUrl);
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
    
    const element = findElement(field.selectorQuery, field.selectorType);
    if (element) {
      element.style.outline = '2px dashed #3b82f6';
      element.style.outlineOffset = '2px';
      element.title = `QAFormFiller: ${field.name}`;
    }
  });
}

// Initialize on load
init();
