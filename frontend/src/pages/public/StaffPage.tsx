import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  staff_title: string;
  staff_bio: string;
  photo?: string;
}

const StaffPage: React.FC = () => {
  const { t } = useTranslation();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(API_ENDPOINTS.MEMBERS, {
        params: {
          is_staff_member: true,
          show_in_staff_page: true,
          is_active: true,
          page_size: 100,
        },
      });
      setStaff(response.data.results || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="staff-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="staff-page">
      <div className="page-header">
        <h1>{t('staff.title') || 'Our Staff'}</h1>
        <p>{t('staff.subtitle') || 'Meet our dedicated team'}</p>
      </div>

      {staff.length === 0 ? (
        <div className="empty-state">
          <p>{t('staff.noStaff') || 'No staff members to display'}</p>
        </div>
      ) : (
        <div className="staff-grid">
          {staff.map((member) => (
            <div key={member.id} className="staff-card">
              {member.photo && (
                <div className="staff-photo">
                  <img src={member.photo} alt={member.full_name} />
                </div>
              )}
              <div className="staff-info">
                <h3>{member.full_name}</h3>
                {member.staff_title && (
                  <p className="staff-title">{member.staff_title}</p>
                )}
                {member.staff_bio && (
                  <p className="staff-bio">{member.staff_bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffPage;
