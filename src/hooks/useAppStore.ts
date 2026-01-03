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

// Initial mock data
const initialSites: Site[] = [
  {
    id: '1',
    name: 'Contact Form Demo',
    description: 'Demo contact form for testing',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Registration Portal',
    description: 'User registration form',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
];

const initialPages: SitePage[] = [
  {
    id: 'p1',
    siteId: '1',
    url: 'https://example.com/contact.*',
    matchType: 'regex',
    index: 0,
    active: true,
    fieldsCount: 5,
  },
  {
    id: 'p2',
    siteId: '1',
    url: 'https://example.com/feedback',
    matchType: 'exact',
    index: 1,
    active: true,
    fieldsCount: 3,
  },
  {
    id: 'p3',
    siteId: '2',
    url: 'https://portal.example.com/register',
    matchType: 'contains',
    index: 0,
    active: true,
    fieldsCount: 8,
  },
];

const initialFields: FormField[] = [
  {
    id: 'f1',
    pageId: 'p1',
    siteId: '1',
    name: 'Full Name',
    selectorType: 'selector',
    selectorQuery: '#full-name',
    fieldType: 'text',
    value: '{$name$}',
    columnMapping: 'name',
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    executeOnMultiple: false,
    index: 0,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'f2',
    pageId: 'p1',
    siteId: '1',
    name: 'Email Address',
    selectorType: 'selector',
    selectorQuery: 'input[type="email"]',
    fieldType: 'text',
    value: '{$email$}',
    columnMapping: 'email',
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    executeOnMultiple: false,
    index: 1,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'f3',
    pageId: 'p1',
    siteId: '1',
    name: 'Country Select',
    selectorType: 'selector',
    selectorQuery: '#country',
    fieldType: 'select',
    value: '{$country$}',
    columnMapping: 'country',
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    executeOnMultiple: false,
    index: 2,
    onSuccess: [],
    onError: [],
  },
  {
    id: 'f4',
    pageId: 'p1',
    siteId: '1',
    name: 'Submit Button',
    selectorType: 'xpath',
    selectorQuery: '//button[@type="submit"]',
    fieldType: 'button',
    value: '',
    columnMapping: null,
    enabled: true,
    runJs: false,
    jsCode: null,
    waitForElement: true,
    executeOnMultiple: false,
    index: 3,
    onSuccess: [],
    onError: [],
  },
];

const initialLogs: LogEntry[] = [
  {
    id: 'log1',
    siteId: '1',
    siteName: 'Contact Form Demo',
    action: 'success',
    message: 'Form submitted successfully',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: 'log2',
    siteId: '1',
    siteName: 'Contact Form Demo',
    action: 'fill',
    message: 'Filled 5 fields',
    timestamp: new Date(Date.now() - 3700000),
  },
];

const defaultSettings: AppSettings = {
  theme: 'dark',
  defaultDelay: 500,
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
