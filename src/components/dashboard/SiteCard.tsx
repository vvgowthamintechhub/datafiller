import { Globe, Play, Settings, Trash2, ExternalLink, Copy } from 'lucide-react';
import { Site, SitePage } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface SiteCardProps {
  site: Site;
  pagesCount?: number;
  fieldsCount?: number;
  lastRun?: Date | null;
  onRun?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const SiteCard = ({ 
  site, 
  pagesCount = 0,
  fieldsCount = 0, 
  lastRun,
  onRun, 
  onEdit, 
  onDelete,
  onDuplicate 
}: SiteCardProps) => {
  const statusColors = {
    active: 'bg-success',
    inactive: 'bg-muted-foreground',
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
            {site.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {site.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", statusColors[site.status])} />
          <span className="text-xs text-muted-foreground capitalize">{site.status}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">{pagesCount}</span> pages
        </div>
        <div>
          <span className="font-medium text-foreground">{fieldsCount}</span> fields
        </div>
        <div>
          Last run: {lastRun 
            ? formatDistanceToNow(lastRun, { addSuffix: true }) 
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
        <div className="flex items-center gap-1">
          {onDuplicate && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onDuplicate}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-4 h-4" />
            </Button>
          )}
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
    </div>
  );
};
