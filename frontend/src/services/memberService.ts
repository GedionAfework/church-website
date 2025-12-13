import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Member {
  id?: number;
  user?: number; // User ID if linked
  first_name: string;
  father_name?: string;
  last_name: string;
  full_name?: string;
  gender: 'M' | 'F' | 'O';
  date_of_birth?: string;
  age?: number;
  use_age_instead_of_birthdate?: boolean;
  phone?: string;
  email?: string;
  address?: string;
  zone?: number;
  service_division?: number;
  photo?: string | File;
  is_active: boolean;
  is_staff_member: boolean;
  staff_title?: string;
  staff_bio?: string;
  show_in_staff_page: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MemberListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Member[];
}

export const memberService = {
  async getMembers(params?: {
    page?: number;
    search?: string;
    zone?: number;
    service_division?: number;
    is_active?: boolean;
  }): Promise<MemberListResponse> {
    const response = await apiClient.get<MemberListResponse>(API_ENDPOINTS.MEMBERS, { params });
    return response.data;
  },

  async getMember(id: number): Promise<Member> {
    const response = await apiClient.get<Member>(`${API_ENDPOINTS.MEMBERS}${id}/`);
    return response.data;
  },

  async createMember(member: FormData): Promise<Member> {
    const response = await apiClient.post<Member>(API_ENDPOINTS.MEMBERS, member, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateMember(id: number, member: FormData | Partial<Member>): Promise<Member> {
    const isFormData = member instanceof FormData;
    const response = await apiClient.patch<Member>(
      `${API_ENDPOINTS.MEMBERS}${id}/`,
      member,
      isFormData
        ? {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        : {}
    );
    return response.data;
  },

  async deleteMember(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.MEMBERS}${id}/`);
  },
};

