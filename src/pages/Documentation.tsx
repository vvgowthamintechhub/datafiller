import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, Settings, Globe, FileSpreadsheet, Code, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadExtension } from '@/lib/extensionZip';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">Qa</span>
              </div>
              <span className="font-semibold text-foreground">QAFormFiller Documentation</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Introduction */}
          <section>
            <h1 className="text-3xl font-bold text-foreground mb-4">Getting Started with QAFormFiller</h1>
            <p className="text-muted-foreground text-lg">
              QAFormFiller is a powerful browser extension that automates form filling using data from Excel spreadsheets. 
              This guide will help you set up and use the extension effectively.
            </p>
          </section>

          {/* Installation */}
          <section className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Download className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Installation</h2>
            </div>
            <div className="space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li>Download the extension by clicking the button below</li>
                <li>Extract the downloaded ZIP file to a folder on your computer</li>
                <li>Open Chrome and navigate to <code className="bg-muted px-2 py-1 rounded text-sm">chrome://extensions/</code></li>
                <li>Enable "Developer mode" using the toggle in the top-right corner</li>
                <li>Click "Load unpacked" and select the extracted folder</li>
                <li>The QAFormFiller icon will appear in your browser toolbar</li>
              </ol>
              <Button onClick={downloadExtension} className="gap-2 gradient-primary text-primary-foreground mt-4">
                <Download className="w-4 h-4" />
                Download Extension
              </Button>
            </div>
          </section>

          {/* Configuration */}
          <section className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Configuration</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>Before using the extension, you need to configure your sites and form fields:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <strong className="text-foreground">Add a Site</strong>
                    <p>Click "Add Site" in the dashboard and enter the website URL pattern you want to automate.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <strong className="text-foreground">Configure Pages</strong>
                    <p>Add pages within each site and specify URL patterns using exact match, contains, or regex.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <strong className="text-foreground">Define Form Fields</strong>
                    <p>Add form fields with selectors (CSS, XPath, ID, or Name) to identify elements on the page.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* URL Patterns */}
          <section className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">URL Pattern Types</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Exact Match</h3>
                  <p className="text-sm text-muted-foreground mb-2">URL must match exactly</p>
                  <code className="bg-background px-2 py-1 rounded text-sm">https://example.com/form</code>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Contains</h3>
                  <p className="text-sm text-muted-foreground mb-2">URL must contain the pattern</p>
                  <code className="bg-background px-2 py-1 rounded text-sm">example.com/form</code>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Regex</h3>
                  <p className="text-sm text-muted-foreground mb-2">URL must match the regular expression</p>
                  <code className="bg-background px-2 py-1 rounded text-sm">https://example\\.com/form/\\d+</code>
                </div>
              </div>
            </div>
          </section>

          {/* Excel Data */}
          <section className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Using Excel Data</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>Upload an Excel or CSV file to use its data for form filling:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Go to your site configuration</li>
                <li>Click the "Upload Excel" tab</li>
                <li>Upload your Excel (.xlsx, .xls) or CSV file</li>
                <li>The first row will be used as column headers</li>
              </ol>
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-foreground mb-2">Column Placeholders</h3>
                <p className="text-sm mb-2">Use placeholders in field values to reference Excel columns:</p>
                <code className="bg-background px-2 py-1 rounded text-sm">{'{$ColumnName$}'}</code>
              </div>
            </div>
          </section>

          {/* Custom Scripts */}
          <section className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Custom JavaScript</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>For complex interactions, you can write custom JavaScript for each field:</p>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm mb-2">Available variables in your script:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><code className="bg-background px-1 rounded">element</code> - The DOM element</li>
                  <li><code className="bg-background px-1 rounded">value</code> - The processed value</li>
                  <li><code className="bg-background px-1 rounded">rowData</code> - Current Excel row data</li>
                </ul>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-2">Example:</p>
                <pre className="bg-background p-3 rounded text-sm overflow-x-auto">
{`// Click a dropdown and select an option
element.click();
setTimeout(() => {
  const option = document.querySelector(\`[data-value="\${value}"]\`);
  if (option) option.click();
}, 100);`}
                </pre>
              </div>
            </div>
          </section>

          {/* Usage */}
          <section className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Using the Extension</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <ol className="list-decimal list-inside space-y-3">
                <li>Click the QAFormFiller icon in your browser toolbar</li>
                <li>Toggle the extension <strong className="text-primary">ON</strong> (blue)</li>
                <li>Navigate to a configured website</li>
                <li>Configured fields will be highlighted with a blue dashed outline</li>
                <li>Click <strong>"Run Auto-Fill"</strong> to fill the form</li>
              </ol>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong className="text-warning">Note:</strong> When the extension is OFF (red), it will not interact with any website.
                </p>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="text-center py-8">
            <p className="text-muted-foreground mb-4">Need help? Check out our resources:</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/app">
                <Button className="gap-2 gradient-primary text-primary-foreground">
                  <BookOpen className="w-4 h-4" />
                  Open App
                </Button>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  GitHub Repository
                </Button>
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Documentation;
