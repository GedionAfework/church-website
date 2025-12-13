import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { structureService, type ServiceDivision } from '../../services/structureService';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

const ServiceDivisionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [division, setDivision] = useState<ServiceDivision | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDivision();
      fetchMembers();
    }
  }, [id]);

  const fetchDivision = async () => {
    try {
      const divisionData = await structureService.getServiceDivision(Number(id));
      setDivision(divisionData);
    } catch (error) {
      console.error('Error fetching service division:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MEMBERS, {
        params: { service_division: id, page_size: 100 },
      });
      setMembers(response.data.results || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  if (loading) {
    return (
      <div className="service-division-detail-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (!division) {
    return (
      <div className="service-division-detail-page">
        <div className="error">{t('serviceDivisions.divisionNotFound') || 'Service division not found'}</div>
        <Link to="/staff/service-divisions" className="btn-primary">
          {t('common.back') || 'Back to Service Divisions'}
        </Link>
      </div>
    );
  }

  return (
    <div className="service-division-detail-page">
      <div className="page-header">
        <div>
          <Link to="/staff/service-divisions" className="back-link">
            ← {t('common.back') || 'Back to Service Divisions'}
          </Link>
          <h1>{division.name}</h1>
        </div>
        <button
          onClick={() => window.location.href = `/staff/service-divisions?edit=${division.id}`}
          className="btn-primary"
        >
          {t('common.edit')}
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h2>{t('serviceDivisions.details') || 'Service Division Details'}</h2>
          <div className="detail-grid">
            <div className="detail-item full-width">
              <label>{t('zones.description')}</label>
              <p>{division.description || '-'}</p>
            </div>
            <div className="detail-item">
              <label>{t('dashboard.active')}</label>
              <p>
                <span className={`badge ${division.is_active ? 'active' : 'inactive'}`}>
                  {division.is_active ? t('dashboard.active') : t('common.inactive')}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>{t('members.title')} ({members.length})</h2>
          {members.length === 0 ? (
            <p className="empty-state">{t('serviceDivisions.noMembers') || 'No members in this service division'}</p>
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

export default ServiceDivisionDetailPage;

