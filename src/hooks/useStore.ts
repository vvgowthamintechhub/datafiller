import { useState, useCallback } from 'react';
import { Site, FormField, DataTemplate, LogEntry, ExcelData } from '@/types';

// Initial mock data
const initialSites: Site[] = [
  {
    id: '1',
    name: 'Google Forms - Survey',
    url: 'https://docs.google.com/forms/d/example',
    status: 'active',
    fieldsCount: 8,
    lastRun: new Date('2026-01-02T10:30:00'),
    createdAt: new Date('2025-12-15'),
  },
  {
    id: '2',
    name: 'Microsoft Forms - Registration',
    url: 'https://forms.office.com/example',
    status: 'active',
    fieldsCount: 12,
    lastRun: new Date('2026-01-01T14:20:00'),
    createdAt: new Date('2025-12-20'),
  },
  {
    id: '3',
    name: 'Custom Contact Form',
    url: 'https://example.com/contact',
    status: 'inactive',
    fieldsCount: 5,
    lastRun: null,
    createdAt: new Date('2025-12-28'),
  },
];

const initialFields: FormField[] = [
  { id: 'f1', siteId: '1', name: 'Full Name', selector: 'input[name="name"]', type: 'text', value: '', columnIndex: 0, enabled: true },
  { id: 'f2', siteId: '1', name: 'Email', selector: 'input[type="email"]', type: 'text', value: '', columnIndex: 1, enabled: true },
  { id: 'f3', siteId: '1', name: 'Phone', selector: 'input[name="phone"]', type: 'text', value: '', columnIndex: 2, enabled: true },
  { id: 'f4', siteId: '1', name: 'Country', selector: 'select[name="country"]', type: 'select', value: 'India', columnIndex: 3, enabled: true },
  { id: 'f5', siteId: '1', name: 'Message', selector: 'textarea[name="message"]', type: 'textarea', value: '', columnIndex: 4, enabled: true },
];

const initialTemplates: DataTemplate[] = [
  {
    id: 't1',
    name: 'Employee Data',
    description: 'Template for employee registration forms',
    columns: ['Name', 'Email', 'Phone', 'Department', 'Position'],
    rowCount: 150,
    createdAt: new Date('2025-12-10'),
  },
  {
    id: 't2',
    name: 'Customer Survey',
    description: 'Customer feedback survey responses',
    columns: ['Name', 'Email', 'Rating', 'Feedback', 'Date'],
    rowCount: 320,
    createdAt: new Date('2025-12-18'),
  },
];

const initialLogs: LogEntry[] = [
  { id: 'l1', siteId: '1', siteName: 'Google Forms - Survey', action: 'success', message: 'Form filled successfully', timestamp: new Date('2026-01-02T10:30:00') },
  { id: 'l2', siteId: '1', siteName: 'Google Forms - Survey', action: 'fill', message: 'Filling field: Full Name', timestamp: new Date('2026-01-02T10:29:58') },
  { id: 'l3', siteId: '2', siteName: 'Microsoft Forms - Registration', action: 'submit', message: 'Form submitted', timestamp: new Date('2026-01-01T14:20:00') },
  { id: 'l4', siteId: '1', siteName: 'Google Forms - Survey', action: 'click', message: 'Clicked submit button', timestamp: new Date('2026-01-02T10:29:59') },
  { id: 'l5', siteId: '3', siteName: 'Custom Contact Form', action: 'error', message: 'Selector not found: #submit-btn', timestamp: new Date('2025-12-28T09:15:00'), details: 'Element with selector "#submit-btn" could not be located on the page' },
];

export const useStore = () => {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [templates, setTemplates] = useState<DataTemplate[]>(initialTemplates);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [currentRow, setCurrentRow] = useState(0);

  const addSite = useCallback((site: Omit<Site, 'id' | 'createdAt'>) => {
    const newSite: Site = {
      ...site,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setSites(prev => [...prev, newSite]);
    return newSite;
  }, []);

  const updateSite = useCallback((id: string, updates: Partial<Site>) => {
    setSites(prev => prev.map(site => site.id === id ? { ...site, ...updates } : site));
  }, []);

  const deleteSite = useCallback((id: string) => {
    setSites(prev => prev.filter(site => site.id !== id));
    setFields(prev => prev.filter(field => field.siteId !== id));
  }, []);

  const addField = useCallback((field: Omit<FormField, 'id'>) => {
    const newField: FormField = {
      ...field,
      id: crypto.randomUUID(),
    };
    setFields(prev => [...prev, newField]);
    return newField;
  }, []);

  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => field.id === id ? { ...field, ...updates } : field));
  }, []);

  const deleteField = useCallback((id: string) => {
    setFields(prev => prev.filter(field => field.id !== id));
  }, []);

  const getFieldsBySite = useCallback((siteId: string) => {
    return fields.filter(field => field.siteId === siteId);
  }, [fields]);

  const addLog = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const importExcelData = useCallback((data: ExcelData) => {
    setExcelData(data);
    setCurrentRow(0);
  }, []);

  const nextRow = useCallback(() => {
    if (excelData && currentRow < excelData.rows.length - 1) {
      setCurrentRow(prev => prev + 1);
    }
  }, [excelData, currentRow]);

  const prevRow = useCallback(() => {
    if (currentRow > 0) {
      setCurrentRow(prev => prev - 1);
    }
  }, [currentRow]);

  return {
    sites,
    fields,
    templates,
    logs,
    excelData,
    currentRow,
    addSite,
    updateSite,
    deleteSite,
    addField,
    updateField,
    deleteField,
    getFieldsBySite,
    addLog,
    clearLogs,
    importExcelData,
    nextRow,
    prevRow,
    setCurrentRow,
  };
};
