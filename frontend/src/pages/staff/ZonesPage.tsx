import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { structureService, type Zone } from '../../services/structureService';

const ZonesPage: React.FC = () => {
  const { t } = useTranslation();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location_hint: '',
    is_active: true,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchZones();
  }, [page, searchTerm]);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (searchTerm) params.search = searchTerm;

      const data = await structureService.getZones(params);
      setZones(data.results);
      setTotalPages(Math.ceil(data.count / 20));
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingZone(undefined);
    setFormData({ name: '', description: '', location_hint: '', is_active: true });
    setShowForm(true);
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      location_hint: zone.location_hint || '',
      is_active: zone.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmMessage = t('common.confirmDelete') || 'Are you sure you want to delete this zone?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await structureService.deleteZone(id);
      fetchZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
      alert(t('common.error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingZone?.id) {
        await structureService.updateZone(editingZone.id, formData);
      } else {
        await structureService.createZone(formData);
      }
      setShowForm(false);
      setEditingZone(undefined);
      fetchZones();
    } catch (error) {
      console.error('Error saving zone:', error);
      alert(t('common.error'));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingZone(undefined);
  };

  if (showForm) {
    return (
      <div className="zones-page">
        <div className="page-header">
          <h1>{editingZone ? t('zones.editZone') : t('zones.addZone')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>{t('zones.name')} *</label>
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
          <div className="form-group">
            <label>{t('zones.locationHint')}</label>
            <input
              type="text"
              value={formData.location_hint}
              onChange={(e) => setFormData({ ...formData, location_hint: e.target.value })}
            />
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              {t('dashboard.active')}
            </label>
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
    <div className="zones-page">
      <div className="page-header">
        <h1>{t('zones.title')}</h1>
        <button onClick={handleCreate} className="btn-primary">
          {t('zones.addZone')}
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
                  <th>{t('zones.name')}</th>
                  <th>{t('zones.description')}</th>
                  <th>{t('zones.locationHint')}</th>
                  <th>{t('dashboard.active')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {zones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      {t('zones.noZones') || 'No zones found'}
                    </td>
                  </tr>
                ) : (
                  zones.map((zone) => (
                    <tr key={zone.id}>
                      <td><strong>{zone.name}</strong></td>
                      <td>{zone.description || '-'}</td>
                      <td>{zone.location_hint || '-'}</td>
                      <td>
                        <span className={`badge ${zone.is_active ? 'active' : 'inactive'}`}>
                          {zone.is_active ? t('dashboard.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(zone)}
                          className="btn-sm btn-edit"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => {
                            if (zone.id) {
                              handleDelete(zone.id);
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

export default ZonesPage;
