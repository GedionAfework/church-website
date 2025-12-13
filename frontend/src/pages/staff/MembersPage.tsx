import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { memberService, type Member } from '../../services/memberService';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import MemberForm from '../../components/MemberForm';

const MembersPage: React.FC = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState<number | ''>('');
  const [filterService, setFilterService] = useState<number | ''>('');
  const [zones, setZones] = useState<Array<{ id: number; name: string }>>([]);
  const [serviceDivisions, setServiceDivisions] = useState<Array<{ id: number; name: string }>>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchZones();
    fetchServiceDivisions();
    fetchMembers();
  }, [page, searchTerm, filterZone, filterService]);

  const fetchZones = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ZONES);
      setZones(response.data.results || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchServiceDivisions = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SERVICE_DIVISIONS);
      setServiceDivisions(response.data.results || []);
    } catch (error) {
      console.error('Error fetching service divisions:', error);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (searchTerm) params.search = searchTerm;
      if (filterZone) params.zone = filterZone;
      if (filterService) params.service_division = filterService;

      const data = await memberService.getMembers(params);
      setMembers(data.results);
      setTotalPages(Math.ceil(data.count / 20));
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMember(undefined);
    setShowForm(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmMessage = t('common.confirmDelete') || 'Are you sure you want to delete this member?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await memberService.deleteMember(id);
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert(t('common.error'));
    }
  };

  const handleSubmit = async (formData: FormData): Promise<Member> => {
    if (editingMember?.id) {
      const updated = await memberService.updateMember(editingMember.id, formData);
      setShowForm(false);
      setEditingMember(undefined);
      fetchMembers();
      return updated;
    } else {
      const created = await memberService.createMember(formData);
      setShowForm(false);
      setEditingMember(undefined);
      fetchMembers();
      return created;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMember(undefined);
  };

  if (showForm) {
    return (
      <div className="members-page">
        <div className="page-header">
          <h1>{editingMember ? t('members.editMember') : t('members.addMember')}</h1>
        </div>
        <MemberForm
          member={editingMember}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          zones={zones}
          serviceDivisions={serviceDivisions}
        />
      </div>
    );
  }

  return (
    <div className="members-page">
      <div className="page-header">
        <h1>{t('members.title')}</h1>
        <button onClick={handleCreate} className="btn-primary">
          {t('members.addMember')}
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
        <select
          value={filterZone}
          onChange={(e) => {
            setFilterZone(e.target.value ? Number(e.target.value) : '');
            setPage(1);
          }}
        >
          <option value="">{t('members.allZones') || 'All Zones'}</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
        <select
          value={filterService}
          onChange={(e) => {
            setFilterService(e.target.value ? Number(e.target.value) : '');
            setPage(1);
          }}
        >
          <option value="">{t('members.allServices') || 'All Services'}</option>
          {serviceDivisions.map((div) => (
            <option key={div.id} value={div.id}>
              {div.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('members.name') || 'Name'}</th>
                  <th>{t('members.email')}</th>
                  <th>{t('members.phone')}</th>
                  <th>{t('members.zone')}</th>
                  <th>{t('members.serviceDivision')}</th>
                  <th>{t('members.isActive')}</th>
                  <th>{t('common.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      {t('members.noMembers') || 'No members found'}
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr
                      key={member.id}
                      onClick={() => {
                        if (member.id) {
                          window.location.href = `/staff/members/${member.id}`;
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{member.full_name || `${member.first_name} ${member.father_name || ''} ${member.last_name}`.trim()}</td>
                      <td>{member.email || '-'}</td>
                      <td>{member.phone || '-'}</td>
                      <td>
                        {zones.find((z) => z.id === member.zone)?.name || '-'}
                      </td>
                      <td>
                        {serviceDivisions.find((s) => s.id === member.service_division)?.name || '-'}
                      </td>
                      <td>
                        <span className={`badge ${member.is_active ? 'active' : 'inactive'}`}>
                          {member.is_active ? t('dashboard.active') : t('common.inactive') || 'Inactive'}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(member)}
                          className="btn-sm btn-edit"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => {
                            if (member.id) {
                              handleDelete(member.id);
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
                {t('common.previous') || 'Previous'}
              </button>
              <span>
                {t('common.page') || 'Page'} {page} {t('common.of') || 'of'} {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('common.next') || 'Next'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MembersPage;
