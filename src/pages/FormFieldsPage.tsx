import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { FormFields } from './FormFields';

const FormFieldsPage = () => {
  const { siteId, pageId } = useParams();
  const navigate = useNavigate();
  const store = useAppStore();

  const page = store.pages.find(p => p.id === pageId) || null;
  const fields = pageId ? store.getFieldsByPage(pageId) : [];
  const excelColumns = store.excelData?.headers || [];

  const handleBack = () => {
    navigate(`/sites/${siteId}`);
  };

  return (
    <FormFields
      page={page}
      fields={fields}
      excelColumns={excelColumns}
      onAddField={store.addField}
      onUpdateField={store.updateField}
      onDeleteField={store.deleteField}
      onBack={handleBack}
    />
  );
};

export default FormFieldsPage;
