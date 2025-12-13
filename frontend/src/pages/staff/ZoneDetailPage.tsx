import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { structureService, type Zone } from '../../services/structureService';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

const ZoneDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [zone, setZone] = useState<Zone | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchZone();
      fetchMembers();
    }
  }, [id]);

  const fetchZone = async () => {
    try {
      const zoneData = await structureService.getZone(Number(id));
      setZone(zoneData);
    } catch (error) {
      console.error('Error fetching zone:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MEMBERS, {
        params: { zone: id, page_size: 100 },
      });
      setMembers(response.data.results || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  if (loading) {
    return (
      <div className="zone-detail-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="zone-detail-page">
        <div className="error">{t('zones.zoneNotFound') || 'Zone not found'}</div>
        <Link to="/staff/zones" className="btn-primary">
          {t('common.back') || 'Back to Zones'}
        </Link>
      </div>
    );
  }

  return (
    <div className="zone-detail-page">
      <div className="page-header">
        <div>
          <Link to="/staff/zones" className="back-link">
            ← {t('common.back') || 'Back to Zones'}
          </Link>
          <h1>{zone.name}</h1>
        </div>
        <button
          onClick={() => window.location.href = `/staff/zones?edit=${zone.id}`}
          className="btn-primary"
        >
          {t('common.edit')}
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h2>{t('zones.details') || 'Zone Details'}</h2>
          <div className="detail-grid">
            <div className="detail-item full-width">
              <label>{t('zones.description')}</label>
              <p>{zone.description || '-'}</p>
            </div>
            <div className="detail-item">
              <label>{t('zones.locationHint')}</label>
              <p>{zone.location_hint || '-'}</p>
            </div>
            <div className="detail-item">
              <label>{t('dashboard.active')}</label>
              <p>
                <span className={`badge ${zone.is_active ? 'active' : 'inactive'}`}>
                  {zone.is_active ? t('dashboard.active') : t('common.inactive')}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>{t('members.title')} ({members.length})</h2>
          {members.length === 0 ? (
            <p className="empty-state">{t('zones.noMembers') || 'No members in this zone'}</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('members.firstName')}</th>
                    <th>{t('members.lastName')}</th>
                    <th>{t('members.email')}</th>
                    <th>{t('members.phone')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.first_name}</td>
                      <td>{member.last_name}</td>
                      <td>{member.email || '-'}</td>
                      <td>{member.phone || '-'}</td>
                      <td>
                        <Link
                          to={`/staff/members/${member.id}`}
                          className="btn-sm btn-view"
                        >
                          {t('common.view')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneDetailPage;

