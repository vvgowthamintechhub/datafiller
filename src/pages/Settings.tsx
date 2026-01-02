import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, RefreshCw, Download, Upload } from 'lucide-react';

export const Settings = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* General Settings */}
      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="font-semibold text-foreground">General Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-fill on page load</Label>
              <p className="text-sm text-muted-foreground">Automatically fill forms when page loads</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-submit after fill</Label>
              <p className="text-sm text-muted-foreground">Submit form automatically after filling</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show notifications</Label>
              <p className="text-sm text-muted-foreground">Display notifications for actions</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable keyboard shortcuts</Label>
              <p className="text-sm text-muted-foreground">Use keyboard shortcuts for quick actions</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Timing Settings */}
      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="font-semibold text-foreground">Timing Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="delay">Delay between fields (ms)</Label>
            <Input id="delay" type="number" defaultValue={100} className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeout">Selector timeout (ms)</Label>
            <Input id="timeout" type="number" defaultValue={5000} className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retries">Max retries</Label>
            <Input id="retries" type="number" defaultValue={3} className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageWait">Wait after page load (ms)</Label>
            <Input id="pageWait" type="number" defaultValue={1000} className="bg-background" />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="font-semibold text-foreground">Data Management</h3>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Settings
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import Settings
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2 gradient-primary text-primary-foreground">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
