import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: number;
  content_type_name?: string;
  model_name?: string;
}

export interface GroupedPermission {
  app_label: string;
  model_name: string;
  permissions: Array<{
    id: number;
    name: string;
    codename: string;
    full_codename: string;
  }>;
}

export interface Role {
  id?: number;
  name: string;
  permissions?: number[];
  permissions_detail?: Permission[];
  user_count?: number;
  permission_count?: number;
}

export interface RoleListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Role[];
}

export interface AvailablePermissionsResponse {
  grouped: Record<string, GroupedPermission>;
  flat: Permission[];
}

export const roleService = {
  async getRoles(params?: {
    page?: number;
    search?: string;
  }): Promise<RoleListResponse> {
    const response = await apiClient.get<RoleListResponse>(API_ENDPOINTS.GROUPS, { params });
    return response.data;
  },

  async getRole(id: number): Promise<Role> {
    const response = await apiClient.get<Role>(`${API_ENDPOINTS.GROUPS}${id}/`);
    return response.data;
  },

  async createRole(role: { name: string; permissions?: number[] }): Promise<Role> {
    const response = await apiClient.post<Role>(API_ENDPOINTS.GROUPS, role);
    return response.data;
  },

  async updateRole(id: number, role: Partial<Role>): Promise<Role> {
    const response = await apiClient.patch<Role>(`${API_ENDPOINTS.GROUPS}${id}/`, role);
    return response.data;
  },

  async deleteRole(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.GROUPS}${id}/`);
  },

  async getAvailablePermissions(): Promise<AvailablePermissionsResponse> {
    const response = await apiClient.get<AvailablePermissionsResponse>(
      `${API_ENDPOINTS.GROUPS}available_permissions/`
    );
    return response.data;
  },

  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<Role> {
    const response = await apiClient.post<Role>(
      `${API_ENDPOINTS.GROUPS}${roleId}/assign_permissions/`,
      { permission_ids: permissionIds }
    );
    return response.data;
  },

  async getRoleUsers(roleId: number): Promise<{ count: number; users: any[] }> {
    const response = await apiClient.get<{ count: number; users: any[] }>(
      `${API_ENDPOINTS.GROUPS}${roleId}/users/`
    );
    return response.data;
  },
};

