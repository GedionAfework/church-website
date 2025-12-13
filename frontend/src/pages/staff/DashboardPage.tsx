import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import StatCard from '../../components/StatCard';
import RecentList from '../../components/RecentList';

interface DashboardStats {
  members: {
    total: number;
    active: number;
    recent: Array<{
      id: number;
      first_name: string;
      last_name: string;
      created_at: string;
    }>;
  };
  families: {
    total: number;
    recent: Array<{
      id: number;
      display_name: string;
      created_at: string;
    }>;
  };
  zones: {
    total: number;
  };
  service_divisions: {
    total: number;
  };
  hero_sections: {
    active: number;
    upcoming: Array<{
      id: number;
      title: string;
      start_date: string;
      end_date: string;
    }>;
  };
}

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD_STATS);
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      // If 403 Forbidden, it's a permission issue
      if (err.response?.status === 403) {
        setError(err.response?.data?.detail || t('dashboard.noPermission') || 'You do not have permission to view the dashboard.');
      } else {
        setError(err.response?.data?.detail || t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (member: any) => {
    navigate(`/staff/members?memberId=${member.id}`);
  };

  const handleFamilyClick = (family: any) => {
    navigate(`/staff/families?familyId=${family.id}`);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error">{error}</div>
        <button onClick={fetchStats}>{t('common.retry') || 'Retry'}</button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>{t('dashboard.title')}</h1>
      </div>

      {stats && (
        <>
          <div className="stats-grid">
            <StatCard
              title={t('dashboard.members')}
              value={stats.members.total}
            />
            <StatCard
              title={t('dashboard.families')}
              value={stats.families.total}
            />
            <StatCard
              title={t('dashboard.zones')}
              value={stats.zones.total}
            />
            <StatCard
              title={t('dashboard.serviceDivisions')}
              value={stats.service_divisions.total}
            />
            <StatCard
              title={t('content.heroSection')}
              value={stats.hero_sections.total}
            />
          </div>

          <div className="dashboard-content">
            <div className="dashboard-section">
              <RecentList
                title={`${t('dashboard.recent')} ${t('dashboard.members')}`}
                items={stats.members.recent}
                onItemClick={handleMemberClick}
                getItemLabel={(item) => `${item.first_name} ${item.father_name} ${item.last_name}`}
              />
            </div>

            <div className="dashboard-section">
              <RecentList
                title={`${t('dashboard.recent')} ${t('dashboard.families')}`}
                items={stats.families.recent}
                onItemClick={handleFamilyClick}
                getItemLabel={(item) => item.display_name || 'Unnamed Family'}
              />
            </div>

            {stats.hero_sections.upcoming && stats.hero_sections.upcoming.length > 0 && (
              <div className="dashboard-section">
                <RecentList
                  title={`${t('dashboard.upcoming') || 'Upcoming'} ${t('content.heroSection')}`}
                  items={stats.hero_sections.upcoming}
                  getItemLabel={(item) => item.title}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

