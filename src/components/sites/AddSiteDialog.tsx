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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Globe, Plus } from 'lucide-react';
import { Site } from '@/types';

interface AddSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (site: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AddSiteDialog = ({ open, onOpenChange, onAdd }: AddSiteDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      description: description.trim(),
      status,
    });

    setName('');
    setDescription('');
    setStatus('active');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-primary">
              <Globe className="w-4 h-4 text-primary-foreground" />
            </div>
            Add New Site
          </DialogTitle>
          <DialogDescription>
            Create a new site configuration for form automation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Title</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Contact Form Automation"
              className="bg-background"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Site Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this site configuration does..."
              className="bg-background"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div>
              <Label htmlFor="status" className="text-base">Active Status</Label>
              <p className="text-sm text-muted-foreground">Enable or disable this site configuration</p>
            </div>
            <Switch
              id="status"
              checked={status === 'active'}
              onCheckedChange={(checked) => setStatus(checked ? 'active' : 'inactive')}
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
