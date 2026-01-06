// Excellent Data Filler - Content Script
console.log('Excellent Data Filler content script loaded');

let isEnabled = false;
let currentConfig = null;
let excelData = null;
let currentRowIndex = 0;

// Initialize
async function init() {
  try {
    const result = await chrome.runtime.sendMessage({ action: 'getConfig' });
    isEnabled = result.enabled;
    
    if (isEnabled) {
      checkForMatchingSite(result.configs);
    }
  } catch (e) {
    console.log('Extension not ready yet');
  }
}

// Check if current URL matches any configured site
function checkForMatchingSite(configs) {
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
            matches = currentUrl.includes(page.url);
            break;
          default:
            matches = currentUrl.includes(page.url);
        }
      } catch (e) {
        matches = currentUrl.includes(page.url);
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
  let rowData = {};
  try {
    const excelResult = await chrome.runtime.sendMessage({ action: 'getExcelData' });
    rowData = excelResult?.rows?.[currentRowIndex] || {};
  } catch (e) {
    console.log('Could not get Excel data');
  }
  
  for (const field of fields) {
    if (!field.enabled) continue;
    
    const element = findElement(field);
    if (!element) {
      errors.push('Element not found: ' + field.name);
      continue;
    }
    
    try {
      let value = field.value || '';
      
      // Replace Excel column placeholders
      value = value.replace(/\{\$([^}]+)\$\}/g, (match, columnName) => {
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
      currentConfig = null;
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
  
  return true;
});

// Initialize on load
init();
