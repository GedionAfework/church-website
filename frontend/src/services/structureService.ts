import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Zone {
  id?: number;
  name: string;
  description?: string;
  location_hint?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ZoneGroup {
  id?: number;
  zone: number;
  group_type: 'children' | 'teenagers' | 'parents';
  name: string;
}

export interface ServiceDivision {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ZoneLeader {
  id?: number;
  zone: number;
  member?: number; // Read-only
  member_id?: number; // Write-only
  member_detail?: {
    id?: number;
    first_name?: string;
    father_name?: string;
    last_name?: string;
    full_name?: string;
  };
  zone_name?: string;
}

export interface ServiceLeader {
  id?: number;
  service_division: number;
  member: number;
}

export interface ListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const structureService = {
  // Zones
  async getZones(params?: { page?: number; search?: string; is_active?: boolean }): Promise<ListResponse<Zone>> {
    const response = await apiClient.get<ListResponse<Zone>>(API_ENDPOINTS.ZONES, { params });
    return response.data;
  },

  async getZone(id: number): Promise<Zone> {
    const response = await apiClient.get<Zone>(`${API_ENDPOINTS.ZONES}${id}/`);
    return response.data;
  },

  async createZone(zone: Partial<Zone>): Promise<Zone> {
    const response = await apiClient.post<Zone>(API_ENDPOINTS.ZONES, zone);
    return response.data;
  },

  async updateZone(id: number, zone: Partial<Zone>): Promise<Zone> {
    const response = await apiClient.patch<Zone>(`${API_ENDPOINTS.ZONES}${id}/`, zone);
    return response.data;
  },

  async deleteZone(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.ZONES}${id}/`);
  },

  // Zone Groups
  async getZoneGroups(params?: { page?: number; zone?: number }): Promise<ListResponse<ZoneGroup>> {
    const response = await apiClient.get<ListResponse<ZoneGroup>>(API_ENDPOINTS.ZONE_GROUPS, { params });
    return response.data;
  },

  async createZoneGroup(group: Partial<ZoneGroup>): Promise<ZoneGroup> {
    const response = await apiClient.post<ZoneGroup>(API_ENDPOINTS.ZONE_GROUPS, group);
    return response.data;
  },

  async updateZoneGroup(id: number, group: Partial<ZoneGroup>): Promise<ZoneGroup> {
    const response = await apiClient.patch<ZoneGroup>(`${API_ENDPOINTS.ZONE_GROUPS}${id}/`, group);
    return response.data;
  },

  async deleteZoneGroup(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.ZONE_GROUPS}${id}/`);
  },

  // Service Divisions
  async getServiceDivisions(params?: { page?: number; search?: string; is_active?: boolean }): Promise<ListResponse<ServiceDivision>> {
    const response = await apiClient.get<ListResponse<ServiceDivision>>(API_ENDPOINTS.SERVICE_DIVISIONS, { params });
    return response.data;
  },

  async getServiceDivision(id: number): Promise<ServiceDivision> {
    const response = await apiClient.get<ServiceDivision>(`${API_ENDPOINTS.SERVICE_DIVISIONS}${id}/`);
    return response.data;
  },

  async createServiceDivision(division: Partial<ServiceDivision>): Promise<ServiceDivision> {
    const response = await apiClient.post<ServiceDivision>(API_ENDPOINTS.SERVICE_DIVISIONS, division);
    return response.data;
  },

  async updateServiceDivision(id: number, division: Partial<ServiceDivision>): Promise<ServiceDivision> {
    const response = await apiClient.patch<ServiceDivision>(`${API_ENDPOINTS.SERVICE_DIVISIONS}${id}/`, division);
    return response.data;
  },

  async deleteServiceDivision(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.SERVICE_DIVISIONS}${id}/`);
  },

  // Zone Leaders
  async getZoneLeaders(params?: { page?: number; zone?: number }): Promise<ListResponse<ZoneLeader>> {
    const response = await apiClient.get<ListResponse<ZoneLeader>>(API_ENDPOINTS.ZONE_LEADERS, { params });
    return response.data;
  },

  async createZoneLeader(leader: Partial<ZoneLeader>): Promise<ZoneLeader> {
    const response = await apiClient.post<ZoneLeader>(API_ENDPOINTS.ZONE_LEADERS, leader);
    return response.data;
  },

  async updateZoneLeader(id: number, leader: Partial<ZoneLeader>): Promise<ZoneLeader> {
    const response = await apiClient.patch<ZoneLeader>(`${API_ENDPOINTS.ZONE_LEADERS}${id}/`, leader);
    return response.data;
  },

  async deleteZoneLeader(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.ZONE_LEADERS}${id}/`);
  },

  // Service Leaders
  async getServiceLeaders(params?: { page?: number; service_division?: number }): Promise<ListResponse<ServiceLeader>> {
    const response = await apiClient.get<ListResponse<ServiceLeader>>(API_ENDPOINTS.SERVICE_LEADERS, { params });
    return response.data;
  },

  async createServiceLeader(leader: Partial<ServiceLeader>): Promise<ServiceLeader> {
    const response = await apiClient.post<ServiceLeader>(API_ENDPOINTS.SERVICE_LEADERS, leader);
    return response.data;
  },

  async updateServiceLeader(id: number, leader: Partial<ServiceLeader>): Promise<ServiceLeader> {
    const response = await apiClient.patch<ServiceLeader>(`${API_ENDPOINTS.SERVICE_LEADERS}${id}/`, leader);
    return response.data;
  },

  async deleteServiceLeader(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.SERVICE_LEADERS}${id}/`);
  },
};

