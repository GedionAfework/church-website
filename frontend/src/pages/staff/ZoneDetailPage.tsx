import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { structureService, type Zone, type ZoneLeader } from '../../services/structureService';
import { bibleStudyGroupService, type BibleStudyGroup } from '../../services/bibleStudyGroupService';
import { memberService, type Member } from '../../services/memberService';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

const ZoneDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [zone, setZone] = useState<Zone | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]); // All members for dropdown
  const [bibleStudyGroups, setBibleStudyGroups] = useState<BibleStudyGroup[]>([]);
  const [zoneLeader, setZoneLeader] = useState<ZoneLeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBibleStudyForm, setShowBibleStudyForm] = useState(false);
  const [editingBibleStudy, setEditingBibleStudy] = useState<BibleStudyGroup | undefined>();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchZone();
      fetchMembers();
      fetchAllMembers();
      fetchBibleStudyGroups();
      fetchZoneLeader();
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

  const fetchBibleStudyGroups = async () => {
    try {
      const data = await bibleStudyGroupService.getBibleStudyGroups({
        zone: Number(id),
        page_size: 100,
      });
      setBibleStudyGroups(data.results || []);
    } catch (error) {
      console.error('Error fetching bible study groups:', error);
    }
  };

  const fetchAllMembers = async () => {
    try {
      // Fetch all members that are not in any zone or are in this zone
      const response = await apiClient.get(API_ENDPOINTS.MEMBERS, {
        params: { page_size: 1000, is_active: true },
      });
      const allMembersData = response.data.results || [];
      // Filter to show only members without a zone or members in this zone
      const availableMembers = allMembersData.filter((m: Member) => !m.zone || m.zone === Number(id));
      setAllMembers(availableMembers);
    } catch (error) {
      console.error('Error fetching all members:', error);
    }
  };

  const fetchZoneLeader = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ZONE_LEADERS, {
        params: { zone: id },
      });
      if (response.data.results && response.data.results.length > 0) {
        setZoneLeader(response.data.results[0]);
      } else {
        setZoneLeader(null);
      }
    } catch (error) {
      console.error('Error fetching zone leader:', error);
      setZoneLeader(null);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) return;
    
    try {
      const memberId = Number(selectedMemberId);
      // Update member to assign to this zone
      await memberService.updateMember(memberId, { zone: Number(id) });
      setSelectedMemberId('');
      await fetchMembers();
      await fetchAllMembers(); // Refresh available members list
    } catch (error: any) {
      console.error('Error adding member to zone:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.zone?.[0] || t('zones.errorAddingMember') || 'Error adding member to zone';
      alert(errorMsg);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!window.confirm(t('zones.confirmRemoveMember') || 'Are you sure you want to remove this member from the zone?')) {
      return;
    }
    
    try {
      // Remove member from zone by setting zone to null
      await memberService.updateMember(memberId, { zone: null });
      await fetchMembers();
      await fetchAllMembers();
      // If this member was the leader, remove them as leader
      if (zoneLeader && ((zoneLeader as any).member === memberId || (zoneLeader as any).member_id === memberId)) {
        if (zoneLeader.id) {
          await structureService.deleteZoneLeader(zoneLeader.id);
          await fetchZoneLeader();
        }
      }
    } catch (error) {
      console.error('Error removing member from zone:', error);
      alert(t('common.error'));
    }
  };

  const handleSetLeader = async () => {
    if (!selectedLeaderId) return;
    
    try {
      const memberId = Number(selectedLeaderId);
      
      // Check if member is in this zone
      const member = members.find(m => m.id === memberId);
      if (!member) {
        alert(t('zones.memberNotInZone') || 'Member must be in this zone to be a leader');
        return;
      }
      
      // If there's already a leader, update it; otherwise create new
      if (zoneLeader?.id) {
        await structureService.updateZoneLeader(zoneLeader.id, { member_id: memberId });
      } else {
        await structureService.createZoneLeader({ zone: Number(id), member_id: memberId });
      }
      
      setSelectedLeaderId('');
      await fetchZoneLeader();
    } catch (error: any) {
      console.error('Error setting zone leader:', error);
      const errorMsg = error.response?.data?.detail || t('zones.errorSettingLeader') || 'Error setting zone leader';
      alert(errorMsg);
    }
  };

  const handleRemoveLeader = async () => {
    if (!zoneLeader?.id) return;
    
    if (!window.confirm(t('zones.confirmRemoveLeader') || 'Are you sure you want to remove this leader?')) {
      return;
    }
    
    try {
      await structureService.deleteZoneLeader(zoneLeader.id);
      await fetchZoneLeader();
    } catch (error) {
      console.error('Error removing zone leader:', error);
      alert(t('common.error'));
    }
  };

  const handleCreateBibleStudy = () => {
    setEditingBibleStudy(undefined);
    setShowBibleStudyForm(true);
  };

  const handleEditBibleStudy = (group: BibleStudyGroup) => {
    setEditingBibleStudy(group);
    setShowBibleStudyForm(true);
  };

  const handleDeleteBibleStudy = async (groupId: number) => {
    if (!window.confirm(t('zones.confirmDeleteBibleStudy') || 'Are you sure you want to delete this Bible Study Group?')) {
      return;
    }
    try {
      await bibleStudyGroupService.deleteBibleStudyGroup(groupId);
      fetchBibleStudyGroups();
    } catch (error) {
      console.error('Error deleting bible study group:', error);
      alert(t('common.error'));
    }
  };

  const handleBibleStudySubmit = async (formData: Partial<BibleStudyGroup>) => {
    try {
      if (editingBibleStudy?.id) {
        await bibleStudyGroupService.updateBibleStudyGroup(editingBibleStudy.id, formData);
      } else {
        await bibleStudyGroupService.createBibleStudyGroup({
          ...formData,
          zone: Number(id),
        });
      }
      setShowBibleStudyForm(false);
      setEditingBibleStudy(undefined);
      fetchBibleStudyGroups();
    } catch (error) {
      console.error('Error saving bible study group:', error);
      alert(t('common.error'));
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>{t('members.title')} ({members.length})</h2>
          </div>
          
          {/* Add Member Section */}
          <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {t('zones.addMember') || 'Add Member'}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">{t('zones.selectMemberToAdd') || 'Select a member to add...'}</option>
                {allMembers
                  .filter(m => !members.find(zm => zm.id === m.id)) // Only show members not already in zone
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || `${member.first_name} ${member.father_name || ''} ${member.last_name}`.trim()}
                      {member.zone && member.zone !== Number(id) ? ` (${t('zones.currentlyInZone') || 'Currently in another zone'})` : ''}
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

          {/* Zone Leader Section */}
          <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f0f8ff' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {t('zones.zoneLeader') || 'Zone Leader'}
            </label>
            {zoneLeader ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {zoneLeader.member_detail?.full_name || 
                   (zoneLeader.member_detail ? 
                     `${zoneLeader.member_detail.first_name || ''} ${zoneLeader.member_detail.father_name || ''} ${zoneLeader.member_detail.last_name || ''}`.trim() :
                     t('zones.loadingLeader') || 'Loading...')}
                </span>
                <button
                  onClick={handleRemoveLeader}
                  className="btn-sm btn-delete"
                >
                  {t('zones.removeLeader') || 'Remove Leader'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={selectedLeaderId}
                  onChange={(e) => setSelectedLeaderId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">{t('zones.selectLeaderFromMembers') || 'Select a leader from zone members...'}</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || `${member.first_name} ${member.father_name || ''} ${member.last_name}`.trim()}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSetLeader}
                  className="btn-primary"
                  disabled={!selectedLeaderId || members.length === 0}
                >
                  {t('zones.setLeader') || 'Set Leader'}
                </button>
              </div>
            )}
          </div>

          {members.length === 0 ? (
            <p className="empty-state">{t('zones.noMembers') || 'No members in this zone'}</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('members.name') || 'Name'}</th>
                    <th>{t('members.email')}</th>
                    <th>{t('members.phone')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.full_name || `${member.first_name} ${member.father_name || ''} ${member.last_name}`.trim()}</td>
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
                          {t('zones.remove') || 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="detail-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>{t('zones.bibleStudyGroups') || 'Bible Study Groups'}</h2>
            <button onClick={handleCreateBibleStudy} className="btn-primary">
              {t('zones.addBibleStudyGroup') || 'Add Bible Study Group'}
            </button>
          </div>
          {bibleStudyGroups.length === 0 ? (
            <p className="empty-state">{t('zones.noBibleStudyGroups') || 'No Bible Study Groups in this zone'}</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('zones.bibleStudyName') || 'Name'}</th>
                    <th>{t('zones.placeOfStudy') || 'Place of Study'}</th>
                    <th>{t('zones.members') || 'Members'}</th>
                    <th>{t('zones.leaders') || 'Leaders'}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bibleStudyGroups.map((group) => (
                    <tr key={group.id}>
                      <td>{group.name}</td>
                      <td>{group.place_of_study || '-'}</td>
                      <td>
                        {group.members_count || 0} {group.members_count === 1 ? t('zones.member') || 'member' : t('zones.members') || 'members'}
                      </td>
                      <td>
                        {group.leaders_count || 0} {group.leaders_count === 1 ? t('zones.leader') || 'leader' : t('zones.leaders') || 'leaders'}
                      </td>
                      <td>
                        <button
                          onClick={() => group.id && handleEditBibleStudy(group)}
                          className="btn-sm btn-edit"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => group.id && handleDeleteBibleStudy(group.id)}
                          className="btn-sm btn-delete"
                        >
                          {t('common.delete')}
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

      {showBibleStudyForm && (
        <BibleStudyGroupForm
          zoneId={Number(id)}
          group={editingBibleStudy}
          members={members}
          onSubmit={handleBibleStudySubmit}
          onCancel={() => {
            setShowBibleStudyForm(false);
            setEditingBibleStudy(undefined);
          }}
        />
      )}
    </div>
  );
};

// Bible Study Group Form Component
interface BibleStudyGroupFormProps {
  zoneId: number;
  group?: BibleStudyGroup;
  members: any[];
  onSubmit: (data: Partial<BibleStudyGroup>) => Promise<void>;
  onCancel: () => void;
}

const BibleStudyGroupForm: React.FC<BibleStudyGroupFormProps> = ({
  group,
  members,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: group?.name || '',
    place_of_study: group?.place_of_study || '',
    members: group?.members || [],
    leaders: group?.leaders || [],
  });
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Get selected members and leaders details
  const selectedMembers = members.filter(m => formData.members.includes(m.id));
  const selectedLeaders = members.filter(m => formData.leaders.includes(m.id));
  
  // Get available members (not already selected)
  const availableMembers = members.filter(m => !formData.members.includes(m.id));
  const availableLeaders = members.filter(m => !formData.leaders.includes(m.id));

  const handleAddLeader = () => {
    if (selectedLeaderId && !formData.leaders.includes(Number(selectedLeaderId))) {
      setFormData({
        ...formData,
        leaders: [...formData.leaders, Number(selectedLeaderId)],
      });
      setSelectedLeaderId('');
    }
  };

  const handleRemoveLeader = (leaderId: number) => {
    setFormData({
      ...formData,
      leaders: formData.leaders.filter(id => id !== leaderId),
    });
  };

  const handleAddMember = () => {
    if (selectedMemberId && !formData.members.includes(Number(selectedMemberId))) {
      setFormData({
        ...formData,
        members: [...formData.members, Number(selectedMemberId)],
      });
      setSelectedMemberId('');
    }
  };

  const handleRemoveMember = (memberId: number) => {
    setFormData({
      ...formData,
      members: formData.members.filter(id => id !== memberId),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>{group ? t('zones.editBibleStudyGroup') || 'Edit Bible Study Group' : t('zones.addBibleStudyGroup') || 'Add Bible Study Group'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('zones.bibleStudyName') || 'Name'} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder={t('zones.bibleStudyNamePlaceholder') || 'Enter Bible Study Group name'}
            />
          </div>

          <div className="form-group">
            <label>{t('zones.placeOfStudy') || 'Place of Study'}</label>
            <input
              type="text"
              value={formData.place_of_study}
              onChange={(e) => setFormData({ ...formData, place_of_study: e.target.value })}
              placeholder={t('zones.placeOfStudyPlaceholder') || 'Enter place of study'}
            />
          </div>

          <div className="form-group">
            <label>{t('zones.selectLeaders') || 'Select Leaders'}</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <select
                value={selectedLeaderId}
                onChange={(e) => setSelectedLeaderId(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">{t('zones.selectLeader') || 'Select a leader...'}</option>
                {availableLeaders.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || `${member.first_name} ${member.father_name || ''} ${member.last_name}`.trim()}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddLeader}
                className="btn-primary"
                disabled={!selectedLeaderId}
              >
                {t('common.add') || 'Add'}
              </button>
            </div>
            {selectedLeaders.length > 0 && (
              <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                {selectedLeaders.map((leader) => (
                  <div key={leader.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                    <span>{leader.full_name || `${leader.first_name} ${leader.father_name || ''} ${leader.last_name}`.trim()}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLeader(leader.id!)}
                      className="btn-sm btn-delete"
                    >
                      {t('common.remove') || 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedLeaders.length === 0 && (
              <p className="form-help-text" style={{ color: '#999', fontStyle: 'italic' }}>
                {t('zones.noLeadersSelected') || 'No leaders selected'}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>{t('zones.selectMembers') || 'Select Members'}</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">{t('zones.selectMember') || 'Select a member...'}</option>
                {availableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || `${member.first_name} ${member.father_name || ''} ${member.last_name}`.trim()}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddMember}
                className="btn-primary"
                disabled={!selectedMemberId}
              >
                {t('common.add') || 'Add'}
              </button>
            </div>
            {selectedMembers.length > 0 && (
              <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {selectedMembers.map((member) => (
                  <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                    <span>{member.full_name || `${member.first_name} ${member.father_name || ''} ${member.last_name}`.trim()}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id!)}
                      className="btn-sm btn-delete"
                    >
                      {t('common.remove') || 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedMembers.length === 0 && (
              <p className="form-help-text" style={{ color: '#999', fontStyle: 'italic' }}>
                {t('zones.noMembersSelected') || 'No members selected'}
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('common.saving') || 'Saving...' : t('common.save')}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZoneDetailPage;

