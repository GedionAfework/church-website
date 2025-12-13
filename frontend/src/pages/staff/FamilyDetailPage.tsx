import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { familyService, type Family } from '../../services/familyService';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import { formatToEthiopian } from '../../utils/dateFormatter';
import { memberService, type Member } from '../../services/memberService';

const FamilyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
  const [selectedRelationship, setSelectedRelationship] = useState<string>('other');

  useEffect(() => {
    if (id) {
      fetchFamily();
      fetchAvailableMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchFamily = async () => {
    setLoading(true);
    try {
      const familyData = await familyService.getFamily(Number(id));
      setFamily(familyData);
    } catch (error) {
      console.error('Error fetching family:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMembers = async () => {
    try {
      // Fetch members directly from API with page_size parameter
      const response = await apiClient.get(API_ENDPOINTS.MEMBERS, {
        params: { page_size: 100 }
      });
      setAvailableMembers(response.data.results || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId || !id) return;

    try {
      await apiClient.post(`${API_ENDPOINTS.FAMILIES}${id}/members/`, {
        member_id: selectedMemberId,
        relationship: selectedRelationship,
      });
      await fetchFamily();
      setShowAddMember(false);
      setSelectedMemberId('');
      setSelectedRelationship('other');
    } catch (error: any) {
      alert(error.response?.data?.error || t('common.error'));
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    const confirmMessage = t('families.confirmRemoveMember') || 'Are you sure you want to remove this member from the family?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await apiClient.delete(`${API_ENDPOINTS.FAMILIES}${id}/members/`, {
        data: { member_id: memberId },
      });
      await fetchFamily();
    } catch (error: any) {
      alert(error.response?.data?.error || t('common.error'));
    }
  };

  if (loading) {
    return (
      <div className="family-detail-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="family-detail-page">
        <div className="error">{t('families.familyNotFound') || 'Family not found'}</div>
        <Link to="/staff/families" className="btn-primary">
          {t('common.back') || 'Back to Families'}
        </Link>
      </div>
    );
  }

  const familyMemberIds = family.family_members?.map(fm => fm.member?.id).filter((id): id is number => Boolean(id)) || [];
  const membersNotInFamily = availableMembers.filter(m => m.id && !familyMemberIds.includes(m.id));

  return (
    <div className="family-detail-page">
      <div className="page-header">
        <div>
          <Link to="/staff/families" className="back-link">
            ← {t('common.back') || 'Back to Families'}
          </Link>
          <h1>{family.display_name || t('families.unnamedFamily') || 'Unnamed Family'}</h1>
        </div>
        <button
          onClick={() => window.location.href = `/staff/families?edit=${family.id}`}
          className="btn-primary"
        >
          {t('common.edit')}
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h2>{t('families.familyInfo') || 'Family Information'}</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>{t('families.headMember') || 'Head Member'}</label>
              <p>
                {family.head_member_name ? (
                  <Link to={`/staff/members/${family.head_member}`}>
                    {family.head_member_name}
                  </Link>
                ) : (
                  '-'
                )}
              </p>
            </div>
            <div className="detail-item">
              <label>{t('families.memberCount') || 'Members'}</label>
              <p>{family.family_members?.length || 0}</p>
            </div>
            <div className="detail-item">
              <label>{t('common.createdAt')}</label>
              <p>
                {family.created_at
                  ? formatToEthiopian(family.created_at, i18n.language)
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>{t('families.familyMembers') || 'Family Members'} ({family.family_members?.length || 0})</h2>
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="btn-primary btn-sm"
            >
              {showAddMember ? t('common.cancel') : t('families.addMember') || 'Add Member'}
            </button>
          </div>

          {showAddMember && (
            <div className="add-member-form" style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3>{t('families.addMember') || 'Add Member to Family'}</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : '')}
                  style={{ flex: 1, padding: '8px' }}
                >
                  <option value="">{t('families.selectMember') || 'Select Member'}</option>
                  {membersNotInFamily.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || `${member.first_name} ${member.father_name || ''} ${member.last_name}`.trim()}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedRelationship}
                  onChange={(e) => setSelectedRelationship(e.target.value)}
                  style={{ flex: 1, padding: '8px' }}
                >
                  <option value="father">{t('families.relationshipFather') || 'Father'}</option>
                  <option value="mother">{t('families.relationshipMother') || 'Mother'}</option>
                  <option value="son">{t('families.relationshipSon') || 'Son'}</option>
                  <option value="daughter">{t('families.relationshipDaughter') || 'Daughter'}</option>
                  <option value="guardian">{t('families.relationshipGuardian') || 'Guardian'}</option>
                  <option value="other">{t('families.relationshipOther') || 'Other'}</option>
                </select>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedMemberId}
                  className="btn-primary"
                >
                  {t('common.add')}
                </button>
              </div>
            </div>
          )}

          {family.family_members && family.family_members.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('members.name') || 'Name'}</th>
                    <th>{t('families.relationship') || 'Relationship'}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {family.family_members.map((fm) => (
                    <tr key={fm.id}>
                      <td>
                        {fm.member && fm.member.id ? (
                          <Link to={`/staff/members/${fm.member.id}`}>
                            {fm.member.full_name || `${fm.member.first_name} ${fm.member.father_name || ''} ${fm.member.last_name}`.trim()}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span className="relationship-badge">
                          {fm.relationship_display || fm.relationship}
                        </span>
                      </td>
                      <td>
                        {fm.member?.id && (
                          <button
                            onClick={() => handleRemoveMember(fm.member!.id!)}
                            className="btn-sm btn-delete"
                          >
                            {t('families.remove') || 'Remove'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">{t('families.noMembers') || 'No members in this family'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyDetailPage;

