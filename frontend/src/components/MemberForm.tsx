import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type Member } from '../services/memberService';

interface MemberFormProps {
  member?: Member;
  onSubmit: (member: FormData) => Promise<void>;
  onCancel: () => void;
  zones?: Array<{ id: number; name: string }>;
  serviceDivisions?: Array<{ id: number; name: string }>;
}

const MemberForm: React.FC<MemberFormProps> = ({
  member,
  onSubmit,
  onCancel,
  zones = [],
  serviceDivisions = [],
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    first_name: member?.first_name || '',
    last_name: member?.last_name || '',
    gender: member?.gender || 'M',
    date_of_birth: member?.date_of_birth || '',
    phone: member?.phone || '',
    email: member?.email || '',
    address: member?.address || '',
    zone: member?.zone || '',
    service_division: member?.service_division || '',
    is_active: member?.is_active ?? true,
    is_staff_member: member?.is_staff_member ?? false,
    staff_title: member?.staff_title || '',
    staff_bio: member?.staff_bio || '',
    show_in_staff_page: member?.show_in_staff_page ?? false,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      if (photo) {
        formDataToSend.append('photo', photo);
      }

      await onSubmit(formDataToSend);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label>{t('members.firstName')} *</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('members.lastName')} *</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{t('members.gender')} *</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="M">{t('members.genderM') || 'Male'}</option>
            <option value="F">{t('members.genderF') || 'Female'}</option>
            <option value="O">{t('members.genderO') || 'Other'}</option>
          </select>
        </div>

        <div className="form-group">
          <label>{t('members.dateOfBirth')}</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{t('members.phone')}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>{t('members.email')}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>{t('members.address')}</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{t('members.zone')}</label>
          <select
            name="zone"
            value={formData.zone}
            onChange={handleChange}
          >
            <option value="">{t('common.select') || 'Select...'}</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>{t('members.serviceDivision')}</label>
          <select
            name="service_division"
            value={formData.service_division}
            onChange={handleChange}
          >
            <option value="">{t('common.select') || 'Select...'}</option>
            {serviceDivisions.map((div) => (
              <option key={div.id} value={div.id}>
                {div.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>{t('members.photo')}</label>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
        {member?.photo && !photo && (
          <img
            src={member.photo}
            alt="Current photo"
            style={{ width: '100px', marginTop: '10px' }}
          />
        )}
      </div>

      <div className="form-row">
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            {t('members.isActive')}
          </label>
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="is_staff_member"
              checked={formData.is_staff_member}
              onChange={handleChange}
            />
            {t('members.isStaffMember')}
          </label>
        </div>
      </div>

      {formData.is_staff_member && (
        <>
          <div className="form-group">
            <label>{t('members.staffTitle')}</label>
            <input
              type="text"
              name="staff_title"
              value={formData.staff_title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{t('members.staffBio')}</label>
            <textarea
              name="staff_bio"
              value={formData.staff_bio}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="show_in_staff_page"
                checked={formData.show_in_staff_page}
                onChange={handleChange}
              />
              {t('members.showInStaffPage') || 'Show in Staff Page'}
            </label>
          </div>
        </>
      )}

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

export default MemberForm;

