import { FormField } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Trash2, GripVertical } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
  columns?: string[];
}

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'file', label: 'File Upload' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
];

export const FieldEditor = ({ field, onUpdate, onDelete, columns = [] }: FieldEditorProps) => {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors group">
      <div className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1 grid grid-cols-5 gap-3">
        {/* Field Name */}
        <Input
          value={field.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Field name"
          className="bg-background"
        />

        {/* Selector */}
        <Input
          value={field.selector}
          onChange={(e) => onUpdate({ selector: e.target.value })}
          placeholder="CSS Selector"
          className="bg-background font-mono text-sm"
        />

        {/* Type */}
        <Select value={field.type} onValueChange={(value: FormField['type']) => onUpdate({ type: value })}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Column Mapping */}
        <Select 
          value={field.columnIndex?.toString() ?? 'static'} 
          onValueChange={(value) => onUpdate({ columnIndex: value === 'static' ? null : parseInt(value) })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Data source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="static">Static Value</SelectItem>
            {columns.map((col, i) => (
              <SelectItem key={i} value={i.toString()}>
                Col: {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Static Value (if applicable) */}
        <Input
          value={field.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder={field.columnIndex !== null ? 'From Excel' : 'Static value'}
          disabled={field.columnIndex !== null}
          className="bg-background"
        />
      </div>

      {/* Enable/Disable */}
      <Switch
        checked={field.enabled}
        onCheckedChange={(checked) => onUpdate({ enabled: checked })}
      />

      {/* Delete */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
