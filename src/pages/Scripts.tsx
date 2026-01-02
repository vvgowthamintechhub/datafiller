import { Plus, Play, Save, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export const Scripts = () => {
  const [script, setScript] = useState(`// Custom JavaScript for form automation
// This script runs after form fields are filled

// Example: Wait for dynamic content
await new Promise(resolve => setTimeout(resolve, 1000));

// Example: Click a specific button
const submitBtn = document.querySelector('#submit-button');
if (submitBtn) {
  submitBtn.click();
}

// Example: Handle dropdown that loads dynamically
const dropdown = document.querySelector('select[name="category"]');
if (dropdown) {
  dropdown.value = 'option1';
  dropdown.dispatchEvent(new Event('change', { bubbles: true }));
}

console.log('Custom script executed successfully!');`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Custom Scripts</h3>
          <p className="text-sm text-muted-foreground">
            Write JavaScript to extend automation capabilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Script
          </Button>
        </div>
      </div>

      {/* Script Editor */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <span className="font-medium">Main Script</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Play className="w-4 h-4" />
              Test Run
            </Button>
            <Button size="sm" className="gap-2 gradient-primary text-primary-foreground">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        <Textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="min-h-[400px] font-mono text-sm bg-background resize-none"
          placeholder="Write your custom JavaScript here..."
        />

        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Available APIs:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><code className="text-primary">EDF.fill(selector, value)</code> - Fill a form field</li>
              <li><code className="text-primary">EDF.click(selector)</code> - Click an element</li>
              <li><code className="text-primary">EDF.wait(ms)</code> - Wait for specified milliseconds</li>
              <li><code className="text-primary">EDF.waitFor(selector)</code> - Wait for element to appear</li>
              <li><code className="text-primary">EDF.getData(column)</code> - Get data from current Excel row</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
