import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, GripVertical, Pencil, Trash2, Copy, Clipboard, FileSpreadsheet, ChevronDown, List, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SitePage, FormField, FieldType, SelectorType } from '@/types';
import { fieldTypesList, getFieldTypeInfo } from '@/lib/fieldTypes';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FormFieldsProps {
  page: SitePage | null;
  fields: FormField[];
  excelColumns: string[];
  onAddField: (field: Omit<FormField, 'id'>) => void;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
  onDeleteField: (id: string) => void;
  onBack: () => void;
}

// Clipboard for field copy/paste
let copiedFields: FormField[] = [];

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
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  if (!page) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Page not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleAddField = () => {
    setEditingField(null);
    setShowFieldDialog(true);
  };

  const handleEditField = (field: FormField) => {
    setEditingField({ ...field });
    setShowFieldDialog(true);
  };

  const handleSaveField = (fieldData: Partial<FormField>) => {
    if (editingField) {
      onUpdateField(editingField.id, fieldData);
      toast.success('Field updated');
    } else {
      const newIndex = fields.length;
      onAddField({
        pageId: page.id,
        siteId: page.siteId,
        name: fieldData.name || 'New Field',
        selectorType: fieldData.selectorType || 'selector',
        selectorQuery: fieldData.selectorQuery || '',
        fieldType: fieldData.fieldType || 'text',
        value: fieldData.value || '',
        columnMapping: fieldData.columnMapping || null,
        enabled: fieldData.enabled ?? true,
        runJs: fieldData.runJs ?? false,
        jsCode: fieldData.jsCode || null,
        waitForElement: fieldData.waitForElement ?? true,
        executeOnMultiple: fieldData.executeOnMultiple ?? false,
        index: newIndex,
        onSuccess: [],
        onError: [],
        ...fieldData,
      });
      toast.success('Field added');
    }
    setShowFieldDialog(false);
    setEditingField(null);
  };

  const handleDeleteField = (id: string) => {
    onDeleteField(id);
    toast.success('Field deleted');
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedFields(new Set(fields.map(f => f.id)));
    } else {
      setSelectedFields(new Set());
    }
  };

  const handleSelectField = (fieldId: string, checked: boolean) => {
    const newSelected = new Set(selectedFields);
    if (checked) {
      newSelected.add(fieldId);
    } else {
      newSelected.delete(fieldId);
    }
    setSelectedFields(newSelected);
    setSelectAll(newSelected.size === fields.length);
  };

  const handleCopySelected = () => {
    copiedFields = fields.filter(f => selectedFields.has(f.id));
    toast.success(`${copiedFields.length} fields copied`);
  };

  const handlePasteFields = () => {
    if (copiedFields.length === 0) {
      toast.error('No fields copied');
      return;
    }
    copiedFields.forEach((field, idx) => {
      const { id, ...fieldWithoutId } = field;
      onAddField({
        ...fieldWithoutId,
        pageId: page.id,
        siteId: page.siteId,
        index: fields.length + idx,
      });
    });
    toast.success(`${copiedFields.length} fields pasted`);
  };

  const handleDeleteSelected = () => {
    selectedFields.forEach(id => onDeleteField(id));
    setSelectedFields(new Set());
    setSelectAll(false);
    toast.success('Selected fields deleted');
  };

  const handleFetchFromExcel = () => {
    if (excelColumns.length === 0) {
      toast.error('No Excel data uploaded. Please upload Excel first.');
      return;
    }
    excelColumns.forEach((col, idx) => {
      onAddField({
        pageId: page.id,
        siteId: page.siteId,
        name: col,
        selectorType: 'selector',
        selectorQuery: '',
        fieldType: 'text',
        value: `{$${col}$}`,
        columnMapping: col,
        enabled: true,
        runJs: false,
        jsCode: null,
        waitForElement: true,
        executeOnMultiple: false,
        index: fields.length + idx,
        onSuccess: [],
        onError: [],
      });
    });
    toast.success(`${excelColumns.length} fields created from Excel columns`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">({fields.length}) Form Field</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack} className="text-blue-600 border-blue-300 hover:bg-blue-50">
              ← Back
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4" />
              Update
            </Button>
          </div>
        </div>
      </div>

      {/* Page Info Bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-gray-600">Form URL</TableCell>
              <TableCell className="font-medium text-gray-600">Match Type</TableCell>
              <TableCell className="font-medium text-gray-600">Active</TableCell>
              <TableCell className="font-medium text-gray-600">Response</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-blue-600 font-mono">{page.url}</TableCell>
              <TableCell>{page.matchType === 'exact' ? 'Match with Full URL' : page.matchType === 'regex' ? 'Match with RegEx' : 'Contains'}</TableCell>
              <TableCell>{page.active ? 'true' : 'false'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white text-xs">
                    ⚙ Success
                  </Button>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white text-xs">
                    ⚙ Error
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-4">
        {/* Fields Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">≡ Fields</h2>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleFetchFromExcel}
              className="gap-1 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Fetch Field From Excel
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white">
                  ⚙ Actions
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleCopySelected} disabled={selectedFields.size === 0}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePasteFields}>
                  <Clipboard className="w-4 h-4 mr-2" />
                  Paste Fields
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteSelected} disabled={selectedFields.size === 0} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handlePasteFields}
              className="border-blue-300 text-blue-600"
            >
              <Clipboard className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              onClick={handleAddField} 
              className="gap-1 bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Fields Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-12 text-gray-600">Move</TableHead>
                <TableHead className="w-24 text-gray-600">Active</TableHead>
                <TableHead className="w-48 text-gray-600">Field Name</TableHead>
                <TableHead className="w-32 text-gray-600">Selector Type</TableHead>
                <TableHead className="text-gray-600">Selector Query</TableHead>
                <TableHead className="w-24 text-gray-600">Wait (ms)</TableHead>
                <TableHead className="w-20 text-gray-600">Run JS</TableHead>
                <TableHead className="w-32 text-gray-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox 
                      checked={selectedFields.has(field.id)}
                      onCheckedChange={(checked) => handleSelectField(field.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.enabled}
                        onCheckedChange={(checked) => onUpdateField(field.id, { enabled: checked })}
                      />
                      <span className="text-gray-400">
                        {getFieldIcon(field.fieldType)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => handleEditField(field)}
                      className="text-blue-600 hover:underline text-left"
                    >
                      {field.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={field.selectorType}
                      onValueChange={(value: SelectorType) => onUpdateField(field.id, { selectorType: value })}
                    >
                      <SelectTrigger className="h-8 border-gray-300">
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
                        className="font-mono text-sm h-8 border-gray-300"
                        placeholder="Enter selector..."
                      />
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(field.selectorQuery);
                          toast.success('Selector copied');
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={field.waitTimeout || ''}
                      onChange={(e) => onUpdateField(field.id, { waitTimeout: parseInt(e.target.value) || undefined })}
                      className="h-8 w-20 border-gray-300"
                      placeholder="0"
                    />
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
                        onClick={() => handleEditField(field)}
                        className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        title="Edit Field"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteField(field.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {fields.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl text-gray-300 mb-2">≡ Q</div>
                      <p className="text-red-500 font-medium text-lg">Not Found</p>
                      <p className="text-gray-500 mt-1">Field Data Not Available, Please Insert a New Field.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Field Edit Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit Field' : '+ Insert Field'}</DialogTitle>
          </DialogHeader>
          <FieldFormDialog
            field={editingField}
            excelColumns={excelColumns}
            onSave={handleSaveField}
            onClose={() => setShowFieldDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Field Form Dialog Component
const FieldFormDialog = ({
  field,
  excelColumns,
  onSave,
  onClose,
}: {
  field: FormField | null;
  excelColumns: string[];
  onSave: (data: Partial<FormField>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<FormField>>({
    name: field?.name || '',
    fieldType: field?.fieldType || 'text',
    selectorType: field?.selectorType || 'selector',
    selectorQuery: field?.selectorQuery || '',
    value: field?.value || '',
    columnMapping: field?.columnMapping || null,
    enabled: field?.enabled ?? true,
    runJs: field?.runJs ?? false,
    jsCode: field?.jsCode || '',
    waitForElement: field?.waitForElement ?? true,
    waitForVisible: field?.waitForVisible ?? true,
    executeOnMultiple: field?.executeOnMultiple ?? false,
    typeAsTyping: field?.typeAsTyping ?? false,
    removeAspxBehavior: field?.removeAspxBehavior ?? false,
    clearBeforeFill: field?.clearBeforeFill ?? false,
    defaultValue: field?.defaultValue || '',
    takeFromColumn: field?.takeFromColumn || '',
    pasteCopiedValue: field?.pasteCopiedValue ?? false,
    childSelector: field?.childSelector || '',
    triggerJsEvent: field?.triggerJsEvent ?? false,
    jsEvents: field?.jsEvents || [],
    triggerMouseEvent: field?.triggerMouseEvent ?? false,
    fillAfterThis: field?.fillAfterThis || '',
    skipIfConditionTrue: field?.skipIfConditionTrue ?? false,
    skipCondition: field?.skipCondition || '',
    waitForResponseChange: field?.waitForResponseChange ?? false,
    waitForRequestMonitor: field?.waitForRequestMonitor ?? false,
    matchThenFill: field?.matchThenFill ?? false,
    matchValue: field?.matchValue || '',
    skipIfFieldMatches: field?.skipIfFieldMatches ?? false,
    skipMatchValue: field?.skipMatchValue || '',
    isRequired: field?.isRequired ?? false,
    successResponseAction: field?.successResponseAction || '',
    errorResponseAction: field?.errorResponseAction || '',
    skipResponseAction: field?.skipResponseAction || '',
    stopOnError: field?.stopOnError ?? false,
    stopOnSuccess: field?.stopOnSuccess ?? false,
    searchAndExecute: field?.searchAndExecute ?? false,
    executeAsRowType: field?.executeAsRowType ?? false,
    loopMultipleElements: field?.loopMultipleElements ?? false,
    skipStatusColor: field?.skipStatusColor ?? false,
    ignoreInExcel: field?.ignoreInExcel ?? false,
    delayBefore: field?.delayBefore,
    delayAfter: field?.delayAfter,
    position: field?.position,
  });

  const [jsEventInput, setJsEventInput] = useState('');

  const handleAddJsEvent = (event: string) => {
    if (event && !formData.jsEvents?.includes(event)) {
      setFormData({ ...formData, jsEvents: [...(formData.jsEvents || []), event] });
    }
    setJsEventInput('');
  };

  const handleRemoveJsEvent = (event: string) => {
    setFormData({ ...formData, jsEvents: formData.jsEvents?.filter(e => e !== event) || [] });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const ToggleOption = ({ label, value, onChange, highlight }: { label: string; value: boolean; onChange: (v: boolean) => void; highlight?: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Switch checked={value} onCheckedChange={onChange} />
        <span className="text-gray-700 text-sm">{label}</span>
        {highlight && <span className="text-red-500 font-medium">{highlight}</span>}
      </div>
    </div>
  );

  return (
    <ScrollArea className="h-[70vh] pr-4">
      <div className="space-y-4">
        {/* Field Name */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Field Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter field name"
            className="border-gray-300"
          />
        </div>

        {/* Field Type */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Field Type</Label>
          <Select
            value={formData.fieldType}
            onValueChange={(value: FieldType) => setFormData({ ...formData, fieldType: value })}
          >
            <SelectTrigger className="border-gray-300">
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

        {/* Toggle Options */}
        <div className="space-y-1 bg-gray-50 rounded-lg p-4">
          <ToggleOption 
            label="Fill the values like a typing tutor" 
            value={formData.typeAsTyping || false}
            onChange={(v) => setFormData({ ...formData, typeAsTyping: v })}
          />
          <ToggleOption 
            label="If Form is ASPX then Remove Input Behavior" 
            value={formData.removeAspxBehavior || false}
            onChange={(v) => setFormData({ ...formData, removeAspxBehavior: v })}
          />
          <ToggleOption 
            label="Before filling the value in the field, clear the value of the field" 
            value={formData.clearBeforeFill || false}
            onChange={(v) => setFormData({ ...formData, clearBeforeFill: v })}
          />
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Switch 
                checked={!!formData.defaultValue}
                onCheckedChange={(v) => setFormData({ ...formData, defaultValue: v ? formData.defaultValue || '' : '' })}
              />
              <span className="text-gray-700 text-sm">If excel column value is empty then fill this</span>
              {formData.defaultValue !== undefined && formData.defaultValue !== '' && (
                <Input
                  value={formData.defaultValue}
                  onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  placeholder="default value"
                  className="w-32 h-6 text-xs border-gray-300 text-red-500"
                />
              )}
            </div>
          </div>
          <ToggleOption 
            label="Take the value of this field from another excel column" 
            value={!!formData.takeFromColumn}
            onChange={(v) => setFormData({ ...formData, takeFromColumn: v ? '' : undefined })}
          />
          <ToggleOption 
            label="Replace the field value according to the custom values" 
            value={formData.replaceWithCustom || false}
            onChange={(v) => setFormData({ ...formData, replaceWithCustom: v })}
          />
          <ToggleOption 
            label="Paste Copied Value" 
            value={formData.pasteCopiedValue || false}
            onChange={(v) => setFormData({ ...formData, pasteCopiedValue: v })}
          />
          <ToggleOption 
            label="Selector Query of Element's Child Element" 
            value={!!formData.childSelector}
            onChange={(v) => setFormData({ ...formData, childSelector: v ? '' : undefined })}
          />
          <ToggleOption 
            label="Wait until element is found in the page." 
            value={formData.waitForElement || false}
            onChange={(v) => setFormData({ ...formData, waitForElement: v })}
          />
          <ToggleOption 
            label="Wait until element is visible in the page." 
            value={formData.waitForVisible || false}
            onChange={(v) => setFormData({ ...formData, waitForVisible: v })}
          />
          
          {/* Trigger Javascript Event with tags */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-1">
              <Switch 
                checked={formData.triggerJsEvent || false}
                onCheckedChange={(v) => setFormData({ ...formData, triggerJsEvent: v })}
              />
              <span className="text-gray-700 text-sm">Trigger Javascript Event</span>
            </div>
          </div>
          {formData.triggerJsEvent && (
            <div className="pl-8 py-2">
              <div className="flex flex-wrap gap-1 mb-2">
                {formData.jsEvents?.map((event) => (
                  <Badge key={event} className="bg-yellow-500 text-white gap-1">
                    {event}
                    <button onClick={() => handleRemoveJsEvent(event)} className="ml-1">×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={jsEventInput}
                  onChange={(e) => setJsEventInput(e.target.value)}
                  placeholder="Add event..."
                  className="h-7 text-sm border-gray-300"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddJsEvent(jsEventInput)}
                />
                <Button size="sm" variant="outline" onClick={() => handleAddJsEvent('change')}>change</Button>
                <Button size="sm" variant="outline" onClick={() => handleAddJsEvent('focus')}>focus</Button>
                <Button size="sm" variant="outline" onClick={() => handleAddJsEvent('blur')}>blur</Button>
              </div>
            </div>
          )}
          
          <ToggleOption 
            label="Trigger Javascript Mouse Event" 
            value={formData.triggerMouseEvent || false}
            onChange={(v) => setFormData({ ...formData, triggerMouseEvent: v })}
          />
          <ToggleOption 
            label="After filling the data of this field, filling the data of another field" 
            value={!!formData.fillAfterThis}
            onChange={(v) => setFormData({ ...formData, fillAfterThis: v ? '' : undefined })}
          />
          <ToggleOption 
            label="Skip field action if any condition is true" 
            value={formData.skipIfConditionTrue || false}
            onChange={(v) => setFormData({ ...formData, skipIfConditionTrue: v })}
          />
          <ToggleOption 
            label="Wait until the response status of the given element change fields comes" 
            value={formData.waitForResponseChange || false}
            onChange={(v) => setFormData({ ...formData, waitForResponseChange: v })}
          />
          <ToggleOption 
            label="Wait until the response status of the given request monitor fields comes" 
            value={formData.waitForRequestMonitor || false}
            onChange={(v) => setFormData({ ...formData, waitForRequestMonitor: v })}
          />
          <ToggleOption 
            label="If element value matches then fill the value otherwise skip the field" 
            value={formData.matchThenFill || false}
            onChange={(v) => setFormData({ ...formData, matchThenFill: v })}
          />
          <ToggleOption 
            label="Skip field action if field value matches" 
            value={formData.skipIfFieldMatches || false}
            onChange={(v) => setFormData({ ...formData, skipIfFieldMatches: v })}
          />
          <ToggleOption 
            label="Skip field action if condition is true" 
            value={formData.skipIfConditionTrue || false}
            onChange={(v) => setFormData({ ...formData, skipIfConditionTrue: v })}
          />
          <ToggleOption 
            label="Skip field action if given field value matches" 
            value={formData.skipIfFieldMatches || false}
            onChange={(v) => setFormData({ ...formData, skipIfFieldMatches: v })}
          />
          <ToggleOption 
            label="Is this field"
            highlight="Required"
            value={formData.isRequired || false}
            onChange={(v) => setFormData({ ...formData, isRequired: v })}
          />
          <ToggleOption 
            label="Field Success Response Action" 
            value={!!formData.successResponseAction}
            onChange={(v) => setFormData({ ...formData, successResponseAction: v ? '' : undefined })}
          />
          <ToggleOption 
            label="Field Error Response Action" 
            value={!!formData.errorResponseAction}
            onChange={(v) => setFormData({ ...formData, errorResponseAction: v ? '' : undefined })}
          />
          <ToggleOption 
            label="Field Skip Response Action" 
            value={!!formData.skipResponseAction}
            onChange={(v) => setFormData({ ...formData, skipResponseAction: v ? '' : undefined })}
          />
          <ToggleOption 
            label="If error response is coming in the field then stop filler" 
            value={formData.stopOnError || false}
            onChange={(v) => setFormData({ ...formData, stopOnError: v })}
          />
          <ToggleOption 
            label="If success response is coming in the field then stop filler" 
            value={formData.stopOnSuccess || false}
            onChange={(v) => setFormData({ ...formData, stopOnSuccess: v })}
          />
          <ToggleOption 
            label="Search Strings and Execute Field Action" 
            value={formData.searchAndExecute || false}
            onChange={(v) => setFormData({ ...formData, searchAndExecute: v })}
          />
          <ToggleOption 
            label="Execute Action on fields like Row Type" 
            value={formData.executeAsRowType || false}
            onChange={(v) => setFormData({ ...formData, executeAsRowType: v })}
          />
          <ToggleOption 
            label="If this field is being used in a loop and the field has multiple elements" 
            value={formData.loopMultipleElements || false}
            onChange={(v) => setFormData({ ...formData, loopMultipleElements: v })}
          />
          <ToggleOption 
            label="Do not fill the Status Color, element of this field" 
            value={formData.skipStatusColor || false}
            onChange={(v) => setFormData({ ...formData, skipStatusColor: v })}
          />
          <ToggleOption 
            label="Ignore this field details in the Excel Template" 
            value={formData.ignoreInExcel || false}
            onChange={(v) => setFormData({ ...formData, ignoreInExcel: v })}
          />
        </div>

        {/* Delay Time Before */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Delay Time Before this field is Run</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={formData.delayBefore || ''}
              onChange={(e) => setFormData({ ...formData, delayBefore: parseInt(e.target.value) || undefined })}
              placeholder="Enter Before Timeout in Milliseconds"
              className="flex-1 border-gray-300"
            />
            <Badge className="bg-blue-500 text-white">Milliseconds</Badge>
          </div>
        </div>

        {/* Delay Time After */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Delay Time After this field is Run</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={formData.delayAfter || ''}
              onChange={(e) => setFormData({ ...formData, delayAfter: parseInt(e.target.value) || undefined })}
              placeholder="Enter After Timeout in Milliseconds"
              className="flex-1 border-gray-300"
            />
            <Badge className="bg-blue-500 text-white">Milliseconds</Badge>
          </div>
        </div>

        {/* Position of Field */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Position of Field</Label>
          <Select
            value={formData.position?.toString() || ''}
            onValueChange={(value) => setFormData({ ...formData, position: parseInt(value) || undefined })}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Select Position of Field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selector */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Selector Type</Label>
            <Select
              value={formData.selectorType}
              onValueChange={(value: SelectorType) => setFormData({ ...formData, selectorType: value })}
            >
              <SelectTrigger className="border-gray-300">
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
            <Label className="text-gray-700 font-medium">Column Mapping</Label>
            <Select
              value={formData.columnMapping || 'none'}
              onValueChange={(value) => setFormData({ ...formData, columnMapping: value === 'none' ? null : value })}
            >
              <SelectTrigger className="border-gray-300">
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
          <Label className="text-gray-700 font-medium">Selector Query</Label>
          <Input
            value={formData.selectorQuery}
            onChange={(e) => setFormData({ ...formData, selectorQuery: e.target.value })}
            className="font-mono border-gray-300"
            placeholder="e.g., #email-input or //input[@name='email']"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Value (or use {'{$column_name$}'} for Excel data)</Label>
          <Input
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="Static value or {$column$}"
            className="border-gray-300"
          />
        </div>

        {/* Run JS */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
          <Label className="text-gray-700">Run JavaScript</Label>
          <Switch
            checked={formData.runJs}
            onCheckedChange={(checked) => setFormData({ ...formData, runJs: checked })}
          />
        </div>

        {formData.runJs && (
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">JavaScript Code</Label>
            <Textarea
              value={formData.jsCode || ''}
              onChange={(e) => setFormData({ ...formData, jsCode: e.target.value })}
              className="font-mono text-sm border-gray-300"
              rows={4}
              placeholder="// Your JavaScript code here"
            />
          </div>
        )}
      </div>

      <DialogFooter className="mt-6 sticky bottom-0 bg-white pt-4 border-t">
        <Button onClick={handleSubmit} className="bg-green-500 hover:bg-green-600 text-white gap-2">
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button variant="outline" onClick={onClose} className="text-red-600 border-red-300 hover:bg-red-50">
          × Close
        </Button>
      </DialogFooter>
    </ScrollArea>
  );
};

export default FormFields;