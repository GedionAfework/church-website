import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export type UserInfo = {
  authenticated: boolean;
  username?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  permissions?: string[];
  member_id?: number;
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials
    );
    return response.data;
  },

  async checkAuth(): Promise<UserInfo> {
    const response = await apiClient.get<UserInfo>(API_ENDPOINTS.CHECK_AUTH);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },
};

