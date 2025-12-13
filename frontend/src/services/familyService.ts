import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface FamilyMember {
  id?: number;
  member: number;
  relationship: 'father' | 'mother' | 'son' | 'daughter' | 'guardian' | 'other';
}

export interface Family {
  id?: number;
  head_member?: number;
  head_member_name?: string;
  display_name?: string;
  family_members?: Array<{
    id: number;
    member?: {
      id: number;
      first_name: string;
      last_name: string;
      full_name: string;
      father_name?: string;
    };
    relationship: string;
    relationship_display: string;
  }>;
  created_at?: string;
}

export interface FamilyListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Family[];
}

export const familyService = {
  async getFamilies(params?: {
    page?: number;
    search?: string;
  }): Promise<FamilyListResponse> {
    const response = await apiClient.get<FamilyListResponse>(API_ENDPOINTS.FAMILIES, { params });
    return response.data;
  },

  async getFamily(id: number): Promise<Family> {
    const response = await apiClient.get<Family>(`${API_ENDPOINTS.FAMILIES}${id}/`);
    return response.data;
  },

  async createFamily(data: {
    head_member?: number;
    members?: Array<{ member_id: number; relationship: string }>;
  }): Promise<Family> {
    const response = await apiClient.post<Family>(API_ENDPOINTS.FAMILIES, data);
    return response.data;
  },

  async updateFamily(
    id: number,
    data: {
      head_member?: number;
      members?: Array<{ member_id: number; relationship: string }>;
    }
  ): Promise<Family> {
    const response = await apiClient.patch<Family>(`${API_ENDPOINTS.FAMILIES}${id}/`, data);
    return response.data;
  },

  async deleteFamily(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.FAMILIES}${id}/`);
  },

  async addFamilyMember(familyId: number, memberId: number, relationship: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.FAMILIES}${familyId}/members/`, {
      member_id: memberId,
      relationship,
    });
  },

  async removeFamilyMember(familyId: number, memberId: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.FAMILIES}${familyId}/members/`, {
      data: { member_id: memberId },
    });
  },
};

