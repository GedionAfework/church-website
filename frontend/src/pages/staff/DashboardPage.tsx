import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_STATS);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>{t('dashboard.title')}</h1>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{t('dashboard.members')}</h3>
            <p>{t('dashboard.total')}: {stats.members.total}</p>
            <p>{t('dashboard.active')}: {stats.members.active}</p>
          </div>
          <div className="stat-card">
            <h3>{t('dashboard.families')}</h3>
            <p>{t('dashboard.total')}: {stats.families.total}</p>
          </div>
          <div className="stat-card">
            <h3>{t('dashboard.zones')}</h3>
            <p>{t('dashboard.total')}: {stats.zones.total}</p>
          </div>
          <div className="stat-card">
            <h3>{t('dashboard.serviceDivisions')}</h3>
            <p>{t('dashboard.total')}: {stats.service_divisions.total}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

