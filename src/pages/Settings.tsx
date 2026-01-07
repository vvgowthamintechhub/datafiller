import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, RefreshCw, Download, Upload, Power } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const Settings = () => {
  const [extensionEnabled, setExtensionEnabled] = useState(false);
  const importInputId = 'qaff-settings-import';

  // This UI is for app settings export/import.
  // Extension ON/OFF is controlled from the extension icon right-click menu.
  useEffect(() => {
    const savedState = localStorage.getItem('qaff_enabled');
    setExtensionEnabled(savedState === 'true');
  }, []);

  const exportSettings = useCallback(() => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appData: localStorage.getItem('edf_app_data') ? JSON.parse(localStorage.getItem('edf_app_data') as string) : null,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qaformfiller-settings-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Settings exported');
  }, []);

  const importSettings = useCallback(async (file: File) => {
    const text = await file.text();
    const json = JSON.parse(text);

    if (json?.appData) {
      localStorage.setItem('edf_app_data', JSON.stringify(json.appData));
      toast.success('Settings imported. Reloading...');
      setTimeout(() => window.location.reload(), 400);
      return;
    }

    toast.error('Invalid settings file');
  }, []);

  const resetDefaults = useCallback(() => {
    localStorage.removeItem('edf_app_data');
    toast.success('Reset done. Reloading...');
    setTimeout(() => window.location.reload(), 400);
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Extension Control */}
      <div className="glass rounded-xl p-6 space-y-6 border-2 border-primary/20">
        <div className="flex items-center gap-3">
          <Power className="w-6 h-6 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-lg">Extension Control</h3>
        </div>

        <div className="rounded-lg bg-card/50 p-4 text-sm text-muted-foreground">
          Enable/Disable the extension from the <strong>extension icon right‑click menu</strong> (checkbox).
        </div>
      </div>

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

      {/* Extension Download */}
      <div className="glass rounded-xl p-6 space-y-6 border-2 border-green-500/30 bg-green-500/5">
        <h3 className="font-semibold text-foreground">Chrome Extension</h3>
        <p className="text-sm text-muted-foreground">
          Download and install the Chrome extension to enable form filling automation.
        </p>
        <Button 
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          onClick={async () => {
            const { downloadExtension } = await import('@/lib/extensionZip');
            await downloadExtension();
            toast.success('Extension downloaded! Extract and load in Chrome.');
          }}
        >
          <Download className="w-4 h-4" />
          Download Extension (.zip)
        </Button>
      </div>

      {/* Data Management */}
      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="font-semibold text-foreground">Data Management</h3>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={exportSettings}>
            <Download className="w-4 h-4" />
            Export Settings
          </Button>

          <input
            id={importInputId}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importSettings(f);
              e.currentTarget.value = '';
            }}
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => document.getElementById(importInputId)?.click()}
          >
            <Upload className="w-4 h-4" />
            Import Settings
          </Button>

          <Button variant="outline" className="gap-2" onClick={resetDefaults}>
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          className="gap-2 gradient-primary text-primary-foreground"
          onClick={() => toast.success('Settings saved!')}
        >
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
