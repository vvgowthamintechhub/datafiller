import { useState, useCallback, useEffect } from 'react';
import { 
  Site, 
  SitePage, 
  FormField, 
  Segment, 
  LogEntry, 
  ExcelData, 
  ExcelRowStatus,
  DataTemplate,
  AppSettings,
  SiteSettings
} from '@/types';

const STORAGE_KEY = 'edf_app_data';
const STORAGE_VERSION = 'v2_demo_qavalidation'; // Force fresh data for demo site

// Clear old cache on version change
(() => {
  const storedVersion = localStorage.getItem('edf_storage_version');
  if (storedVersion !== STORAGE_VERSION) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem('edf_storage_version', STORAGE_VERSION);
  }
})();
// DEMO SITE ONLY: QA Validation Demo Form
const initialSites: Site[] = [
  {
    id: 'demo-qavalidation',
    name: 'QA Validation Demo Form',
    description: 'Complete demo form for testing all field types and automation - https://qavalidation.com/demo-form/',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
];

const initialPages: SitePage[] = [
  {
    id: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    url: 'qavalidation.com/demo-form',
    matchType: 'contains',
    index: 0,
    active: true,
    fieldsCount: 10,
  },
];

const initialFields: FormField[] = [
  {
    id: 'qa-f1',
    pageId: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    name: 'First Name',
    selectorType: 'id',
    selectorQuery: 'firstname',
    fieldType: 'text',
    value: 'TestUser',
    columnMapping: null,
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    waitTimeout: 5000,
    executeOnMultiple: false,
    index: 0,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'qa-f2',
    pageId: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    name: 'Last Name',
    selectorType: 'id',
    selectorQuery: 'lastname',
    fieldType: 'text',
    value: 'AutoFiller',
    columnMapping: null,
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    waitTimeout: 5000,
    executeOnMultiple: false,
    index: 1,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'qa-f3',
    pageId: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    name: 'Email Address',
    selectorType: 'id',
    selectorQuery: 'email',
    fieldType: 'email',
    value: 'testuser@qavalidation.com',
    columnMapping: null,
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    waitTimeout: 5000,
    executeOnMultiple: false,
    index: 2,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'qa-f4',
    pageId: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    name: 'Mobile Number',
    selectorType: 'id',
    selectorQuery: 'mobile',
    fieldType: 'tel',
    value: '9876543210',
    columnMapping: null,
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    waitTimeout: 5000,
    executeOnMultiple: false,
    index: 3,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'qa-f5',
    pageId: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    name: 'Date of Birth',
    selectorType: 'id',
    selectorQuery: 'dob',
    fieldType: 'date',
    value: '1990-05-15',
    columnMapping: null,
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    waitTimeout: 5000,
    executeOnMultiple: false,
    index: 4,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'qa-f6',
    pageId: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    name: 'Gender - Male',
    selectorType: 'xpath',
    selectorQuery: "//input[@id='male']",
    fieldType: 'radio',
    value: 'male',
    columnMapping: null,
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    waitTimeout: 5000,
    executeOnMultiple: false,
    index: 5,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'qa-f7',
    pageId: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    name: 'Country',
    selectorType: 'id',
    selectorQuery: 'country',
    fieldType: 'select',
    value: 'India',
    columnMapping: null,
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    waitTimeout: 5000,
    executeOnMultiple: false,
    index: 6,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'qa-f8',
    pageId: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    name: 'Hobby - Reading',
    selectorType: 'xpath',
    selectorQuery: "//input[@value='Reading']",
    fieldType: 'checkbox',
    value: 'true',
    columnMapping: null,
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    waitTimeout: 5000,
    executeOnMultiple: false,
    index: 7,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'qa-f9',
    pageId: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    name: 'Address',
    selectorType: 'id',
    selectorQuery: 'address',
    fieldType: 'textarea',
    value: '123 Automation Street, Test City, QA State 12345',
    columnMapping: null,
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    waitTimeout: 5000,
    executeOnMultiple: false,
    index: 8,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'qa-f10',
    pageId: 'demo-qa-page',
    siteId: 'demo-qavalidation',
    name: 'Submit Button',
    selectorType: 'xpath',
    selectorQuery: "//button[@type='submit']",
    fieldType: 'button',
    value: '',
    columnMapping: null,
    enabled: false,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    waitTimeout: 5000,
    executeOnMultiple: false,
    index: 9,
    onSuccess: [],
    onError: [],
  },
];

const initialLogs: LogEntry[] = [
  {
    id: 'log1',
    siteId: 'demo-qavalidation',
    siteName: 'QA Validation Demo Form',
    action: 'info',
    message: '✓ Demo site configured with 10 fields - Enable extension and visit qavalidation.com/demo-form to test',
    timestamp: new Date(Date.now() - 3600000),
  },
];

const defaultSettings: AppSettings = {
  theme: 'dark',
  defaultDelay: 300,
  showNotifications: true,
  autoSave: true,
  exportFormat: 'json',
};

export const useAppStore = () => {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [pages, setPages] = useState<SitePage[]>(initialPages);
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [excelRowStatuses, setExcelRowStatuses] = useState<ExcelRowStatus[]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [templates, setTemplates] = useState<DataTemplate[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.sites) setSites(data.sites.map((s: Site) => ({ ...s, createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt) })));
        if (data.pages) setPages(data.pages);
        if (data.fields) setFields(data.fields);
        if (data.segments) setSegments(data.segments);
        if (data.settings) setSettings(data.settings);
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sites,
        pages,
        fields,
        segments,
        settings,
      }));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [sites, pages, fields, segments, settings]);

  // Site operations
  const addSite = useCallback((site: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSite: Site = {
      ...site,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSites(prev => [...prev, newSite]);
    return newSite;
  }, []);

  const updateSite = useCallback((id: string, updates: Partial<Site>) => {
    setSites(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
    ));
  }, []);

  const deleteSite = useCallback((id: string) => {
    setSites(prev => prev.filter(s => s.id !== id));
    setPages(prev => prev.filter(p => p.siteId !== id));
    setFields(prev => prev.filter(f => f.siteId !== id));
    setSegments(prev => prev.filter(s => s.siteId !== id));
  }, []);

  const duplicateSite = useCallback((id: string) => {
    const site = sites.find(s => s.id === id);
    if (!site) return null;

    const newSiteId = crypto.randomUUID();
    const newSite: Site = {
      ...site,
      id: newSiteId,
      name: `${site.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Copy pages
    const sitePages = pages.filter(p => p.siteId === id);
    const pageIdMap: Record<string, string> = {};
    const newPages = sitePages.map(p => {
      const newPageId = crypto.randomUUID();
      pageIdMap[p.id] = newPageId;
      return { ...p, id: newPageId, siteId: newSiteId };
    });

    // Copy fields
    const siteFields = fields.filter(f => f.siteId === id);
    const newFields = siteFields.map(f => ({
      ...f,
      id: crypto.randomUUID(),
      siteId: newSiteId,
      pageId: pageIdMap[f.pageId] || f.pageId,
    }));

    setSites(prev => [...prev, newSite]);
    setPages(prev => [...prev, ...newPages]);
    setFields(prev => [...prev, ...newFields]);

    return newSite;
  }, [sites, pages, fields]);

  // Page operations
  const addPage = useCallback((page: Omit<SitePage, 'id'>) => {
    const newPage: SitePage = {
      ...page,
      id: crypto.randomUUID(),
    };
    setPages(prev => [...prev, newPage]);
    return newPage;
  }, []);

  const updatePage = useCallback((id: string, updates: Partial<SitePage>) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deletePage = useCallback((id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    setFields(prev => prev.filter(f => f.pageId !== id));
  }, []);

  const duplicatePage = useCallback((id: string) => {
    const page = pages.find(p => p.id === id);
    if (!page) return null;

    const newPageId = crypto.randomUUID();
    const newPage: SitePage = {
      ...page,
      id: newPageId,
      index: pages.filter(p => p.siteId === page.siteId).length,
      fieldsCount: 0,
    };

    // Copy fields for this page
    const pageFields = fields.filter(f => f.pageId === id);
    const newFields = pageFields.map((f, idx) => ({
      ...f,
      id: crypto.randomUUID(),
      pageId: newPageId,
      index: idx,
    }));

    setPages(prev => [...prev, { ...newPage, fieldsCount: newFields.length }]);
    setFields(prev => [...prev, ...newFields]);

    return newPage;
  }, [pages, fields]);

  const getPagesBySite = useCallback((siteId: string) => {
    return pages.filter(p => p.siteId === siteId).sort((a, b) => a.index - b.index);
  }, [pages]);

  // Field operations
  const addField = useCallback((field: Omit<FormField, 'id'>) => {
    const newField: FormField = {
      ...field,
      id: crypto.randomUUID(),
    };
    setFields(prev => [...prev, newField]);
    
    // Update page field count
    setPages(prev => prev.map(p => 
      p.id === field.pageId ? { ...p, fieldsCount: p.fieldsCount + 1 } : p
    ));
    
    return newField;
  }, []);

  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const deleteField = useCallback((id: string) => {
    const field = fields.find(f => f.id === id);
    setFields(prev => prev.filter(f => f.id !== id));
    
    // Update page field count
    if (field) {
      setPages(prev => prev.map(p => 
        p.id === field.pageId ? { ...p, fieldsCount: Math.max(0, p.fieldsCount - 1) } : p
      ));
    }
  }, [fields]);

  const getFieldsByPage = useCallback((pageId: string) => {
    return fields.filter(f => f.pageId === pageId).sort((a, b) => a.index - b.index);
  }, [fields]);

  const reorderFields = useCallback((pageId: string, fieldIds: string[]) => {
    setFields(prev => prev.map(f => {
      if (f.pageId !== pageId) return f;
      const newIndex = fieldIds.indexOf(f.id);
      return newIndex >= 0 ? { ...f, index: newIndex } : f;
    }));
  }, []);

  // Segment operations
  const addSegment = useCallback((segment: Omit<Segment, 'id'>) => {
    const newSegment: Segment = {
      ...segment,
      id: crypto.randomUUID(),
    };
    setSegments(prev => [...prev, newSegment]);
    return newSegment;
  }, []);

  const updateSegment = useCallback((id: string, updates: Partial<Segment>) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSegment = useCallback((id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
  }, []);

  const getSegmentsBySite = useCallback((siteId: string) => {
    return segments.filter(s => s.siteId === siteId).sort((a, b) => a.index - b.index);
  }, [segments]);

  // Log operations
  const addLog = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 500)); // Keep last 500 logs
    return newLog;
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Excel operations
  const importExcelData = useCallback((data: ExcelData) => {
    setExcelData(data);
    setCurrentRow(0);
    setExcelRowStatuses(data.rows.map((_, i) => ({ rowIndex: i, status: 'pending' })));
  }, []);

  const clearExcelData = useCallback(() => {
    setExcelData(null);
    setCurrentRow(0);
    setExcelRowStatuses([]);
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

  const setRowStatus = useCallback((rowIndex: number, status: ExcelRowStatus['status'], message?: string) => {
    setExcelRowStatuses(prev => prev.map(r => 
      r.rowIndex === rowIndex ? { ...r, status, message } : r
    ));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    // State
    sites,
    pages,
    fields,
    segments,
    logs,
    excelData,
    excelRowStatuses,
    currentRow,
    templates,
    settings,

    // Site operations
    addSite,
    updateSite,
    deleteSite,
    duplicateSite,

    // Page operations
    addPage,
    updatePage,
    deletePage,
    duplicatePage,
    getPagesBySite,

    // Field operations
    addField,
    updateField,
    deleteField,
    getFieldsByPage,
    reorderFields,

    // Segment operations
    addSegment,
    updateSegment,
    deleteSegment,
    getSegmentsBySite,

    // Log operations
    addLog,
    clearLogs,

    // Excel operations
    importExcelData,
    clearExcelData,
    nextRow,
    prevRow,
    setCurrentRow,
    setRowStatus,

    // Settings
    updateSettings,
  };
};

export type AppStore = ReturnType<typeof useAppStore>;
