import { Plus, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { DataTemplate } from '@/types';
import { useState } from 'react';

interface TemplatesProps {
  templates: DataTemplate[];
}

export const Templates = ({ templates }: TemplatesProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(
    t => t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-10 bg-background"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button size="sm" className="gap-2 gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? 'No templates match your search' : 'No templates created yet'}
          </p>
        </div>
      )}
    </div>
  );
};
