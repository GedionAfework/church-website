import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { familyService, type Family } from '../../services/familyService';
import FamilyForm from '../../components/FamilyForm';
import { formatToEthiopian } from '../../utils/dateFormatter';

const FamiliesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFamilies();
  }, [page, searchTerm]);

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (searchTerm) params.search = searchTerm;

      const data = await familyService.getFamilies(params);
      setFamilies(data.results);
      setTotalPages(Math.ceil(data.count / 20));
    } catch (error) {
      console.error('Error fetching families:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFamily(undefined);
    setShowForm(true);
  };

  const handleEdit = (family: Family) => {
    setEditingFamily(family);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmMessage = t('common.confirmDelete') || 'Are you sure you want to delete this family?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await familyService.deleteFamily(id);
      fetchFamilies();
    } catch (error) {
      console.error('Error deleting family:', error);
      alert(t('common.error'));
    }
  };

  const handleSubmit = async (data: {
    head_member?: number;
    members?: Array<{ member_id: number; relationship: string }>;
  }) => {
    try {
      if (editingFamily?.id) {
        await familyService.updateFamily(editingFamily.id, data);
      } else {
        await familyService.createFamily(data);
      }
      setShowForm(false);
      setEditingFamily(undefined);
      fetchFamilies();
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFamily(undefined);
  };

  if (showForm) {
    return (
      <div className="families-page">
        <div className="page-header">
          <h1>{editingFamily ? t('families.editFamily') : t('families.addFamily')}</h1>
        </div>
        <FamilyForm
          family={editingFamily}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="families-page">
      <div className="page-header">
        <h1>{t('families.title')}</h1>
        <button onClick={handleCreate} className="btn-primary">
          {t('families.addFamily')}
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('families.displayName') || 'Family Name'}</th>
                  <th>{t('families.headMember')}</th>
                  <th>{t('families.memberCount') || 'Members'}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {families.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      {t('families.noFamilies') || 'No families found'}
                    </td>
                  </tr>
                ) : (
                  families.map((family) => (
                    <tr
                      key={family.id}
                      onClick={() => {
                        if (family.id) {
                          window.location.href = `/staff/families/${family.id}`;
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <strong>{family.display_name || 'Unnamed Family'}</strong>
                      </td>
                      <td>
                        {family.head_member_name || '-'}
                      </td>
                      <td>{family.family_members?.length || 0}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(family)}
                          className="btn-sm btn-edit"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => {
                            if (family.id) {
                              handleDelete(family.id);
                            }
                          }}
                          className="btn-sm btn-delete"
                        >
                          {t('common.delete')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('common.previous')}
              </button>
              <span>
                {t('common.page')} {page} {t('common.of')} {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FamiliesPage;
