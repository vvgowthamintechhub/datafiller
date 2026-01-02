import { Globe, Play, Settings, Trash2, ExternalLink } from 'lucide-react';
import { Site } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface SiteCardProps {
  site: Site;
  onRun?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SiteCard = ({ site, onRun, onEdit, onDelete }: SiteCardProps) => {
  const statusColors = {
    active: 'bg-success',
    inactive: 'bg-muted-foreground',
    error: 'bg-destructive',
  };

  return (
    <div className="glass rounded-xl p-5 animate-slide-up hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-muted">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {site.name}
            </h3>
            <a 
              href={site.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
            >
              {site.url.slice(0, 40)}...
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", statusColors[site.status])} />
          <span className="text-xs text-muted-foreground capitalize">{site.status}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">{site.fieldsCount}</span> fields
        </div>
        <div>
          Last run: {site.lastRun 
            ? formatDistanceToNow(site.lastRun, { addSuffix: true }) 
            : 'Never'}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={onRun}
            className="gap-1.5 gradient-primary text-primary-foreground"
          >
            <Play className="w-3.5 h-3.5" />
            Run
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Configure
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
