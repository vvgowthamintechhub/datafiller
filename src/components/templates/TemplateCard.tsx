import { DataTemplate } from '@/types';
import { FileSpreadsheet, Download, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface TemplateCardProps {
  template: DataTemplate;
  onEdit?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

export const TemplateCard = ({ template, onEdit, onDelete, onExport }: TemplateCardProps) => {
  return (
    <div className="glass rounded-xl p-5 animate-slide-up hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg gradient-accent">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {template.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {template.columns.slice(0, 4).map((col, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {col}
          </Badge>
        ))}
        {template.columns.length > 4 && (
          <Badge variant="outline" className="text-xs">
            +{template.columns.length - 4} more
          </Badge>
        )}
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">{template.rowCount}</span> rows
        </div>
        <div>
          Created {formatDistanceToNow(template.createdAt, { addSuffix: true })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onExport} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
