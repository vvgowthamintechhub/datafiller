import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Plus } from 'lucide-react';

interface AddSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (site: { name: string; url: string; status: 'active' | 'inactive'; fieldsCount: number; lastRun: null }) => void;
}

export const AddSiteDialog = ({ open, onOpenChange, onAdd }: AddSiteDialogProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      onAdd({
        name,
        url: url.startsWith('http') ? url : `https://${url}`,
        status: 'inactive',
        fieldsCount: 0,
        lastRun: null,
      });
      setName('');
      setUrl('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-primary">
              <Globe className="w-4 h-4 text-primary-foreground" />
            </div>
            Add New Site
          </DialogTitle>
          <DialogDescription>
            Add a website to configure form auto-filling
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Google Forms - Survey"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/form"
              className="bg-background"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2 gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4" />
              Add Site
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
