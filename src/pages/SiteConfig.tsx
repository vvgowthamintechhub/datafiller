import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Minus, GripVertical, Pencil, List, Trash2, Copy, Clipboard, MoreVertical, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Site, SitePage, ExcelData } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface SiteConfigProps {
  site: Site | null;
  pages: SitePage[];
  excelData: ExcelData | null;
  onUpdateSite: (id: string, updates: Partial<Site>) => void;
  onAddPage: (page: Omit<SitePage, 'id'>) => void;
  onUpdatePage: (id: string, updates: Partial<SitePage>) => void;
  onDeletePage: (id: string) => void;
  onDuplicatePage: (id: string) => void;
  onViewFields: (pageId: string) => void;
  onImportExcel: (data: ExcelData) => void;
  onClearExcel: () => void;
}

// Clipboard for page copy/paste
let copiedPage: SitePage | null = null;

export const SiteConfig = ({
  site,
  pages,
  excelData,
  onUpdateSite,
  onAddPage,
  onUpdatePage,
  onDeletePage,
  onDuplicatePage,
  onViewFields,
  onImportExcel,
  onClearExcel,
}: SiteConfigProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState(site?.name || '');
  const [description, setDescription] = useState(site?.description || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(site?.status || 'active');
  const [showPageDialog, setShowPageDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<SitePage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (site) {
      setName(site.name);
      setDescription(site.description);
      setStatus(site.status);
    }
  }, [site]);

  if (!site) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Site not found</p>
        <Button variant="outline" onClick={() => navigate('/app')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    onUpdateSite(site.id, { name, description, status });
    toast.success('Site updated successfully');
  };

  const handleAddPage = () => {
    setEditingPage(null);
    setShowPageDialog(true);
  };

  const handleEditPage = (page: SitePage) => {
    setEditingPage(page);
    setShowPageDialog(true);
  };

  const handleSavePage = (pageData: Partial<SitePage>) => {
    if (editingPage) {
      onUpdatePage(editingPage.id, pageData);
      toast.success('Page updated');
    } else {
      onAddPage({
        siteId: site.id,
        url: pageData.url || '',
        matchType: pageData.matchType || 'contains',
        index: pages.length,
        active: pageData.active ?? true,
        fieldsCount: 0,
        description: pageData.description,
        delayBefore: pageData.delayBefore,
        delayAfter: pageData.delayAfter,
      });
      toast.success('Page added');
    }
    setShowPageDialog(false);
  };

  const handleCopyPage = (page: SitePage) => {
    copiedPage = { ...page };
    toast.success('Page copied');
  };

  const handlePastePage = () => {
    if (copiedPage) {
      onAddPage({
        siteId: site.id,
        url: copiedPage.url,
        matchType: copiedPage.matchType,
        index: pages.length,
        active: copiedPage.active,
        fieldsCount: 0,
        description: copiedPage.description,
        delayBefore: copiedPage.delayBefore,
        delayAfter: copiedPage.delayAfter,
      });
      toast.success('Page pasted');
    } else {
      toast.error('No page copied');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

      if (jsonData.length > 0) {
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as string[][];
        onImportExcel({ headers, rows, fileName: file.name });
        toast.success(`Imported ${rows.length} rows from ${file.name}`);
      }
    } catch (error) {
      toast.error('Failed to parse file');
    }
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const template = [
      ['Name', 'Email', 'Phone', 'Address', 'City', 'Country'],
      ['John Doe', 'john@example.com', '1234567890', '123 Main St', 'New York', 'USA'],
      ['Jane Smith', 'jane@example.com', '0987654321', '456 Oak Ave', 'Los Angeles', 'USA'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'qaformfiller-template.xlsx');
    toast.success('Template downloaded');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/app')}
              className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Update Site</h1>
              <p className="text-sm text-gray-500">Configure site settings and pages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/app')} 
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4" />
              Update
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Site Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site-name" className="text-gray-700">Site Title</Label>
              <Input
                id="site-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter site title"
                className="border-gray-300"
              />
            </div>
            <div className="flex items-center justify-end gap-4">
              <Label htmlFor="site-status" className="text-gray-700">Active</Label>
              <Switch
                id="site-status"
                checked={status === 'active'}
                onCheckedChange={(checked) => setStatus(checked ? 'active' : 'inactive')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-desc" className="text-gray-700">Site Description</Label>
            <Textarea
              id="site-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this site configuration"
              className="border-gray-300"
              rows={2}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pages" className="space-y-4">
          <TabsList className="bg-gray-100 border border-gray-200">
            <TabsTrigger value="pages" className="data-[state=active]:bg-white">Site Pages</TabsTrigger>
            <TabsTrigger value="segments" className="data-[state=active]:bg-white">Segments</TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-white">Upload Excel</TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-white">Excel Data</TabsTrigger>
            <TabsTrigger value="scraper" className="data-[state=active]:bg-white">Scraper Data</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white">Settings</TabsTrigger>
          </TabsList>

          {/* Site Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAddPage} className="gap-1 bg-green-500 hover:bg-green-600 text-white">
                  <Plus className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1 border-gray-300" 
                  disabled={pages.length === 0}
                  onClick={() => pages.length > 0 && onDeletePage(pages[pages.length - 1].id)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12 text-gray-600">Move</TableHead>
                    <TableHead className="w-20 text-gray-600">Active</TableHead>
                    <TableHead className="w-16 text-gray-600">Index</TableHead>
                    <TableHead className="text-gray-600">URL</TableHead>
                    <TableHead className="w-48 text-gray-600">Match Type</TableHead>
                    <TableHead className="w-40 text-gray-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page, idx) => (
                    <TableRow key={page.id} className="hover:bg-gray-50">
                      <TableCell>
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={page.active}
                          onCheckedChange={(checked) => onUpdatePage(page.id, { active: checked })}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">{idx}</TableCell>
                      <TableCell>
                        <span className="text-blue-600 font-mono text-sm">{page.url}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">
                          {page.matchType === 'exact' ? 'Match with Full URL' : 
                           page.matchType === 'regex' ? 'Match with RegEx' : 'Contains'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            onClick={() => onViewFields(page.id)}
                            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                            title="View Fields"
                          >
                            <List className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditPage(page)}
                            className="h-8 w-8 p-0 bg-yellow-500 hover:bg-yellow-600 text-white"
                            title="Edit Page"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 ml-1">
                            ({page.fieldsCount})
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onDuplicatePage(page.id)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyPage(page)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Form
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handlePastePage}>
                                <Clipboard className="w-4 h-4 mr-2" />
                                Paste Form
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDeletePage(page.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Form
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No pages configured. Click + to add a page.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments">
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Segments allow you to group form fields for organized execution.</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Segment
              </Button>
            </div>
          </TabsContent>

          {/* Upload Excel Tab */}
          <TabsContent value="upload">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Upload Excel/CSV</h3>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                  className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
              </div>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium">Drop Excel/CSV file here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                <Button variant="outline" className="mt-4">Choose File</Button>
              </div>
              {excelData && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 font-medium">
                        <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                        {excelData.fileName || 'Excel file loaded'}
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        {excelData.headers.length} columns, {excelData.rows.length} rows
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onClearExcel}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Excel Data Tab */}
          <TabsContent value="data">
            {excelData && excelData.rows.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12 text-gray-600">#</TableHead>
                        {excelData.headers.map((header, i) => (
                          <TableHead key={i} className="text-gray-600">{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {excelData.rows.slice(0, 50).map((row, rowIdx) => (
                        <TableRow key={rowIdx} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-sm text-gray-500">{rowIdx + 1}</TableCell>
                          {row.map((cell, cellIdx) => (
                            <TableCell key={cellIdx} className="text-gray-700">{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {excelData.rows.length > 50 && (
                  <div className="p-4 bg-gray-50 border-t text-center text-gray-500 text-sm">
                    Showing first 50 of {excelData.rows.length} rows
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No Excel data uploaded yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Scraper Data Tab */}
          <TabsContent value="scraper">
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Scraped data will appear here after running scraper fields.</p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Automation Settings</h3>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label className="text-gray-700">Auto-run on page load</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label className="text-gray-700">Stop on error</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label className="text-gray-700">Retry on error</Label>
                    <Switch />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Timing Settings</h3>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Delay between fields (ms)</Label>
                    <Input type="number" defaultValue="500" className="border-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Delay between rows (ms)</Label>
                    <Input type="number" defaultValue="1000" className="border-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Page Dialog */}
      <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Site Form Page' : '+ Insert Site Form Page'}</DialogTitle>
          </DialogHeader>
          <PageFormDialog 
            page={editingPage} 
            onSave={handleSavePage} 
            onClose={() => setShowPageDialog(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Page Form Dialog Component
const PageFormDialog = ({ 
  page, 
  onSave, 
  onClose 
}: { 
  page: SitePage | null; 
  onSave: (data: Partial<SitePage>) => void; 
  onClose: () => void;
}) => {
  const [url, setUrl] = useState(page?.url || '');
  const [matchType, setMatchType] = useState<SitePage['matchType']>(page?.matchType || 'contains');
  const [description, setDescription] = useState(page?.description || '');
  const [active, setActive] = useState(page?.active ?? true);
  const [delayBefore, setDelayBefore] = useState(page?.delayBefore?.toString() || '');
  const [delayAfter, setDelayAfter] = useState(page?.delayAfter?.toString() || '');

  const handleSubmit = () => {
    onSave({
      url,
      matchType,
      description,
      active,
      delayBefore: delayBefore ? parseInt(delayBefore) : undefined,
      delayAfter: delayAfter ? parseInt(delayAfter) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-gray-700">Page URL</Label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Page URL"
          className="border-gray-300"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Match URL Type</Label>
        <Select value={matchType} onValueChange={(v: SitePage['matchType']) => setMatchType(v)}>
          <SelectTrigger className="border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="exact">Match with Full URL</SelectItem>
            <SelectItem value="regex">Match with RegEx</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
        <p className="text-cyan-700 text-sm">? Do you need help on How to use insert form?</p>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Form Description"
          className="border-gray-300"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={active} onCheckedChange={setActive} />
        <Label className="text-green-600">Active/Inactive</Label>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Delay time before running this form</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={delayBefore}
            onChange={(e) => setDelayBefore(e.target.value)}
            placeholder="Enter Before Timeout in Milliseconds"
            className="border-gray-300 flex-1"
          />
          <Badge className="bg-blue-500 text-white">Milliseconds</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Delay time after running this form</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={delayAfter}
            onChange={(e) => setDelayAfter(e.target.value)}
            placeholder="Enter After Timeout in Milliseconds"
            className="border-gray-300 flex-1"
          />
          <Badge className="bg-blue-500 text-white">Milliseconds</Badge>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} className="bg-green-500 hover:bg-green-600 text-white gap-2">
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button variant="outline" onClick={onClose} className="text-red-600 border-red-300 hover:bg-red-50">
          × Close
        </Button>
      </DialogFooter>
    </div>
  );
};

export default SiteConfig;