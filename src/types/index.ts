export interface Site {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  fieldsCount: number;
  lastRun: Date | null;
  createdAt: Date;
}

export interface FormField {
  id: string;
  siteId: string;
  name: string;
  selector: string;
  type: 'text' | 'select' | 'checkbox' | 'radio' | 'file' | 'textarea' | 'date' | 'number';
  value: string;
  columnIndex: number | null;
  enabled: boolean;
}

export interface DataTemplate {
  id: string;
  name: string;
  description: string;
  columns: string[];
  rowCount: number;
  createdAt: Date;
}

export interface LogEntry {
  id: string;
  siteId: string;
  siteName: string;
  action: 'fill' | 'click' | 'scrape' | 'submit' | 'error' | 'success';
  message: string;
  timestamp: Date;
  details?: string;
}

export interface ExcelData {
  headers: string[];
  rows: string[][];
}
