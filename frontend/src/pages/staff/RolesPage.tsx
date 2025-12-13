import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { roleService, type Role, type GroupedPermission } from '../../services/roleService';

const RolesPage: React.FC = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as number[],
  });
  const [availablePermissions, setAvailablePermissions] = useState<Record<string, GroupedPermission>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<Record<number, boolean>>({});
  const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
    fetchAvailablePermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await roleService.getRoles({ page_size: 100 });
      setRoles(data.results);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePermissions = async () => {
    try {
      const data = await roleService.getAvailablePermissions();
      setAvailablePermissions(data.grouped);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleCreate = () => {
    setEditingRole(undefined);
    setFormData({ name: '', permissions: [] });
    setSelectedPermissions({});
    setShowForm(true);
    setError(null);
  };

  const handleEdit = async (role: Role) => {
    try {
      const fullRole = await roleService.getRole(role.id!);
      setEditingRole(fullRole);
      setFormData({
        name: fullRole.name,
        permissions: fullRole.permissions || [],
      });
      
      // Set selected permissions
      const selected: Record<number, boolean> = {};
      (fullRole.permissions || []).forEach((permId) => {
        selected[permId] = true;
      });
      setSelectedPermissions(selected);
      
      setShowForm(true);
      setError(null);
    } catch (error) {
      console.error('Error fetching role details:', error);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmMessage = t('roles.confirmDelete') || 'Are you sure you want to delete this role?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await roleService.deleteRole(id);
      await fetchRoles();
    } catch (error: any) {
      alert(error.response?.data?.detail || t('common.error'));
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const updated = { ...prev };
      if (updated[permissionId]) {
        delete updated[permissionId];
      } else {
        updated[permissionId] = true;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError(t('roles.nameRequired') || 'Role name is required');
      return;
    }

    try {
      const permissionIds = Object.keys(selectedPermissions)
        .filter((key) => selectedPermissions[Number(key)])
        .map((key) => Number(key));

      if (editingRole) {
        await roleService.updateRole(editingRole.id!, {
          name: formData.name,
          permissions: permissionIds,
        });
      } else {
        await roleService.createRole({
          name: formData.name,
          permissions: permissionIds,
        });
      }

      setShowForm(false);
      await fetchRoles();
    } catch (error: any) {
      setError(error.response?.data?.detail || t('common.error'));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRole(undefined);
    setFormData({ name: '', permissions: [] });
    setSelectedPermissions({});
    setError(null);
  };

  if (loading) {
    return (
      <div className="roles-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="roles-page">
      <div className="page-header">
        <h1>{t('roles.title') || 'Roles & Permissions'}</h1>
        <button onClick={handleCreate} className="btn-primary">
          {t('roles.addRole') || 'Add Role'}
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingRole ? t('roles.editRole') : t('roles.addRole')}</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('roles.name') || 'Role Name'} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={t('roles.namePlaceholder') || 'Enter role name'}
                />
              </div>

              <div className="form-group">
                <label>{t('roles.permissions') || 'Permissions'}</label>
                <input
                  type="text"
                  placeholder={t('roles.searchPermissions') || 'Search permissions (e.g., "dashboard", "view_dashboard")...'}
                  value={permissionSearchTerm}
                  onChange={(e) => setPermissionSearchTerm(e.target.value)}
                  style={{ marginBottom: '15px', padding: '8px', width: '100%' }}
                />
                <div className="permissions-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {Object.entries(availablePermissions)
                    .filter(([key, group]) => {
                      if (!permissionSearchTerm) return true;
                      const searchLower = permissionSearchTerm.toLowerCase();
                      // Search in app_label, model_name, and permission names
                      return (
                        group.app_label.toLowerCase().includes(searchLower) ||
                        group.model_name.toLowerCase().includes(searchLower) ||
                        group.permissions.some(perm => 
                          perm.name.toLowerCase().includes(searchLower) ||
                          perm.codename.toLowerCase().includes(searchLower) ||
                          perm.full_codename.toLowerCase().includes(searchLower)
                        )
                      );
                    })
                    .map(([key, group]) => (
                      <div key={key} className="permission-group">
                        <h4>
                          {t(`permissions.apps.${group.app_label}`, group.app_label)}.{t(`permissions.models.${group.model_name}`, group.model_name)}
                        </h4>
                        <div className="permission-list">
                          {group.permissions.map((perm) => (
                            <label key={perm.id} className="permission-item">
                              <input
                                type="checkbox"
                                checked={!!selectedPermissions[perm.id]}
                                onChange={() => handlePermissionToggle(perm.id)}
                              />
                              <span>
                                {t(`permissions.${perm.full_codename}`, perm.name)}
                                <small style={{ color: '#666', marginLeft: '8px' }}>
                                  ({perm.full_codename})
                                </small>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
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

      {roles.length === 0 ? (
        <div className="empty-state">
          <p>{t('roles.noRoles') || 'No roles found'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('roles.name') || 'Name'}</th>
                <th>{t('roles.permissionCount') || 'Permissions'}</th>
                <th>{t('roles.userCount') || 'Users'}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <strong>{role.name}</strong>
                  </td>
                  <td>{role.permission_count || 0}</td>
                  <td>{role.user_count || 0}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(role)}
                      className="btn-sm btn-edit"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => {
                        if (role.id) {
                          handleDelete(role.id);
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

export default RolesPage;

