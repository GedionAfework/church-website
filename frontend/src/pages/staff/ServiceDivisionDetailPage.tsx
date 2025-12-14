import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../contexts/AlertContext';
import { structureService, type ServiceDivision } from '../../services/structureService';
import { memberService, type Member } from '../../services/memberService';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

const ServiceDivisionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { confirm, showError, showSuccess } = useAlert();
  const [division, setDivision] = useState<ServiceDivision | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]); // All members for dropdown
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDivision();
      fetchMembers();
      fetchAllMembers();
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

  const fetchAllMembers = async () => {
    try {
      // Fetch all members that are not in any service division or are in this service division
      const response = await apiClient.get(API_ENDPOINTS.MEMBERS, {
        params: { page_size: 1000 },
      });
      const allMembersData = response.data.results || [];
      // Filter to show only members without a service division or members in this service division
      const availableMembers = allMembersData.filter((m: Member) => !m.service_division || m.service_division === Number(id));
      setAllMembers(availableMembers);
    } catch (error) {
      console.error('Error fetching all members:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) return;
    
    try {
      const memberId = Number(selectedMemberId);
      // Update member to assign to this service division
      await memberService.updateMember(memberId, { service_division: Number(id) });
      setSelectedMemberId('');
      showSuccess(t('serviceDivisions.memberAdded') || 'Member added to service division successfully');
      await fetchMembers();
      await fetchAllMembers(); // Refresh available members list
    } catch (error: any) {
      console.error('Error adding member to service division:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.service_division?.[0] || t('serviceDivisions.errorAddingMember') || 'Error adding member to service division';
      showError(errorMsg);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    confirm(t('serviceDivisions.confirmRemoveMember') || 'Are you sure you want to remove this member from the service division?', async () => {
      try {
        // Remove member from service division by setting service_division to null
        await memberService.updateMember(memberId, { service_division: null });
        showSuccess(t('serviceDivisions.memberRemoved') || 'Member removed from service division successfully');
        await fetchMembers();
        await fetchAllMembers();
      } catch (error: any) {
        console.error('Error removing member from service division:', error);
        showError(error.response?.data?.detail || t('common.error') || 'An error occurred');
      }
    });
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
          </div>
        </div>

        <div className="detail-section">
          <h2>{t('members.title')} ({members.length})</h2>
          
          {/* Add Member Section */}
          <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {t('serviceDivisions.addMember') || 'Add Member'}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">{t('serviceDivisions.selectMember') || 'Select a member...'}</option>
                {allMembers
                  .filter((member) => !members.some((m) => m.id === member.id))
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || `${member.first_name} ${member.father_name || ''} ${member.last_name}`.trim()}
                      {member.service_division && member.service_division !== Number(id) ? ` (${t('serviceDivisions.currentlyInDivision') || 'Currently in another division'})` : ''}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleAddMember}
                className="btn-primary"
                disabled={!selectedMemberId}
              >
                {t('common.add')}
              </button>
            </div>
          </div>

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
                          style={{ marginRight: '5px' }}
                        >
                          {t('common.view')}
                        </Link>
                        <button
                          onClick={() => member.id && handleRemoveMember(member.id)}
                          className="btn-sm btn-delete"
                        >
                          {t('serviceDivisions.remove') || 'Remove'}
                        </button>
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

