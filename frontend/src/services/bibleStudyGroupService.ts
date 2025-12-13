import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';
import { type Member } from './memberService';

export interface BibleStudyGroup {
  id?: number;
  zone: number;
  zone_name?: string;
  name: string;
  place_of_study?: string;
  members?: number[];
  members_detail?: Member[];
  members_count?: number;
  leaders?: number[];
  leaders_detail?: Member[];
  leaders_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BibleStudyGroupListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BibleStudyGroup[];
}

export const bibleStudyGroupService = {
  async getBibleStudyGroups(params?: {
    zone?: number;
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<BibleStudyGroupListResponse> {
    const response = await apiClient.get<BibleStudyGroupListResponse>(
      API_ENDPOINTS.BIBLE_STUDY_GROUPS,
      { params }
    );
    return response.data;
  },

  async getBibleStudyGroup(id: number): Promise<BibleStudyGroup> {
    const response = await apiClient.get<BibleStudyGroup>(
      `${API_ENDPOINTS.BIBLE_STUDY_GROUPS}${id}/`
    );
    return response.data;
  },

  async createBibleStudyGroup(data: Partial<BibleStudyGroup>): Promise<BibleStudyGroup> {
    const response = await apiClient.post<BibleStudyGroup>(
      API_ENDPOINTS.BIBLE_STUDY_GROUPS,
      data
    );
    return response.data;
  },

  async updateBibleStudyGroup(
    id: number,
    data: Partial<BibleStudyGroup>
  ): Promise<BibleStudyGroup> {
    const response = await apiClient.patch<BibleStudyGroup>(
      `${API_ENDPOINTS.BIBLE_STUDY_GROUPS}${id}/`,
      data
    );
    return response.data;
  },

  async deleteBibleStudyGroup(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.BIBLE_STUDY_GROUPS}${id}/`);
  },
};

