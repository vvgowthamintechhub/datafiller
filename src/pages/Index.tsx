import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/pages/Dashboard';
import { Sites } from '@/pages/Sites';
import { Templates } from '@/pages/Templates';
import { Logs } from '@/pages/Logs';
import { Scripts } from '@/pages/Scripts';
import { Settings } from '@/pages/Settings';
import { useStore } from '@/hooks/useStore';
import { toast } from 'sonner';
import { ExcelData } from '@/types';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your automation' },
  sites: { title: 'Sites', subtitle: 'Manage your form automation sites' },
  templates: { title: 'Data Templates', subtitle: 'Excel and CSV data templates' },
  logs: { title: 'Action Logs', subtitle: 'View automation history' },
  scripts: { title: 'Custom Scripts', subtitle: 'Advanced JavaScript automation' },
  settings: { title: 'Settings', subtitle: 'Configure preferences' },
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const store = useStore();

  const handleImportExcel = useCallback(() => {
    // Simulate Excel import
    const mockData: ExcelData = {
      headers: ['Name', 'Email', 'Phone', 'Country', 'Message'],
      rows: [
        ['John Doe', 'john@example.com', '+1234567890', 'USA', 'Hello there!'],
        ['Jane Smith', 'jane@example.com', '+0987654321', 'UK', 'Nice to meet you'],
        ['Bob Wilson', 'bob@example.com', '+1122334455', 'Canada', 'Great product!'],
        ['Alice Brown', 'alice@example.com', '+5544332211', 'Australia', 'Looking forward'],
        ['Charlie Davis', 'charlie@example.com', '+9988776655', 'Germany', 'Excellent service'],
      ],
    };
    store.importExcelData(mockData);
    toast.success('Excel data imported successfully!');
  }, [store]);

  const handleAddSite = useCallback(() => {
    setActiveTab('sites');
  }, []);

  const handleRunSite = useCallback((id: string) => {
    const site = store.sites.find(s => s.id === id);
    if (site) {
      store.addLog({
        siteId: id,
        siteName: site.name,
        action: 'fill',
        message: `Starting form fill for ${site.name}`,
      });
      store.updateSite(id, { status: 'active', lastRun: new Date() });
      toast.success(`Running automation for ${site.name}`);
      
      setTimeout(() => {
        store.addLog({
          siteId: id,
          siteName: site.name,
          action: 'success',
          message: 'Form filled successfully',
        });
      }, 2000);
    }
  }, [store]);

  const handleEditSite = useCallback((id: string) => {
    toast.info('Site configuration will open here');
  }, []);

  const handleDeleteSite = useCallback((id: string) => {
    store.deleteSite(id);
    toast.success('Site deleted');
  }, [store]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            sites={store.sites}
            logs={store.logs}
            excelData={store.excelData}
            currentRow={store.currentRow}
            onPrevRow={store.prevRow}
            onNextRow={store.nextRow}
            onImportExcel={handleImportExcel}
            onAddSite={handleAddSite}
            onRunSite={handleRunSite}
            onEditSite={handleEditSite}
            onDeleteSite={handleDeleteSite}
          />
        );
      case 'sites':
        return (
          <Sites
            sites={store.sites}
            onAddSite={store.addSite}
            onRunSite={handleRunSite}
            onEditSite={handleEditSite}
            onDeleteSite={handleDeleteSite}
          />
        );
      case 'templates':
        return <Templates templates={store.templates} />;
      case 'logs':
        return <Logs logs={store.logs} onClearLogs={store.clearLogs} />;
      case 'scripts':
        return <Scripts />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  const pageInfo = pageTitles[activeTab] || { title: 'Dashboard' };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
