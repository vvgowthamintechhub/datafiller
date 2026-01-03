import { FieldType, PredefinedFunction } from '@/types';
import {
  Type,
  ListOrdered,
  CheckSquare,
  Circle,
  Calendar,
  MousePointer,
  Upload,
  AlignLeft,
  Clock,
  Code,
  Zap,
  FileText,
  Globe,
  Send,
  FileDown,
  Layers,
  Timer,
  Search,
  Database,
} from 'lucide-react';

export interface FieldTypeInfo {
  type: FieldType;
  label: string;
  description: string;
  icon: typeof Type;
  category: 'basic' | 'advanced' | 'external' | 'scraping';
}

export const fieldTypesList: FieldTypeInfo[] = [
  // Basic types
  { type: 'text', label: 'Text', description: 'Input text field', icon: Type, category: 'basic' },
  { type: 'select', label: 'Select', description: 'Dropdown select', icon: ListOrdered, category: 'basic' },
  { type: 'multipleSelect', label: 'Multiple Select', description: 'Multi-select dropdown', icon: Layers, category: 'basic' },
  { type: 'checkbox', label: 'Checkbox', description: 'Checkbox input', icon: CheckSquare, category: 'basic' },
  { type: 'radio', label: 'Radio', description: 'Radio button', icon: Circle, category: 'basic' },
  { type: 'date', label: 'Date', description: 'Date input', icon: Calendar, category: 'basic' },
  { type: 'button', label: 'Button', description: 'Click button', icon: MousePointer, category: 'basic' },
  { type: 'uploadFile', label: 'Upload File', description: 'File upload', icon: Upload, category: 'basic' },
  { type: 'textarea', label: 'Textarea', description: 'Text area', icon: AlignLeft, category: 'basic' },
  
  // Advanced types
  { type: 'javascript', label: 'JavaScript', description: 'Execute JS code', icon: Code, category: 'advanced' },
  { type: 'function', label: 'Function', description: 'Predefined function', icon: Zap, category: 'advanced' },
  { type: 'timerAction', label: 'Timer Action', description: 'Delayed action', icon: Timer, category: 'advanced' },
  
  // External types
  { type: 'materialSelect', label: 'Material Select', description: 'Material UI select', icon: ListOrdered, category: 'external' },
  { type: 'datePicker', label: 'Date Picker', description: 'Material date picker', icon: Calendar, category: 'external' },
  { type: 'clockPicker', label: 'Clock Picker', description: 'Time picker', icon: Clock, category: 'external' },
  
  // Scraping types
  { type: 'fetchText', label: 'Fetch Text', description: 'Get element text', icon: FileText, category: 'scraping' },
  { type: 'fetchHtml', label: 'Fetch HTML', description: 'Get element HTML', icon: FileText, category: 'scraping' },
  { type: 'scrapingData', label: 'Scraping Data', description: 'Scrape page data', icon: Database, category: 'scraping' },
  { type: 'urlOpen', label: 'URL Open', description: 'Open URL', icon: Globe, category: 'scraping' },
  { type: 'sendRequest', label: 'Send Request', description: 'HTTP request', icon: Send, category: 'scraping' },
  { type: 'saveAsPdf', label: 'Save as PDF', description: 'Save page as PDF', icon: FileDown, category: 'scraping' },
];

export const getFieldTypeInfo = (type: FieldType): FieldTypeInfo | undefined => {
  return fieldTypesList.find(ft => ft.type === type);
};

export const predefinedFunctions: PredefinedFunction[] = [
  // Element checking
  {
    id: 'checkElementExists',
    name: 'checkElementExists',
    category: 'Element Checking',
    description: 'Check if an element exists on the page',
    syntax: 'checkElementExists(selector)',
    example: 'checkElementExists("#submit-btn")',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector or XPath', required: true },
    ],
  },
  {
    id: 'checkElementVisible',
    name: 'checkElementVisible',
    category: 'Element Checking',
    description: 'Check if an element is visible',
    syntax: 'checkElementVisible(selector)',
    example: 'checkElementVisible(".modal")',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector or XPath', required: true },
    ],
  },
  {
    id: 'checkAttributeExists',
    name: 'checkAttributeExists',
    category: 'Element Checking',
    description: 'Check if element has a specific attribute',
    syntax: 'checkAttributeExists(selector, attribute)',
    example: 'checkAttributeExists("#input", "disabled")',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector', required: true },
      { name: 'attribute', type: 'string', description: 'Attribute name', required: true },
    ],
  },
  
  // Text operations
  {
    id: 'checkElementText',
    name: 'checkElementText',
    category: 'Text Operations',
    description: 'Check element text content',
    syntax: 'checkElementText(selector, expectedText)',
    example: 'checkElementText(".status", "Success")',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector', required: true },
      { name: 'expectedText', type: 'string', description: 'Expected text', required: true },
    ],
  },
  {
    id: 'checkElementLength',
    name: 'checkElementLength',
    category: 'Text Operations',
    description: 'Check element text length',
    syntax: 'checkElementLength(selector, minLength, maxLength)',
    example: 'checkElementLength("#name", 3, 50)',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector', required: true },
      { name: 'minLength', type: 'number', description: 'Minimum length', required: true },
      { name: 'maxLength', type: 'number', description: 'Maximum length', required: false },
    ],
  },
  
  // Navigation
  {
    id: 'scrollToElement',
    name: 'scrollToElement',
    category: 'Navigation',
    description: 'Scroll to an element',
    syntax: 'scrollToElement(selector)',
    example: 'scrollToElement("#footer")',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector', required: true },
    ],
  },
  {
    id: 'focusElement',
    name: 'focusElement',
    category: 'Navigation',
    description: 'Focus on an element',
    syntax: 'focusElement(selector)',
    example: 'focusElement("#email-input")',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector', required: true },
    ],
  },
  
  // Timing
  {
    id: 'delay',
    name: 'delay',
    category: 'Timing',
    description: 'Wait for specified milliseconds',
    syntax: 'delay(ms)',
    example: 'delay(1000)',
    parameters: [
      { name: 'ms', type: 'number', description: 'Milliseconds to wait', required: true },
    ],
  },
  {
    id: 'waitForElement',
    name: 'waitForElement',
    category: 'Timing',
    description: 'Wait until element appears',
    syntax: 'waitForElement(selector, timeout)',
    example: 'waitForElement(".loading-complete", 5000)',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector', required: true },
      { name: 'timeout', type: 'number', description: 'Timeout in ms', required: false },
    ],
  },
];

export const specialKeys = [
  { key: '{TAB}', description: 'Tab key' },
  { key: '{ENTER}', description: 'Enter key' },
  { key: '{ESCAPE}', description: 'Escape key' },
  { key: '{BACKSPACE}', description: 'Backspace key' },
  { key: '{DELETE}', description: 'Delete key' },
  { key: '{ARROWUP}', description: 'Arrow Up' },
  { key: '{ARROWDOWN}', description: 'Arrow Down' },
  { key: '{ARROWLEFT}', description: 'Arrow Left' },
  { key: '{ARROWRIGHT}', description: 'Arrow Right' },
  { key: '{HOME}', description: 'Home key' },
  { key: '{END}', description: 'End key' },
  { key: '{PAGEUP}', description: 'Page Up' },
  { key: '{PAGEDOWN}', description: 'Page Down' },
  { key: '{CTRL+A}', description: 'Select All' },
  { key: '{CTRL+C}', description: 'Copy' },
  { key: '{CTRL+V}', description: 'Paste' },
];
