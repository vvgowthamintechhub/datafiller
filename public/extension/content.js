// QAFormFiller - Content Script with Enhanced Console Logging
console.log('%c🚀 QAFormFiller Extension Loaded', 'background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');

let isEnabled = false;
let currentConfig = null;
let excelData = null;
let currentRowIndex = 0;

// Logging utilities with colorful console output
const Logger = {
  styles: {
    header: 'background: #1e40af; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;',
    success: 'background: #16a34a; color: white; padding: 2px 6px; border-radius: 3px;',
    error: 'background: #dc2626; color: white; padding: 2px 6px; border-radius: 3px;',
    warning: 'background: #d97706; color: white; padding: 2px 6px; border-radius: 3px;',
    info: 'background: #0891b2; color: white; padding: 2px 6px; border-radius: 3px;',
    field: 'background: #7c3aed; color: white; padding: 2px 6px; border-radius: 3px;',
    action: 'background: #db2777; color: white; padding: 2px 6px; border-radius: 3px;',
    xpath: 'background: #059669; color: white; padding: 2px 6px; border-radius: 3px;',
    wait: 'background: #6366f1; color: white; padding: 2px 6px; border-radius: 3px;',
    skip: 'background: #78716c; color: white; padding: 2px 6px; border-radius: 3px;',
  },

  group(title, type = 'info') {
    if (!isEnabled) return { end: () => {} };
    const style = this.styles[type] || this.styles.info;
    console.groupCollapsed(`%c${title}`, style);
    return {
      end: () => console.groupEnd()
    };
  },

  log(label, message, type = 'info') {
    if (!isEnabled) return;
    const style = this.styles[type] || this.styles.info;
    console.log(`%c${label}`, style, message);
  },

  success(message, details = '') {
    if (!isEnabled) return;
    console.log(`%c✓ SUCCESS`, this.styles.success, message, details);
  },

  error(message, details = '') {
    if (!isEnabled) return;
    console.log(`%c✗ ERROR`, this.styles.error, message, details);
  },

  warning(message, details = '') {
    if (!isEnabled) return;
    console.log(`%c⚠ WARNING`, this.styles.warning, message, details);
  },

  info(message, details = '') {
    if (!isEnabled) return;
    console.log(`%c● INFO`, this.styles.info, message, details);
  },

  field(name, status, details = '') {
    if (!isEnabled) return;
    const style = status === 'found' ? this.styles.success : 
                  status === 'not_found' ? this.styles.error : 
                  status === 'waiting' ? this.styles.wait : this.styles.field;
    console.log(`%c📝 ${name}`, style, status.toUpperCase(), details);
  },

  xpath(query, found) {
    if (!isEnabled) return;
    console.log(`%c🔍 XPATH`, found ? this.styles.success : this.styles.error, query, found ? '→ Found' : '→ Not Found');
  },

  action(type, element, result) {
    if (!isEnabled) return;
    const style = result === 'success' ? this.styles.success : result === 'error' ? this.styles.error : this.styles.action;
    console.log(`%c⚡ ${type.toUpperCase()}`, style, element, result);
  },

  divider() {
    if (!isEnabled) return;
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #64748b;');
  }
};

// Initialize
async function init() {
  try {
    const result = await chrome.runtime.sendMessage({ action: 'getConfig' });
    isEnabled = result.enabled;
    
    if (isEnabled) {
      Logger.info('Extension is ENABLED - Starting site check...');
      checkForMatchingSite(result.configs);
    } else {
      console.log('%c⏸ QAFormFiller is OFF - No interactions will occur', 'color: #dc2626; font-weight: bold;');
    }
  } catch (e) {
    // Extension not ready yet - this is normal on initial load
  }
}

// Check if current URL matches any configured site
function checkForMatchingSite(configs) {
  if (!isEnabled) return;
  
  const currentUrl = window.location.href;
  Logger.divider();
  Logger.info('Checking URL:', currentUrl);
  
  if (!configs || configs.length === 0) {
    Logger.warning('No site configurations found');
    return;
  }
  
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
        Logger.divider();
        Logger.success(`Site Matched: ${site.name}`);
        Logger.info('Page URL Pattern:', page.url);
        Logger.info('Match Type:', page.matchType);
        Logger.info('Fields Count:', page.fields?.length || 0);
        Logger.divider();
        highlightConfiguredFields();
        return;
      }
    }
  }
  
  Logger.warning('No matching site configuration found for this URL');
}

// Highlight fields that are configured for auto-fill
function highlightConfiguredFields() {
  if (!isEnabled || !currentConfig || !currentConfig.page.fields) return;
  
  const group = Logger.group('🎯 Highlighting Configured Fields', 'field');
  
  currentConfig.page.fields.forEach((field, index) => {
    if (!field.enabled) {
      Logger.log(`[${index + 1}] ${field.name}`, 'Skipped - Field disabled', 'skip');
      return;
    }
    
    const element = findElement(field);
    if (element) {
      element.style.outline = '2px dashed #2563eb';
      element.style.outlineOffset = '2px';
      element.title = `QAFormFiller: ${field.name}`;
      Logger.field(field.name, 'found', `Selector: ${field.selectorQuery}`);
    } else {
      Logger.field(field.name, 'not_found', `Selector: ${field.selectorQuery}`);
    }
  });
  
  group.end();
}

// Find element using selector with detailed logging
function findElement(field, logDetails = false) {
  if (!isEnabled) return null;
  
  try {
    let element = null;
    
    switch (field.selectorType) {
      case 'xpath':
        const result = document.evaluate(
          field.selectorQuery, 
          document, 
          null, 
          XPathResult.FIRST_ORDERED_NODE_TYPE, 
          null
        );
        element = result.singleNodeValue;
        if (logDetails) Logger.xpath(field.selectorQuery, !!element);
        break;
        
      case 'selector':
        element = document.querySelector(field.selectorQuery);
        if (logDetails) Logger.log('CSS Selector', field.selectorQuery, element ? 'success' : 'error');
        break;
        
      case 'name':
        element = document.querySelector(`[name="${field.selectorQuery}"]`);
        if (logDetails) Logger.log('Name Attribute', field.selectorQuery, element ? 'success' : 'error');
        break;
        
      case 'id':
        element = document.getElementById(field.selectorQuery);
        if (logDetails) Logger.log('ID Selector', field.selectorQuery, element ? 'success' : 'error');
        break;
        
      default:
        element = document.querySelector(field.selectorQuery);
    }
    
    return element;
  } catch (e) {
    if (logDetails) Logger.error(`Selector error: ${e.message}`);
    return null;
  }
}

// Wait for element to be visible
async function waitForElement(field, timeout = 5000) {
  if (!isEnabled) return null;
  
  const startTime = Date.now();
  Logger.log(`⏳ Waiting`, `for element: ${field.name}`, 'wait');
  
  while (Date.now() - startTime < timeout) {
    const element = findElement(field);
    if (element) {
      // Check if visible
      if (field.waitForVisible) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         window.getComputedStyle(element).visibility !== 'hidden' &&
                         window.getComputedStyle(element).display !== 'none';
        if (isVisible) {
          Logger.success(`Element visible: ${field.name}`);
          return element;
        }
      } else {
        Logger.success(`Element found: ${field.name}`);
        return element;
      }
    }
    await delay(100);
  }
  
  Logger.error(`Timeout waiting for: ${field.name}`);
  return null;
}

// Fill form with data - Main function with enhanced logging
async function fillForm() {
  if (!isEnabled) {
    console.log('%c⏸ Extension is OFF - Fill operation cancelled', 'color: #dc2626; font-weight: bold;');
    return { success: false, message: 'Extension is disabled' };
  }
  
  if (!currentConfig) {
    Logger.error('No matching site configuration');
    return { success: false, message: 'No matching config' };
  }
  
  const fields = currentConfig.page.fields || [];
  let filledCount = 0;
  let skippedCount = 0;
  let errors = [];
  
  Logger.divider();
  console.log('%c🚀 STARTING FORM FILL OPERATION', 'background: #1e40af; color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: bold;');
  Logger.info('Site:', currentConfig.site.name);
  Logger.info('Total Fields:', fields.length);
  Logger.divider();
  
  // Apply delay before running
  const delayBefore = currentConfig.page.delayBefore || currentConfig.site.delayBefore || 0;
  if (delayBefore > 0) {
    Logger.log('⏳ Delay Before', `Waiting ${delayBefore}ms...`, 'wait');
    await delay(delayBefore);
  }
  
  // Get Excel data for current row
  let rowData = {};
  try {
    const excelResult = await chrome.runtime.sendMessage({ action: 'getExcelData' });
    rowData = excelResult?.rows?.[currentRowIndex] || {};
    if (Object.keys(rowData).length > 0) {
      Logger.success('Excel data loaded', `Row ${currentRowIndex + 1}`);
    }
  } catch (e) {
    Logger.warning('No Excel data available');
  }
  
  // Process each field
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const fieldNum = i + 1;
    
    // Create field group
    const fieldGroup = Logger.group(`[${fieldNum}/${fields.length}] ${field.name}`, 'field');
    
    if (!field.enabled) {
      Logger.log('Status', 'SKIPPED - Field disabled', 'skip');
      skippedCount++;
      fieldGroup.end();
      continue;
    }
    
    // Log field details
    Logger.log('Type', field.fieldType, 'info');
    Logger.log('Selector', `${field.selectorType}: ${field.selectorQuery}`, 'xpath');
    
    // Apply field delay before
    if (field.delayBefore) {
      Logger.log('⏳ Wait Before', `${field.delayBefore}ms`, 'wait');
      await delay(field.delayBefore);
    }
    
    // Wait for element if configured
    let element;
    if (field.waitForElement || field.waitForVisible) {
      element = await waitForElement(field, field.waitTimeout || 5000);
    } else {
      element = findElement(field, true);
    }
    
    if (!element) {
      Logger.error('Element NOT FOUND', field.selectorQuery);
      errors.push({ field: field.name, error: 'Element not found' });
      fieldGroup.end();
      continue;
    }
    
    Logger.success('Element FOUND');
    
    // Check if element is visible and interactable
    const isInteractable = isElementInteractable(element);
    if (!isInteractable) {
      Logger.warning('Element not interactable - attempting anyway');
    }
    
    try {
      let value = field.value || '';
      
      // Replace Excel column placeholders
      const originalValue = value;
      value = value.replace(/\{\$([^}]+)\$\}/g, (match, columnName) => {
        const colValue = rowData[columnName] || '';
        Logger.info(`Column ${columnName}:`, colValue || '(empty)');
        return colValue;
      });
      
      if (originalValue !== value) {
        Logger.log('Value', `"${originalValue}" → "${value}"`, 'info');
      } else if (value) {
        Logger.log('Value', value, 'info');
      }
      
      // Handle default value
      if (!value && field.defaultValue) {
        value = field.defaultValue;
        Logger.info('Using default value:', value);
      }
      
      // Execute JavaScript if enabled
      if (field.runJs && field.jsCode) {
        Logger.log('⚡ JS Code', 'Executing custom JavaScript...', 'action');
        try {
          const fn = new Function('element', 'value', 'rowData', field.jsCode);
          fn(element, value, rowData);
          Logger.action('JavaScript', 'Custom code executed', 'success');
          filledCount++;
          fieldGroup.end();
          continue;
        } catch (jsError) {
          Logger.action('JavaScript', jsError.message, 'error');
          errors.push({ field: field.name, error: `JS Error: ${jsError.message}` });
          fieldGroup.end();
          continue;
        }
      }
      
      // Clear field before fill if configured
      if (field.clearBeforeFill) {
        element.value = '';
        element.dispatchEvent(new Event('input', { bubbles: true }));
        Logger.info('Cleared existing value');
      }
      
      // Fill based on field type
      await fillField(element, field, value);
      Logger.action('FILL', field.fieldType, 'success');
      filledCount++;
      
      // Apply field delay after
      if (field.delayAfter) {
        Logger.log('⏳ Wait After', `${field.delayAfter}ms`, 'wait');
        await delay(field.delayAfter);
      }
      
    } catch (e) {
      Logger.action('FILL', e.message, 'error');
      errors.push({ field: field.name, error: e.message });
    }
    
    fieldGroup.end();
  }
  
  // Apply delay after running
  const delayAfter = currentConfig.page.delayAfter || currentConfig.site.delayAfter || 0;
  if (delayAfter > 0) {
    Logger.log('⏳ Delay After', `Waiting ${delayAfter}ms...`, 'wait');
    await delay(delayAfter);
  }
  
  // Summary
  Logger.divider();
  console.log('%c📊 FILL OPERATION COMPLETE', 'background: #1e40af; color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: bold;');
  Logger.success('Filled:', `${filledCount} fields`);
  if (skippedCount > 0) Logger.warning('Skipped:', `${skippedCount} fields`);
  if (errors.length > 0) {
    Logger.error('Errors:', `${errors.length} fields`);
    errors.forEach(e => Logger.error(`  - ${e.field}:`, e.error));
  }
  Logger.divider();
  
  return { 
    success: errors.length === 0, 
    filledCount,
    skippedCount,
    errors,
    message: `Filled ${filledCount} fields` + (errors.length > 0 ? ` with ${errors.length} errors` : '')
  };
}

// Check if element is interactable
function isElementInteractable(element) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  
  return rect.width > 0 && 
         rect.height > 0 && 
         style.visibility !== 'hidden' && 
         style.display !== 'none' &&
         !element.disabled;
}

// Fill individual field based on type with typing simulation support
async function fillField(element, field, value) {
  await delay(50);
  
  // Type as typing tutor if enabled
  if (field.typeAsTyping && (field.fieldType === 'text' || field.fieldType === 'textarea')) {
    element.focus();
    for (const char of value) {
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await delay(30 + Math.random() * 20);
    }
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  
  switch (field.fieldType) {
    case 'text':
    case 'textarea':
    case 'password':
    case 'email':
    case 'number':
    case 'tel':
    case 'url':
      element.focus();
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      if (field.triggerJsEvent && field.jsEvents) {
        field.jsEvents.forEach(evt => {
          element.dispatchEvent(new Event(evt, { bubbles: true }));
        });
      }
      break;
      
    case 'select':
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      break;
      
    case 'checkbox':
      const shouldCheck = value === 'true' || value === '1' || value === 'yes' || value === true;
      if (element.checked !== shouldCheck) {
        element.click();
      }
      break;
      
    case 'radio':
      const radio = document.querySelector(`input[type="radio"][name="${element.name}"][value="${value}"]`);
      if (radio) radio.click();
      break;
      
    case 'button':
    case 'submit':
      element.click();
      break;
      
    case 'date':
    case 'time':
    case 'datetime-local':
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      break;
      
    case 'file':
      Logger.warning('File input requires manual interaction');
      break;
      
    default:
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Trigger mouse event if configured
  if (field.triggerMouseEvent) {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleExtension') {
    const wasEnabled = isEnabled;
    isEnabled = message.enabled;
    
    if (isEnabled && !wasEnabled) {
      console.log('%c▶ QAFormFiller ENABLED', 'background: #16a34a; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
      chrome.runtime.sendMessage({ action: 'getConfig' }).then(result => {
        checkForMatchingSite(result.configs);
      });
    } else if (!isEnabled && wasEnabled) {
      console.log('%c⏸ QAFormFiller DISABLED', 'background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
      // Remove highlights
      document.querySelectorAll('[style*="outline"]').forEach(el => {
        el.style.outline = '';
        el.style.outlineOffset = '';
      });
      currentConfig = null;
    }
    sendResponse({ success: true });
  }
  
  if (message.action === 'runFill') {
    if (!isEnabled) {
      sendResponse({ success: false, message: 'Extension is disabled' });
      return true;
    }
    fillForm().then(result => {
      sendResponse(result);
    });
    return true;
  }
  
  if (message.action === 'setRowIndex') {
    currentRowIndex = message.index;
    Logger.info('Row index set to:', currentRowIndex);
    sendResponse({ success: true });
  }
  
  if (message.action === 'getStatus') {
    sendResponse({
      enabled: isEnabled,
      hasConfig: !!currentConfig,
      siteName: currentConfig?.site?.name || null
    });
  }
  
  return true;
});

// Initialize on load
init();
