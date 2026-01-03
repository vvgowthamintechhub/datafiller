import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { SiteConfig } from './SiteConfig';

const SiteConfigPage = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const store = useAppStore();

  const site = store.sites.find(s => s.id === siteId) || null;
  const pages = siteId ? store.getPagesBySite(siteId) : [];

  const handleViewFields = (pageId: string) => {
    navigate(`/sites/${siteId}/pages/${pageId}`);
  };

  return (
    <SiteConfig
      site={site}
      pages={pages}
      onUpdateSite={store.updateSite}
      onAddPage={store.addPage}
      onUpdatePage={store.updatePage}
      onDeletePage={store.deletePage}
      onViewFields={handleViewFields}
    />
  );
};

export default SiteConfigPage;
