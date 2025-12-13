import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { userService, type User } from '../../services/userService';
import { roleService, type Role } from '../../services/roleService';
import { memberService, type Member } from '../../services/memberService';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [formData, setFormData] = useState({
    member_id: null as number | null,
    username: '',
    email: '',
    first_name: '',
    father_name: '',
    last_name: '',
    password: '',
    is_staff: false,
    is_superuser: false,
    is_active: true,
    groups: null as number | null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (memberSearchTerm.trim()) {
      const filtered = members.filter((member) => {
        const searchLower = memberSearchTerm.toLowerCase();
        const fullName = member.full_name?.toLowerCase() || '';
        return (
          fullName.includes(searchLower) ||
          member.first_name?.toLowerCase().includes(searchLower) ||
          member.last_name?.toLowerCase().includes(searchLower) ||
          member.email?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredMembers(filtered.slice(0, 10)); // Limit to 10 results
      setShowMemberDropdown(true);
    } else {
      setFilteredMembers([]);
      setShowMemberDropdown(false);
    }
  }, [memberSearchTerm, members]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers({ page_size: 100 });
      setUsers(data.results);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await roleService.getRoles({ page_size: 100 });
      setRoles(data.results);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await memberService.getMembers({ page_size: 1000 });
      // Filter out members that already have a user account
      const membersWithoutUser = data.results.filter((member) => {
        // If editing a user, include the member linked to that user
        if (editingUser && formData.member_id === member.id) {
          return true;
        }
        return !member.user;
      });
      setMembers(membersWithoutUser);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleMemberSelect = (member: Member) => {
    setFormData({
      ...formData,
      member_id: member.id || null,
      first_name: member.first_name || '',
      father_name: member.father_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
    });
    setMemberSearchTerm(member.full_name || '');
    setShowMemberDropdown(false);
  };

  const handleCreate = () => {
    setEditingUser(undefined);
    setFormData({
      member_id: null,
      username: '',
      email: '',
      first_name: '',
      father_name: '',
      last_name: '',
      password: '',
      is_staff: false,
      is_superuser: false,
      is_active: true,
      groups: null,
    });
    setMemberSearchTerm('');
    setShowMemberDropdown(false);
    setShowForm(true);
    setError(null);
  };

  const handleEdit = async (user: User) => {
    try {
      const fullUser = await userService.getUser(user.id!);
      setEditingUser(fullUser);
      
      // Get member if linked
      let memberId = null;
      let memberName = '';
      if ((fullUser as any).member_name) {
        // Try to find the member
        const memberData = await apiClient.get(API_ENDPOINTS.MEMBERS, {
          params: { user: user.id },
        });
        if (memberData.data.results && memberData.data.results.length > 0) {
          memberId = memberData.data.results[0].id;
          memberName = memberData.data.results[0].full_name || '';
        }
      }
      
      setFormData({
        member_id: memberId,
        username: fullUser.username,
        email: fullUser.email || '',
        first_name: fullUser.first_name || '',
        father_name: (fullUser as any).father_name || '',
        last_name: fullUser.last_name || '',
        password: '', // Don't populate password
        is_staff: fullUser.is_staff,
        is_superuser: fullUser.is_superuser,
        is_active: fullUser.is_active,
        groups: fullUser.groups && fullUser.groups.length > 0 ? fullUser.groups[0] : null,
      });
      setMemberSearchTerm(memberName);
      setShowForm(true);
      setError(null);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmMessage = t('users.confirmDelete') || 'Are you sure you want to delete this user?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await userService.deleteUser(id);
      await fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.detail || t('common.error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingUser && !formData.member_id) {
      setError(t('users.memberRequired') || 'Please select a member');
      return;
    }

    if (!formData.username.trim()) {
      setError(t('users.usernameRequired') || 'Username is required');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setError(t('users.passwordRequired') || 'Password is required for new users');
      return;
    }

    const userData: any = {
      username: formData.username.trim(),
      is_staff: formData.is_staff,
      is_superuser: formData.is_superuser,
      is_active: formData.is_active,
    };

    // Only include optional fields if they have values
    if (formData.email && formData.email.trim()) {
      userData.email = formData.email.trim();
    }
    if (formData.first_name && formData.first_name.trim()) {
      userData.first_name = formData.first_name.trim();
    }
    if (formData.father_name && formData.father_name.trim()) {
      userData.father_name = formData.father_name.trim();
    }
    if (formData.last_name && formData.last_name.trim()) {
      userData.last_name = formData.last_name.trim();
    }
    
    // Only include groups if a role is selected
    if (formData.groups) {
      userData.groups = [formData.groups];
    }

    // Only include member_id if it's provided
    if (formData.member_id) {
      userData.member_id = formData.member_id;
    }

    // Only include password if it's provided (for new users or password change)
    if (formData.password && formData.password.trim()) {
      userData.password = formData.password.trim();
    }

    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id!, userData);
      } else {
        await userService.createUser(userData);
      }

      setShowForm(false);
      await fetchUsers();
    } catch (error: any) {
      console.error('Error creating/updating user:', error);
      console.error('Error response:', error.response?.data);
      console.error('Request data:', userData);
      
      // Get error messages from the response
      let errorMessage = t('common.error');
      const errorMessages: string[] = [];
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Collect all error messages
        if (errorData.password) {
          if (Array.isArray(errorData.password) && errorData.password.length > 0) {
            errorMessages.push(...errorData.password.map((msg: string) => `Password: ${msg}`));
          } else if (typeof errorData.password === 'string') {
            errorMessages.push(`Password: ${errorData.password}`);
          }
        }
        if (errorData.username && Array.isArray(errorData.username) && errorData.username.length > 0) {
          errorMessages.push(...errorData.username.map((msg: string) => `Username: ${msg}`));
        }
        if (errorData.member_id && Array.isArray(errorData.member_id) && errorData.member_id.length > 0) {
          errorMessages.push(...errorData.member_id.map((msg: string) => `Member: ${msg}`));
        } else if (errorData.member_id) {
          errorMessages.push(`Member: ${errorData.member_id}`);
        }
        if (errorData.detail) {
          errorMessages.push(errorData.detail);
        }
        if (typeof errorData === 'string') {
          errorMessages.push(errorData);
        }
        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors) && errorData.non_field_errors.length > 0) {
          errorMessages.push(...errorData.non_field_errors);
        }
        
        // Use the first error message or join all if multiple
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.length === 1 
            ? errorMessages[0] 
            : errorMessages.join('; ');
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(undefined);
    setFormData({
      member_id: null,
      username: '',
      email: '',
      first_name: '',
      father_name: '',
      last_name: '',
      password: '',
      is_staff: false,
      is_superuser: false,
      is_active: true,
      groups: null,
    });
    setMemberSearchTerm('');
    setShowMemberDropdown(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>{t('users.title') || 'Users'}</h1>
        <button onClick={handleCreate} className="btn-primary">
          {t('users.addUser') || 'Add User'}
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUser ? t('users.editUser') : t('users.addUser')}</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
              {!editingUser && (
                <div className="form-group">
                  <label>{t('users.selectMember') || 'Select Member'} *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={memberSearchTerm}
                      onChange={(e) => {
                        setMemberSearchTerm(e.target.value);
                        if (!e.target.value) {
                          setFormData({
                            ...formData,
                            member_id: null,
                            first_name: '',
                            father_name: '',
                            last_name: '',
                            email: '',
                          });
                        }
                      }}
                      placeholder={t('users.searchMember') || 'Search for a member...'}
                      required={!editingUser}
                      onFocus={() => {
                        if (memberSearchTerm) {
                          setShowMemberDropdown(true);
                        }
                      }}
                    />
                    {showMemberDropdown && filteredMembers.length > 0 && (
                      <div
                        className="member-dropdown"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 1000,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        {filteredMembers.map((member) => (
                          <div
                            key={member.id}
                            onClick={() => handleMemberSelect(member)}
                            style={{
                              padding: '10px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #eee',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0f0f0';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            <strong>{member.full_name}</strong>
                            {member.email && (
                              <div style={{ fontSize: '0.9rem', color: '#666' }}>{member.email}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="form-help-text">
                    {t('users.selectMemberHelp') || 'Search and select an existing member to create a user account for them'}
                  </p>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>{t('users.username') || 'Username'} *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={!!editingUser}
                    placeholder={t('users.usernamePlaceholder') || 'Enter username'}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label>{t('users.email') || 'Email'}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('users.emailPlaceholder') || 'Enter email'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('users.firstName') || 'First Name'}</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder={t('users.firstNamePlaceholder') || 'Enter first name'}
                    readOnly={!!formData.member_id && !editingUser}
                  />
                </div>

                <div className="form-group">
                  <label>{t('users.fatherName') || "Father's Name"}</label>
                  <input
                    type="text"
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    placeholder={t('users.fatherNamePlaceholder') || "Enter father's name"}
                    readOnly={!!formData.member_id && !editingUser}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('users.lastName') || 'Last Name'}</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder={t('users.lastNamePlaceholder') || 'Enter last name'}
                    readOnly={!!formData.member_id && !editingUser}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  {editingUser
                    ? t('users.newPassword') || 'New Password (leave blank to keep current)'
                    : t('users.password') || 'Password'} *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder={t('users.passwordPlaceholder') || 'Enter password'}
                  autoComplete="new-password"
                />
                {!editingUser && (
                  <p className="form-help-text" style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                    {t('users.passwordRequirements') || 'Password must be at least 8 characters, not too common, and not entirely numeric.'}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>{t('users.role') || 'Role'}</label>
                <select
                  value={formData.groups || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, groups: e.target.value ? Number(e.target.value) : null });
                  }}
                >
                  <option value="">{t('users.noRole') || 'No Role'}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_staff}
                      onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                    />
                    {t('users.isStaff') || 'Staff Member'}
                  </label>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_superuser}
                      onChange={(e) =>
                        setFormData({ ...formData, is_superuser: e.target.checked })
                      }
                    />
                    {t('users.isSuperuser') || 'Superuser'}
                  </label>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    {t('users.isActive') || 'Active'}
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {t('common.save')}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="empty-state">
          <p>{t('users.noUsers') || 'No users found'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('users.username') || 'Username'}</th>
                <th>{t('users.email') || 'Email'}</th>
                <th>{t('users.name') || 'Name'}</th>
                <th>{t('users.roles') || 'Roles'}</th>
                <th>{t('users.status') || 'Status'}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.username}</strong>
                    {user.is_superuser && (
                      <span className="badge" style={{ marginLeft: '8px', background: '#e74c3c' }}>
                        {t('users.superuser') || 'Superuser'}
                      </span>
                    )}
                  </td>
                  <td>{user.email || '-'}</td>
                <td>
                  {(() => {
                    const parts = [];
                    if (user.first_name) parts.push(user.first_name);
                    if ((user as any).father_name) parts.push((user as any).father_name);
                    if (user.last_name) parts.push(user.last_name);
                    return parts.length > 0 ? parts.join(' ') : '-';
                  })()}
                </td>
                  <td>
                    {user.groups_names && user.groups_names.length > 0
                      ? user.groups_names.join(', ')
                      : '-'}
                  </td>
                  <td>
                    <span className={`badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? t('common.yes') : t('common.no')}
                    </span>
                    {user.is_staff && (
                      <span className="badge" style={{ marginLeft: '5px', background: '#3498db' }}>
                        {t('users.staff') || 'Staff'}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn-sm btn-edit"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => {
                        if (user.id) {
                          handleDelete(user.id);
                        }
                      }}
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
  );
};

export default UsersPage;

