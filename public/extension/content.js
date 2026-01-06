// QAFormFiller - Content Script with Enhanced Console Logging
console.log('%c🚀 QAFormFiller Extension Loaded', 'background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');

let isEnabled = false;
let currentConfig = null;
let excelData = null;
let currentRowIndex = 0;

// Enhanced Logging with exact format from reference
const Logger = {
  formMatched(count, url) {
    console.log(`%c FORM URL MATCHED: (${count}) %c${url}`, 
      'background: #7c3aed; color: white; padding: 2px 6px; font-weight: bold;', 
      'color: #2563eb; text-decoration: underline;');
  },
  
  siteMatched(count, siteNum, url) {
    console.log(`%c FORM URL MATCHED: (${count}) / SITE: ${siteNum} %c${url}`, 
      'background: #7c3aed; color: white; padding: 2px 6px; font-weight: bold;', 
      'color: #2563eb; text-decoration: underline;');
  },
  
  excelDataNotFound() {
    console.log('%c⚠ EXCEL DATA NOT FOUND', 'color: #d97706; font-weight: bold;');
  },
  
  invalidUrl(type) {
    console.log(`%cINVALID FORM ${type} RESPONSE URL`, 'color: #9ca3af;');
  },
  
  executeField(name) {
    console.log(`%c🔥 EXECUTE FIELD NAME: ${name}`, 'background: #dc2626; color: white; padding: 2px 8px; font-weight: bold;');
  },
  
  fieldSelectorQuery(query) {
    console.log(`%c FIELD SELECTOR QUERY: %c${query}`, 
      'background: #2563eb; color: white; padding: 2px 6px;', 
      'background: #fbbf24; color: black; padding: 2px 6px;');
  },
  
  waitingForField(name) {
    console.log(`%c WAITING: FIELD EXISTS AND VISIBLE IN THE PAGE: ${name}`, 'color: #6366f1;');
  },
  
  fieldExists(name) {
    console.log(`%c FIELD EXISTS IN THIS PAGE: ${name}`, 'background: #22c55e; color: white; padding: 2px 6px;');
  },
  
  fillAction(type, name) {
    console.log(`%c FILL ${type.toUpperCase()} FIELD ACTION : ${name}`, 'background: #f3f4f6; color: black; padding: 2px 6px;');
  },
  
  actionError(message) {
    console.log(`%c ACTION ERROR: ${message}`, 'background: #dc2626; color: white; padding: 2px 6px;');
  },
  
  actionSuccess(message) {
    console.log(`%c ACTION SUCCESS: ${message}`, 'background: #22c55e; color: white; padding: 2px 6px;');
  },
  
  fieldStatusReport(fields) {
    console.log('%c▓ FORM FIELD STATUS REPORT: %c', 
      'background: #1f2937; color: white; padding: 4px 8px;', 
      '', fields);
    console.table(fields);
  },
  
  divider() {
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #64748b;');
  }
};

// Initialize
async function init() {
  try {
    const result = await chrome.runtime.sendMessage({ action: 'getConfig' });
    isEnabled = result.enabled;
    
    if (isEnabled) {
      console.log('%c✓ Extension is ENABLED', 'color: #22c55e; font-weight: bold;');
      checkForMatchingSite(result.configs);
    } else {
      console.log('%c⏸ QAFormFiller is OFF - No interactions will occur', 'color: #dc2626; font-weight: bold;');
    }
  } catch (e) {
    // Extension not ready yet
  }
}

// Check if current URL matches any configured site
function checkForMatchingSite(configs) {
  if (!isEnabled) return;
  
  const currentUrl = window.location.href;
  
  if (!configs || configs.length === 0) {
    console.log('%c⚠ No site configurations found', 'color: #d97706;');
    return;
  }
  
  let matchCount = 0;
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
        matchCount++;
        currentConfig = { site, page };
        Logger.formMatched(matchCount, currentUrl);
        Logger.siteMatched(matchCount, matchCount, currentUrl);
        Logger.excelDataNotFound();
        Logger.invalidUrl('SUCCESS');
        Logger.invalidUrl('ERROR');
        highlightConfiguredFields();
        return;
      }
    }
  }
  
  console.log('%c⚠ No matching site configuration found for this URL', 'color: #d97706;');
}

// Highlight fields that are configured
function highlightConfiguredFields() {
  if (!isEnabled || !currentConfig || !currentConfig.page.fields) return;
  
  currentConfig.page.fields.forEach((field) => {
    if (!field.enabled) return;
    
    const element = findElement(field);
    if (element) {
      element.style.outline = '2px dashed #2563eb';
      element.style.outlineOffset = '2px';
      element.title = `QAFormFiller: ${field.name}`;
    }
  });
}

// Remove all highlights
function removeHighlights() {
  document.querySelectorAll('[style*="outline"]').forEach(el => {
    el.style.outline = '';
    el.style.outlineOffset = '';
  });
}

// Find element using selector
function findElement(field) {
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
        break;
        
      case 'selector':
        element = document.querySelector(field.selectorQuery);
        break;
        
      case 'name':
        element = document.querySelector(`[name="${field.selectorQuery}"]`);
        break;
        
      case 'id':
        element = document.getElementById(field.selectorQuery);
        break;
        
      default:
        element = document.querySelector(field.selectorQuery);
    }
    
    return element;
  } catch (e) {
    return null;
  }
}

// Wait for element
async function waitForElement(field, timeout = 5000) {
  const startTime = Date.now();
  Logger.waitingForField(field.name);
  
  while (Date.now() - startTime < timeout) {
    const element = findElement(field);
    if (element) {
      if (field.waitForVisible) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         window.getComputedStyle(element).visibility !== 'hidden' &&
                         window.getComputedStyle(element).display !== 'none';
        if (isVisible) {
          Logger.fieldExists(field.name);
          return element;
        }
      } else {
        Logger.fieldExists(field.name);
        return element;
      }
    }
    await delay(100);
  }
  
  Logger.actionError(`Timeout waiting for: ${field.name}`);
  return null;
}

// Fill form
async function fillForm() {
  if (!isEnabled) {
    console.log('%c⏸ Extension is OFF - Fill cancelled', 'color: #dc2626; font-weight: bold;');
    return { success: false, message: 'Extension is disabled' };
  }
  
  if (!currentConfig) {
    Logger.actionError('No matching site configuration');
    return { success: false, message: 'No matching config' };
  }
  
  const fields = currentConfig.page.fields || [];
  let filledCount = 0;
  let errors = [];
  let fieldReport = {};
  
  Logger.divider();
  console.log('%c🚀 STARTING FORM FILL OPERATION', 'background: #1e40af; color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: bold;');
  
  // Delay before
  const delayBefore = currentConfig.page.delayBefore || currentConfig.site.delayBefore || 0;
  if (delayBefore > 0) await delay(delayBefore);
  
  // Get Excel data
  let rowData = {};
  try {
    const excelResult = await chrome.runtime.sendMessage({ action: 'getExcelData' });
    rowData = excelResult?.rows?.[currentRowIndex] || {};
  } catch (e) {
    Logger.excelDataNotFound();
  }
  
  // Process each field
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    
    if (!field.enabled) continue;
    
    Logger.executeField(field.name);
    Logger.fieldSelectorQuery(field.selectorQuery);
    
    let element;
    if (field.waitForElement || field.waitForVisible) {
      element = await waitForElement(field, field.waitTimeout || 5000);
    } else {
      element = findElement(field);
      if (element) Logger.fieldExists(field.name);
    }
    
    if (!element) {
      Logger.actionError('ELEMENT NOT FOUND');
      errors.push({ field: field.name, error: 'Element not found' });
      fieldReport[field.name] = { status: false, message: 'ELEMENT NOT FOUND', fieldElement: 'N/A' };
      continue;
    }
    
    try {
      let value = field.value || '';
      value = value.replace(/\{\$([^}]+)\$\}/g, (match, columnName) => rowData[columnName] || '');
      
      if (!value && field.defaultValue) value = field.defaultValue;
      
      Logger.fillAction(field.fieldType, field.name);
      
      if (!value && field.fieldType !== 'button') {
        Logger.actionError('FIELD VALUE NOT FOUND');
        fieldReport[field.name] = { status: false, message: 'FIELD VALUE NOT FOUND', fieldElement: element.tagName.toLowerCase() + (element.id ? '#' + element.id : '') };
        continue;
      }
      
      // Fill based on type
      await fillField(element, field, value);
      Logger.actionSuccess(`Filled: ${field.name}`);
      filledCount++;
      fieldReport[field.name] = { status: true, message: 'SUCCESS', fieldElement: element.tagName.toLowerCase() };
      
      if (field.delayAfter) await delay(field.delayAfter);
      
    } catch (e) {
      Logger.actionError(e.message);
      errors.push({ field: field.name, error: e.message });
      fieldReport[field.name] = { status: false, message: e.message, fieldElement: 'N/A' };
    }
  }
  
  // Show status report
  Logger.fieldStatusReport(fieldReport);
  Logger.divider();
  
  return { 
    success: errors.length === 0, 
    filledCount,
    errors,
    message: `Filled ${filledCount} fields` + (errors.length > 0 ? ` with ${errors.length} errors` : '')
  };
}

// Fill individual field
async function fillField(element, field, value) {
  await delay(50);
  
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
      break;
      
    case 'select':
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      break;
      
    case 'checkbox':
      const shouldCheck = value === 'true' || value === '1' || value === 'yes';
      if (element.checked !== shouldCheck) element.click();
      break;
      
    case 'radio':
      element.click();
      break;
      
    case 'button':
      element.click();
      break;
      
    default:
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Highlight single field for verification
function highlightSingleField(fieldData) {
  const field = {
    selectorType: fieldData.selectorType,
    selectorQuery: fieldData.selectorQuery,
    name: fieldData.name
  };
  
  const element = findElement(field);
  
  if (element) {
    // Remove previous highlights
    document.querySelectorAll('.qaformfiller-highlight').forEach(el => {
      el.style.outline = '';
      el.classList.remove('qaformfiller-highlight');
    });
    
    // Add green highlight
    element.style.outline = '3px solid #22c55e';
    element.style.outlineOffset = '2px';
    element.classList.add('qaformfiller-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    Logger.actionSuccess(`Field highlighted: ${field.name}`);
    return { success: true, message: `Field "${field.name}" found and highlighted` };
  } else {
    Logger.actionError(`Field not found: ${field.name}`);
    return { success: false, message: `Field "${field.name}" not found on this page` };
  }
}

// Check for highlight requests from localStorage
function checkHighlightRequest() {
  try {
    const request = localStorage.getItem('edf_highlight_request');
    if (request) {
      const data = JSON.parse(request);
      if (data.type === 'HIGHLIGHT_FIELD') {
        // Check if this is the right URL
        if (window.location.href.includes(data.url) || data.url === '' || !data.url) {
          highlightSingleField(data.field);
        }
        localStorage.removeItem('edf_highlight_request');
      }
    }
  } catch (e) {}
}

// Poll for highlight requests
setInterval(checkHighlightRequest, 500);

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleExtension') {
    isEnabled = message.enabled;
    if (isEnabled) {
      console.log('%c✓ Extension ENABLED', 'color: #22c55e; font-weight: bold;');
      init();
    } else {
      console.log('%c⏸ Extension DISABLED', 'color: #dc2626; font-weight: bold;');
      removeHighlights();
      currentConfig = null;
    }
    sendResponse({ success: true });
  } else if (message.action === 'runFill') {
    fillForm().then(sendResponse);
    return true;
  } else if (message.action === 'highlightField') {
    const result = highlightSingleField(message.field);
    sendResponse(result);
  } else if (message.action === 'getStatus') {
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
