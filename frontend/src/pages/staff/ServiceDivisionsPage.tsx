import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../contexts/AlertContext';
import { structureService, type ServiceDivision } from '../../services/structureService';

const ServiceDivisionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { confirm, showError, showSuccess } = useAlert();
  const [divisions, setDivisions] = useState<ServiceDivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDivision, setEditingDivision] = useState<ServiceDivision | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDivisions();
  }, [page, searchTerm]);

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (searchTerm) params.search = searchTerm;

      const data = await structureService.getServiceDivisions(params);
      setDivisions(data.results);
      setTotalPages(Math.ceil(data.count / 20));
    } catch (error) {
      console.error('Error fetching service divisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDivision(undefined);
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  const handleEdit = (division: ServiceDivision) => {
    setEditingDivision(division);
    setFormData({
      name: division.name,
      description: division.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmMessage = t('common.confirmDelete') || 'Are you sure you want to delete this service division?';
    confirm(confirmMessage, async () => {
      try {
        await structureService.deleteServiceDivision(id);
        showSuccess(t('serviceDivisions.divisionDeleted') || 'Service division deleted successfully');
        fetchDivisions();
      } catch (error: any) {
        console.error('Error deleting service division:', error);
        showError(error.response?.data?.detail || t('common.error') || 'An error occurred');
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDivision?.id) {
        await structureService.updateServiceDivision(editingDivision.id, formData);
        showSuccess(t('serviceDivisions.divisionUpdated') || 'Service division updated successfully');
      } else {
        await structureService.createServiceDivision(formData);
        showSuccess(t('serviceDivisions.divisionCreated') || 'Service division created successfully');
      }
      setShowForm(false);
      setEditingDivision(undefined);
      fetchDivisions();
    } catch (error: any) {
      console.error('Error saving service division:', error);
      showError(error.response?.data?.detail || t('common.error') || 'An error occurred');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDivision(undefined);
  };

  if (showForm) {
    return (
      <div className="service-divisions-page">
        <div className="page-header">
          <h1>
            {editingDivision
              ? t('serviceDivisions.editServiceDivision') || 'Edit Service Division'
              : t('serviceDivisions.addServiceDivision') || 'Add Service Division'}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>{t('serviceDivisions.name') || 'Name'} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('zones.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="form-actions">
            <button type="submit">{t('common.save')}</button>
            <button type="button" onClick={handleCancel}>
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="service-divisions-page">
      <div className="page-header">
        <h1>{t('dashboard.serviceDivisions')}</h1>
        <button onClick={handleCreate} className="btn-primary">
          {t('serviceDivisions.addServiceDivision') || 'Add Service Division'}
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
                  <th>{t('serviceDivisions.name') || 'Name'}</th>
                  <th>{t('zones.description')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {divisions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      {t('serviceDivisions.noServiceDivisions') || 'No service divisions found'}
                    </td>
                  </tr>
                ) : (
                  divisions.map((division) => (
                    <tr
                      key={division.id}
                      onClick={() => {
                        if (division.id) {
                          window.location.href = `/staff/service-divisions/${division.id}`;
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><strong>{division.name}</strong></td>
                      <td>{division.description || '-'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(division)}
                          className="btn-sm btn-edit"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => {
                            if (division.id) {
                              handleDelete(division.id);
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

export default ServiceDivisionsPage;
