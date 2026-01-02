import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteCard } from '@/components/dashboard/SiteCard';
import { AddSiteDialog } from '@/components/sites/AddSiteDialog';
import { Site } from '@/types';

interface SitesProps {
  sites: Site[];
  onAddSite: (site: Omit<Site, 'id' | 'createdAt'>) => void;
  onRunSite: (id: string) => void;
  onEditSite: (id: string) => void;
  onDeleteSite: (id: string) => void;
}

export const Sites = ({ sites, onAddSite, onRunSite, onEditSite, onDeleteSite }: SitesProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = sites.filter(
    site => 
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.url.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Search sites..."
            className="pl-10 bg-background"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button 
            onClick={() => setAddDialogOpen(true)} 
            size="sm" 
            className="gap-2 gradient-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Add Site
          </Button>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSites.map((site) => (
          <SiteCard
            key={site.id}
            site={site}
            onRun={() => onRunSite(site.id)}
            onEdit={() => onEditSite(site.id)}
            onDelete={() => onDeleteSite(site.id)}
          />
        ))}
      </div>

      {filteredSites.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? 'No sites match your search' : 'No sites configured yet'}
          </p>
        </div>
      )}

      <AddSiteDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={onAddSite}
      />
    </div>
  );
};
