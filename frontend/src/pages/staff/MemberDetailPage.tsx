import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { memberService, type Member } from '../../services/memberService';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import { formatToEthiopian } from '../../utils/dateFormatter';

const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    setLoading(true);
    try {
      const memberData = await memberService.getMember(Number(id));
      setMember(memberData);
      
      // Try to fetch family information
      try {
        const familiesResponse = await apiClient.get(API_ENDPOINTS.FAMILIES, {
          params: { page_size: 100 },
        });
        const families = familiesResponse.data.results || [];
        const memberFamily = families.find((f: any) =>
          f.family_members?.some((fm: any) => fm.member?.id === memberData.id)
        );
        if (memberFamily) {
          setFamily(memberFamily);
        }
      } catch (error) {
        console.error('Error fetching family:', error);
      }
    } catch (error) {
      console.error('Error fetching member:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="member-detail-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="member-detail-page">
        <div className="error">{t('members.memberNotFound') || 'Member not found'}</div>
        <Link to="/staff/members" className="btn-primary">
          {t('common.back') || 'Back to Members'}
        </Link>
      </div>
    );
  }

  return (
    <div className="member-detail-page">
      <div className="page-header">
        <div>
          <Link to="/staff/members" className="back-link">
            ← {t('common.back') || 'Back to Members'}
          </Link>
          <h1>{member.first_name} {member.last_name}</h1>
        </div>
        <div>
          <button
            onClick={() => navigate(`/staff/members?edit=${member.id}`)}
            className="btn-primary"
          >
            {t('common.edit')}
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h2>{t('members.personalInfo') || 'Personal Information'}</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>{t('members.firstName')}</label>
              <p>{member.first_name}</p>
            </div>
            <div className="detail-item">
              <label>{t('members.fatherName') || "Father's Name"}</label>
              <p>{member.father_name || '-'}</p>
            </div>
            <div className="detail-item">
              <label>{t('members.lastName') || "Last Name (Grandfather's Name)"}</label>
              <p>{member.last_name}</p>
            </div>
            <div className="detail-item">
              <label>{t('members.fullName') || 'Full Name'}</label>
              <p>{member.full_name || `${member.first_name} ${member.father_name || ''} ${member.last_name}`.trim()}</p>
            </div>
            <div className="detail-item">
              <label>{t('members.gender')}</label>
              <p>
                {member.gender === 'M' ? t('members.genderM') || 'Male' :
                 member.gender === 'F' ? t('members.genderF') || 'Female' :
                 '-'}
              </p>
            </div>
            <div className="detail-item">
              <label>{t('members.dateOfBirth')}</label>
              <p>
                {member.use_age_instead_of_birthdate
                  ? `${t('members.age')}: ${member.age}`
                  : member.date_of_birth
                  ? formatToEthiopian(member.date_of_birth, i18n.language)
                  : '-'}
              </p>
            </div>
            <div className="detail-item">
              <label>{t('members.phone')}</label>
              <p>{member.phone || '-'}</p>
            </div>
            <div className="detail-item">
              <label>{t('members.email')}</label>
              <p>{member.email || '-'}</p>
            </div>
            <div className="detail-item full-width">
              <label>{t('members.address')}</label>
              <p>{member.address || '-'}</p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>{t('members.churchInfo') || 'Church Information'}</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>{t('members.zone')}</label>
              <p>
                {member.zone ? (
                  <Link to={`/staff/zones/${member.zone}`}>
                    {t('members.viewZone') || 'View Zone'}
                  </Link>
                ) : '-'}
              </p>
            </div>
            <div className="detail-item">
              <label>{t('members.serviceDivision')}</label>
              <p>
                {member.service_division ? (
                  <Link to={`/staff/service-divisions/${member.service_division}`}>
                    {t('members.viewService') || 'View Service'}
                  </Link>
                ) : '-'}
              </p>
            </div>
            <div className="detail-item">
              <label>{t('members.isActive')}</label>
              <p>
                <span className={`badge ${member.is_active ? 'active' : 'inactive'}`}>
                  {member.is_active ? t('dashboard.active') : t('common.inactive')}
                </span>
              </p>
            </div>
          </div>
        </div>

        {family && (
          <div className="detail-section">
            <h2>{t('families.title')}</h2>
            <div className="detail-grid">
              <div className="detail-item full-width">
                <label>{t('families.familyName') || 'Family'}</label>
                <p>
                  <Link to={`/staff/families/${family.id}`}>
                    {family.display_name || 'Unnamed Family'}
                  </Link>
                </p>
              </div>
              {family.family_members && family.family_members.length > 0 && (
                <div className="detail-item full-width">
                  <label>{t('families.familyMembers')}</label>
                  <ul className="family-members-list">
                    {family.family_members.map((fm: any) => (
                      <li key={fm.id}>
                        <Link to={`/staff/members/${fm.member.id}`}>
                          {fm.member.full_name}
                        </Link>
                        <span className="relationship-badge">
                          {fm.relationship_display || fm.relationship}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {member.is_staff_member && (
          <div className="detail-section">
            <h2>{t('members.staffInfo') || 'Staff Information'}</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('members.staffTitle')}</label>
                <p>{member.staff_title || '-'}</p>
              </div>
              <div className="detail-item full-width">
                <label>{t('members.staffBio')}</label>
                <p>{member.staff_bio || '-'}</p>
              </div>
              <div className="detail-item">
                <label>{t('members.showInStaffPage')}</label>
                <p>
                  <span className={`badge ${member.show_in_staff_page ? 'active' : 'inactive'}`}>
                    {member.show_in_staff_page ? t('common.yes') || 'Yes' : t('common.no') || 'No'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {member.photo && (
          <div className="detail-section">
            <h2>{t('members.photo')}</h2>
            <img src={member.photo} alt={member.full_name} className="member-photo" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetailPage;

