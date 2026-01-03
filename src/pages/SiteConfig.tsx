import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Minus, GripVertical, Pencil, List, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Site, SitePage } from '@/types';
import { cn } from '@/lib/utils';

interface SiteConfigProps {
  site: Site | null;
  pages: SitePage[];
  onUpdateSite: (id: string, updates: Partial<Site>) => void;
  onAddPage: (page: Omit<SitePage, 'id'>) => void;
  onUpdatePage: (id: string, updates: Partial<SitePage>) => void;
  onDeletePage: (id: string) => void;
  onViewFields: (pageId: string) => void;
}

export const SiteConfig = ({
  site,
  pages,
  onUpdateSite,
  onAddPage,
  onUpdatePage,
  onDeletePage,
  onViewFields,
}: SiteConfigProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState(site?.name || '');
  const [description, setDescription] = useState(site?.description || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(site?.status || 'active');

  if (!site) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Site not found</p>
        <Button variant="outline" onClick={() => navigate('/app')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    onUpdateSite(site.id, { name, description, status });
  };

  const handleAddPage = () => {
    const newIndex = pages.length;
    onAddPage({
      siteId: site.id,
      url: 'https://example.com/form',
      matchType: 'contains',
      index: newIndex,
      active: true,
      fieldsCount: 0,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/app')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Update Site</h1>
              <p className="text-sm text-muted-foreground">Configure site settings and pages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/app')} className="text-destructive border-destructive hover:bg-destructive/10">
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2 gradient-primary text-primary-foreground">
              <Save className="w-4 h-4" />
              Update
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Site Details */}
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Title</Label>
              <Input
                id="site-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter site title"
                className="bg-background"
              />
            </div>
            <div className="flex items-center justify-end gap-4">
              <Label htmlFor="site-status">Active</Label>
              <Switch
                id="site-status"
                checked={status === 'active'}
                onCheckedChange={(checked) => setStatus(checked ? 'active' : 'inactive')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-desc">Site Description</Label>
            <Textarea
              id="site-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this site configuration"
              className="bg-background"
              rows={2}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pages" className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="pages">Site Pages</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="upload">Upload Excel</TabsTrigger>
            <TabsTrigger value="data">Excel Data</TabsTrigger>
            <TabsTrigger value="scraper">Scraper Data</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Site Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAddPage} className="gap-1 gradient-primary text-primary-foreground">
                  <Plus className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="gap-1" disabled={pages.length === 0}>
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="glass rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">Move</TableHead>
                    <TableHead className="w-20">Active</TableHead>
                    <TableHead className="w-16">Index</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-40">Match Type</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page, idx) => (
                    <TableRow key={page.id} className="hover:bg-muted/30">
                      <TableCell>
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={page.active}
                          onCheckedChange={(checked) => onUpdatePage(page.id, { active: checked })}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{idx}</TableCell>
                      <TableCell>
                        <Input
                          value={page.url}
                          onChange={(e) => onUpdatePage(page.id, { url: e.target.value })}
                          className="bg-background font-mono text-sm"
                          placeholder="https://example.com/.*"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={page.matchType}
                          onValueChange={(value: SitePage['matchType']) => onUpdatePage(page.id, { matchType: value })}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regex">Match with RegEx</SelectItem>
                            <SelectItem value="exact">Exact Match</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewFields(page.id)}
                            className="h-8 w-8 p-0"
                          >
                            <List className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/sites/${site.id}/pages/${page.id}`)}
                            className="h-8 w-8 p-0 text-warning"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Badge variant="secondary" className="ml-1">
                            ({page.fieldsCount})
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-muted-foreground">Segments allow you to group form fields for organized execution.</p>
              <Button className="mt-4 gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Segment
              </Button>
            </div>
          </TabsContent>

          {/* Upload Excel Tab */}
          <TabsContent value="upload">
            <div className="glass rounded-xl p-12 text-center border-2 border-dashed border-border">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-medium">Drop Excel/CSV file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <Button variant="outline">Choose File</Button>
              </div>
            </div>
          </TabsContent>

          {/* Excel Data Tab */}
          <TabsContent value="data">
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-muted-foreground">No Excel data uploaded yet.</p>
            </div>
          </TabsContent>

          {/* Scraper Data Tab */}
          <TabsContent value="scraper">
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-muted-foreground">Scraped data will appear here after running scraper fields.</p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="glass rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Automation Settings</h3>
                  <div className="flex items-center justify-between">
                    <Label>Auto-run on page load</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Stop on error</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Retry on error</Label>
                    <Switch />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Timing Settings</h3>
                  <div className="space-y-2">
                    <Label>Delay between fields (ms)</Label>
                    <Input type="number" defaultValue="500" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>Delay between rows (ms)</Label>
                    <Input type="number" defaultValue="1000" className="bg-background" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiteConfig;
