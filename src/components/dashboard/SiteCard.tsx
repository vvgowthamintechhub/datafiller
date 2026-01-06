import { Globe, Play, Settings, Trash2, Copy, Archive, Pencil, MoreVertical } from 'lucide-react';
import { Site } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface SiteCardProps {
  site: Site;
  pagesCount?: number;
  fieldsCount?: number;
  lastRun?: Date | null;
  onRun?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
}

export const SiteCard = ({ 
  site, 
  pagesCount = 0,
  fieldsCount = 0, 
  lastRun,
  onRun, 
  onEdit, 
  onDelete,
  onDuplicate,
  onArchive
}: SiteCardProps) => {
  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(site.id);
    toast.success('Site ID copied to clipboard');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{site.name}</h3>
          {site.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{site.description}</p>
          )}
          <p className="text-xs text-blue-500 mt-2">
            {format(new Date(site.createdAt), 'dd-MM-yyyy hh:mm a')}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", statusColors[site.status])} />
          <span className="text-xs text-gray-500 capitalize">{site.status}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span><span className="font-medium text-gray-700">{pagesCount}</span> pages</span>
          <span><span className="font-medium text-gray-700">{fieldsCount}</span> fields</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Edit - Green */}
          <Button
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white"
            title="Edit Site"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          {/* Duplicate - Yellow */}
          <Button
            size="sm"
            onClick={onDuplicate}
            className="h-8 w-8 p-0 bg-yellow-500 hover:bg-yellow-600 text-white"
            title="Duplicate Site"
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          {/* Copy ID - Blue */}
          <Button
            size="sm"
            onClick={handleCopyId}
            className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
            title="Copy Site ID"
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          {/* Archive - Yellow/Orange */}
          <Button
            size="sm"
            onClick={onArchive}
            className="h-8 w-8 p-0 bg-amber-500 hover:bg-amber-600 text-white"
            title="Move to Archive"
          >
            <Archive className="w-4 h-4" />
          </Button>
          
          {/* Delete - Red */}
          <Button
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white"
            title="Delete Site"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};