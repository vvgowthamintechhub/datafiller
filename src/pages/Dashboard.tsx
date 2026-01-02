import { Globe, FileSpreadsheet, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SiteCard } from '@/components/dashboard/SiteCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ExcelPreview } from '@/components/dashboard/ExcelPreview';
import { Button } from '@/components/ui/button';
import { Site, LogEntry, ExcelData } from '@/types';

interface DashboardProps {
  sites: Site[];
  logs: LogEntry[];
  excelData: ExcelData | null;
  currentRow: number;
  onPrevRow: () => void;
  onNextRow: () => void;
  onImportExcel: () => void;
  onAddSite: () => void;
  onRunSite: (id: string) => void;
  onEditSite: (id: string) => void;
  onDeleteSite: (id: string) => void;
}

export const Dashboard = ({
  sites,
  logs,
  excelData,
  currentRow,
  onPrevRow,
  onNextRow,
  onImportExcel,
  onAddSite,
  onRunSite,
  onEditSite,
  onDeleteSite,
}: DashboardProps) => {
  const activeSites = sites.filter(s => s.status === 'active').length;
  const totalFields = sites.reduce((sum, s) => sum + s.fieldsCount, 0);
  const successLogs = logs.filter(l => l.action === 'success').length;
  const errorLogs = logs.filter(l => l.action === 'error').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Sites"
          value={activeSites}
          change={`${sites.length} total`}
          icon={Globe}
          gradient="primary"
        />
        <StatsCard
          title="Form Fields"
          value={totalFields}
          change="Configured"
          icon={FileSpreadsheet}
          gradient="accent"
        />
        <StatsCard
          title="Successful Runs"
          value={successLogs}
          change="+12 today"
          changeType="positive"
          icon={CheckCircle}
          gradient="success"
        />
        <StatsCard
          title="Errors"
          value={errorLogs}
          change={errorLogs > 0 ? "Needs attention" : "All clear"}
          changeType={errorLogs > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          gradient="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sites Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Your Sites</h3>
            <Button onClick={onAddSite} size="sm" className="gap-2 gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4" />
              Add Site
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.slice(0, 4).map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onRun={() => onRunSite(site.id)}
                onEdit={() => onEditSite(site.id)}
                onDelete={() => onDeleteSite(site.id)}
              />
            ))}
          </div>

          {sites.length === 0 && (
            <div className="glass rounded-xl p-12 text-center">
              <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">No sites configured</h4>
              <p className="text-muted-foreground mb-4">Add your first site to start automating forms</p>
              <Button onClick={onAddSite} className="gap-2 gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4" />
                Add Your First Site
              </Button>
            </div>
          )}
        </div>

        {/* Activity Column */}
        <div className="space-y-4">
          <RecentActivity logs={logs} />
        </div>
      </div>

      {/* Excel Preview */}
      <ExcelPreview
        data={excelData}
        currentRow={currentRow}
        onPrevRow={onPrevRow}
        onNextRow={onNextRow}
        onImport={onImportExcel}
      />
    </div>
  );
};
