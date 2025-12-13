import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface User {
  id?: number;
  username: string;
  email?: string;
  first_name?: string;
  father_name?: string;
  last_name?: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  groups?: number[];
  groups_detail?: Array<{
    id: number;
    name: string;
    permission_count?: number;
    user_count?: number;
  }>;
  groups_count?: number;
  groups_names?: string[];
  date_joined?: string;
  last_login?: string;
  password?: string; // Only for creation/update
}

export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export const userService = {
  async getUsers(params?: {
    page?: number;
    search?: string;
    is_staff?: boolean;
    is_active?: boolean;
    group?: number;
  }): Promise<UserListResponse> {
    const response = await apiClient.get<UserListResponse>(API_ENDPOINTS.USERS, { params });
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response = await apiClient.get<User>(`${API_ENDPOINTS.USERS}${id}/`);
    return response.data;
  },

  async createUser(user: {
    username: string;
    email?: string;
    first_name?: string;
    father_name?: string;
    last_name?: string;
    password: string;
    is_staff?: boolean;
    is_superuser?: boolean;
    is_active?: boolean;
    groups?: number[];
  }): Promise<User> {
    const response = await apiClient.post<User>(API_ENDPOINTS.USERS, user);
    return response.data;
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(`${API_ENDPOINTS.USERS}${id}/`, user);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.USERS}${id}/`);
  },
};

