// Site configuration
export interface Site {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Site Page (URL pattern matching)
export interface SitePage {
  id: string;
  siteId: string;
  url: string; // Regex pattern
  matchType: 'regex' | 'exact' | 'contains';
  index: number;
  active: boolean;
  fieldsCount: number;
  description?: string;
  delayBefore?: number;
  delayAfter?: number;
}

// Field types
export type FieldType =
  | 'text'
  | 'select'
  | 'multipleSelect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'button'
  | 'uploadFile'
  | 'textarea'
  | 'materialSelect'
  | 'datePicker'
  | 'clockPicker'
  | 'javascript'
  | 'function'
  | 'timerAction'
  | 'fetchText'
  | 'fetchHtml'
  | 'scrapingData'
  | 'urlOpen'
  | 'sendRequest'
  | 'saveAsPdf';

// Selector types
export type SelectorType = 'xpath' | 'selector' | 'name' | 'id';

// Field action for success/error handling
export interface FieldAction {
  id: string;
  type: 'click' | 'fill' | 'wait' | 'navigate' | 'script';
  value: string;
}

// Form Field with all options
export interface FormField {
  id: string;
  pageId: string;
  siteId: string;
  name: string;
  selectorType: SelectorType;
  selectorQuery: string;
  fieldType: FieldType;
  value: string;
  columnMapping: string | null; // Excel column name
  enabled: boolean;
  runJs: boolean;
  jsCode: string | null;
  waitForElement: boolean;
  waitForVisible?: boolean;
  executeOnMultiple: boolean;
  index: number;
  onSuccess: FieldAction[];
  onError: FieldAction[];
  // Advanced options
  typeAsTyping?: boolean;
  removeAspxBehavior?: boolean;
  clearBeforeFill?: boolean;
  defaultValue?: string;
  takeFromColumn?: string;
  replaceWithCustom?: boolean;
  customReplaceValue?: string;
  pasteCopiedValue?: boolean;
  childSelector?: string;
  triggerJsEvent?: boolean;
  jsEvents?: string[];
  triggerMouseEvent?: boolean;
  fillAfterThis?: string;
  skipIfConditionTrue?: boolean;
  skipCondition?: string;
  waitForResponseChange?: boolean;
  waitForRequestMonitor?: boolean;
  matchThenFill?: boolean;
  matchValue?: string;
  skipIfFieldMatches?: boolean;
  skipMatchValue?: string;
  isRequired?: boolean;
  successResponseAction?: string;
  errorResponseAction?: string;
  skipResponseAction?: string;
  stopOnError?: boolean;
  stopOnSuccess?: boolean;
  searchAndExecute?: boolean;
  executeAsRowType?: boolean;
  loopMultipleElements?: boolean;
  skipStatusColor?: boolean;
  ignoreInExcel?: boolean;
  delayBefore?: number;
  delayAfter?: number;
  position?: number;
  waitTimeout?: number;
}

// Segment for grouping actions
export interface Segment {
  id: string;
  siteId: string;
  name: string;
  description: string;
  fieldIds: string[];
  active: boolean;
  index: number;
}

// Log entry
export interface LogEntry {
  id: string;
  siteId: string;
  siteName: string;
  action: 'fill' | 'click' | 'scrape' | 'submit' | 'error' | 'success' | 'info' | 'warning';
  message: string;
  timestamp: Date;
  details?: string;
}

// Excel data
export interface ExcelData {
  headers: string[];
  rows: string[][];
  fileName?: string;
}

// Excel row status
export interface ExcelRowStatus {
  rowIndex: number;
  status: 'pending' | 'success' | 'error' | 'skipped';
  message?: string;
}

// Data template
export interface DataTemplate {
  id: string;
  name: string;
  description: string;
  columns: string[];
  rowCount: number;
  createdAt: Date;
}

// Predefined function
export interface PredefinedFunction {
  id: string;
  name: string;
  category: string;
  description: string;
  syntax: string;
  example: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
}

// Site settings
export interface SiteSettings {
  autoRun: boolean;
  delayBetweenFields: number;
  delayBetweenRows: number;
  stopOnError: boolean;
  retryOnError: boolean;
  maxRetries: number;
}

// App settings
export interface AppSettings {
  theme: 'dark' | 'light';
  defaultDelay: number;
  showNotifications: boolean;
  autoSave: boolean;
  exportFormat: 'json' | 'csv';
}
