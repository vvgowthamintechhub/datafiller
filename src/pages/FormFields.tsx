import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, GripVertical, Pencil, List, Trash2, Copy, Code, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { SitePage, FormField, FieldType, SelectorType } from '@/types';
import { fieldTypesList, getFieldTypeInfo } from '@/lib/fieldTypes';
import { cn } from '@/lib/utils';

interface FormFieldsProps {
  page: SitePage | null;
  fields: FormField[];
  excelColumns: string[];
  onAddField: (field: Omit<FormField, 'id'>) => void;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
  onDeleteField: (id: string) => void;
  onBack: () => void;
}

export const FormFields = ({
  page,
  fields,
  excelColumns,
  onAddField,
  onUpdateField,
  onDeleteField,
  onBack,
}: FormFieldsProps) => {
  const navigate = useNavigate();
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showFieldDialog, setShowFieldDialog] = useState(false);

  if (!page) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Page not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleAddField = () => {
    const newIndex = fields.length;
    onAddField({
      pageId: page.id,
      siteId: page.siteId,
      name: 'New Field',
      selectorType: 'selector',
      selectorQuery: '',
      fieldType: 'text',
      value: '',
      columnMapping: null,
      enabled: true,
      runJs: false,
      jsCode: null,
      waitForElement: true,
      executeOnMultiple: false,
      index: newIndex,
      onSuccess: [],
      onError: [],
    });
  };

  const handleEditField = (field: FormField) => {
    setEditingField({ ...field });
    setShowFieldDialog(true);
  };

  const handleSaveField = () => {
    if (editingField) {
      onUpdateField(editingField.id, editingField);
      setShowFieldDialog(false);
      setEditingField(null);
    }
  };

  const getFieldIcon = (type: FieldType) => {
    const info = getFieldTypeInfo(type);
    if (info) {
      const Icon = info.icon;
      return <Icon className="w-4 h-4" />;
    }
    return null;
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
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Form Fields</h1>
              <p className="text-sm text-muted-foreground font-mono">{page.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button className="gap-2 gradient-primary text-primary-foreground">
              <Save className="w-4 h-4" />
              Update
            </Button>
          </div>
        </div>
      </div>

      {/* Page Info Bar */}
      <div className="border-b border-border bg-muted/30 px-6 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Form URL:</span>
            <span className="font-mono text-foreground">{page.url}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Match Type:</span>
            <Badge variant="secondary">{page.matchType}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Active:</span>
            <Badge variant={page.active ? "default" : "secondary"}>{page.active ? 'true' : 'false'}</Badge>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" className="gap-1 bg-success/20 text-success border-success/30 hover:bg-success/30">
              Success
            </Button>
            <Button size="sm" variant="outline" className="gap-1 bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30">
              Error
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-4">
        {/* Fields Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Fields</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1 bg-cyan-600/20 text-cyan-400 border-cyan-600/30 hover:bg-cyan-600/30">
              <FileSpreadsheet className="w-4 h-4" />
              Fetch Field From Excel
            </Button>
            <Select>
              <SelectTrigger className="w-32 bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                <SelectValue placeholder="Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="copy">Copy All</SelectItem>
                <SelectItem value="paste">Paste</SelectItem>
                <SelectItem value="delete">Delete All</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleAddField} className="gap-1 gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Fields Table */}
        <div className="glass rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">Move</TableHead>
                <TableHead className="w-24">Active</TableHead>
                <TableHead className="w-48">Field Name</TableHead>
                <TableHead className="w-32">Selector Type</TableHead>
                <TableHead>Selector Query</TableHead>
                <TableHead className="w-20">Run JS</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id} className="hover:bg-muted/30">
                  <TableCell>
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.enabled}
                        onCheckedChange={(checked) => onUpdateField(field.id, { enabled: checked })}
                      />
                      <span className="text-muted-foreground">
                        {getFieldIcon(field.fieldType)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => handleEditField(field)}
                      className="text-primary hover:underline text-left"
                    >
                      {field.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={field.selectorType}
                      onValueChange={(value: SelectorType) => onUpdateField(field.id, { selectorType: value })}
                    >
                      <SelectTrigger className="bg-background h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xpath">XPath</SelectItem>
                        <SelectItem value="selector">Selector</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="id">ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input
                        value={field.selectorQuery}
                        onChange={(e) => onUpdateField(field.id, { selectorQuery: e.target.value })}
                        className="bg-background font-mono text-sm h-8"
                        placeholder="Enter selector..."
                      />
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={field.runJs}
                      onCheckedChange={(checked) => onUpdateField(field.id, { runJs: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditField(field)}
                        className="h-8 w-8 p-0 text-warning"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {fields.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No fields configured. Click + to add a field.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Field Edit Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
          </DialogHeader>
          {editingField && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field Name</Label>
                  <Input
                    value={editingField.name}
                    onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={editingField.fieldType}
                    onValueChange={(value: FieldType) => setEditingField({ ...editingField, fieldType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypesList.map((ft) => (
                        <SelectItem key={ft.type} value={ft.type}>
                          <div className="flex items-center gap-2">
                            <ft.icon className="w-4 h-4" />
                            {ft.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Selector Type</Label>
                  <Select
                    value={editingField.selectorType}
                    onValueChange={(value: SelectorType) => setEditingField({ ...editingField, selectorType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xpath">XPath</SelectItem>
                      <SelectItem value="selector">CSS Selector</SelectItem>
                      <SelectItem value="name">Name Attribute</SelectItem>
                      <SelectItem value="id">ID Attribute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Column Mapping</Label>
                  <Select
                    value={editingField.columnMapping || 'none'}
                    onValueChange={(value) => setEditingField({ ...editingField, columnMapping: value === 'none' ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No mapping (static)</SelectItem>
                      {excelColumns.map((col) => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selector Query</Label>
                <Input
                  value={editingField.selectorQuery}
                  onChange={(e) => setEditingField({ ...editingField, selectorQuery: e.target.value })}
                  className="font-mono"
                  placeholder="e.g., #email-input or //input[@name='email']"
                />
              </div>

              <div className="space-y-2">
                <Label>Value (or use {'{$column_name$}'} for Excel data)</Label>
                <Input
                  value={editingField.value}
                  onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                  placeholder="Static value or {$column$}"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <Label>Run JavaScript</Label>
                  <Switch
                    checked={editingField.runJs}
                    onCheckedChange={(checked) => setEditingField({ ...editingField, runJs: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <Label>Wait for element</Label>
                  <Switch
                    checked={editingField.waitForElement}
                    onCheckedChange={(checked) => setEditingField({ ...editingField, waitForElement: checked })}
                  />
                </div>
              </div>

              {editingField.runJs && (
                <div className="space-y-2">
                  <Label>JavaScript Code</Label>
                  <Textarea
                    value={editingField.jsCode || ''}
                    onChange={(e) => setEditingField({ ...editingField, jsCode: e.target.value })}
                    className="font-mono text-sm"
                    rows={4}
                    placeholder="// Your JavaScript code here"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveField} className="gradient-primary text-primary-foreground">
              Save Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormFields;
