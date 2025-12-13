import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type Family } from '../services/familyService';
import { type Member } from '../services/memberService';
import apiClient from '../services/api';
import { API_ENDPOINTS } from '../config/api';

interface FamilyFormProps {
  family?: Family;
  onSubmit: (data: {
    head_member?: number;
    members?: Array<{ member_id: number; relationship: string }>;
  }) => Promise<void>;
  onCancel: () => void;
}

const FamilyForm: React.FC<FamilyFormProps> = ({ family, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [headMember, setHeadMember] = useState<number | ''>(family?.head_member || '');
  const [members, setMembers] = useState<Array<{ member_id: number; relationship: string }>>(
    family?.family_members?.map((fm) => ({
      member_id: fm.member.id,
      relationship: fm.relationship,
    })) || []
  );
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MEMBERS, {
        params: { page_size: 100, is_active: true },
      });
      setAvailableMembers(response.data.results || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const addMember = () => {
    setMembers([...members, { member_id: 0, relationship: 'other' }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: 'member_id' | 'relationship', value: number | string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data: {
        head_member?: number;
        members?: Array<{ member_id: number; relationship: string }>;
      } = {};

      if (headMember) {
        data.head_member = Number(headMember);
      }

      if (members.length > 0) {
        data.members = members.filter((m) => m.member_id > 0);
      }

      await onSubmit(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = availableMembers.filter(
    (m) =>
      m.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="family-form">
      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label>{t('families.headMember')}</label>
        <input
          type="text"
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={headMember}
          onChange={(e) => setHeadMember(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">{t('common.select')}</option>
          {filteredMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.first_name} {member.last_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <div className="form-header">
          <label>{t('families.familyMembers')}</label>
          <button type="button" onClick={addMember} className="btn-sm btn-add">
            {t('common.add') || 'Add Member'}
          </button>
        </div>

        {members.map((member, index) => (
          <div key={index} className="member-row">
            <select
              value={member.member_id}
              onChange={(e) => updateMember(index, 'member_id', Number(e.target.value))}
              required
            >
              <option value={0}>{t('common.select')}</option>
              {filteredMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name}
                </option>
              ))}
            </select>
            <select
              value={member.relationship}
              onChange={(e) => updateMember(index, 'relationship', e.target.value)}
              required
            >
              <option value="father">{t('families.relationshipFather') || 'Father'}</option>
              <option value="mother">{t('families.relationshipMother') || 'Mother'}</option>
              <option value="son">{t('families.relationshipSon') || 'Son'}</option>
              <option value="daughter">{t('families.relationshipDaughter') || 'Daughter'}</option>
              <option value="guardian">{t('families.relationshipGuardian') || 'Guardian'}</option>
              <option value="other">{t('families.relationshipOther') || 'Other'}</option>
            </select>
            <button
              type="button"
              onClick={() => removeMember(index)}
              className="btn-sm btn-delete"
            >
              {t('common.delete')}
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? t('common.loading') : t('common.save')}
        </button>
        <button type="button" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
};

export default FamilyForm;

