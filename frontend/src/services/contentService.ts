import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface BlogPost {
  id?: number;
  title: string;
  slug?: string;
  content: string;
  author?: number;
  author_name?: string;
  status: 'draft' | 'published';
  published_at?: string;
  thumbnail_image?: string | File;
  created_at?: string;
  updated_at?: string;
}

export interface HeroSection {
  id?: number;
  title: string;
  subtitle?: string;
  background_image?: string | File;
  button_text?: string;
  button_link?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  layout: 'classic' | 'left_image' | 'right_image' | 'overlay_dark' | 'overlay_light';
  text_alignment: 'left' | 'center' | 'right';
  button_variant: 'primary' | 'outline' | 'ghost';
  title_color?: string;
  subtitle_color?: string;
  overlay_opacity?: number;
  extra_classes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SocialFeedConfig {
  id?: number;
  platform: 'instagram' | 'facebook' | 'youtube';
  handle_or_page_id: string;
  api_key_or_token?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Photo {
  id?: number;
  image: string | File;
  date: string;
  year: number;
  title?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const contentService = {
  // Blog Posts
  async getBlogPosts(params?: {
    page?: number;
    search?: string;
    status?: string;
  }): Promise<ListResponse<BlogPost>> {
    const response = await apiClient.get<ListResponse<BlogPost>>(API_ENDPOINTS.BLOG_POSTS, { params });
    return response.data;
  },

  async getBlogPost(id: number): Promise<BlogPost> {
    const response = await apiClient.get<BlogPost>(`${API_ENDPOINTS.BLOG_POSTS}${id}/`);
    return response.data;
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost> {
    const response = await apiClient.get<ListResponse<BlogPost>>(`${API_ENDPOINTS.BLOG_POSTS}`, {
      params: { slug },
    });
    // API returns a list response, find the exact slug match
    const posts = (response.data as ListResponse<BlogPost>).results || [];
    const post = posts.find(p => p.slug === slug);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  },

  async createBlogPost(post: FormData | Partial<BlogPost>): Promise<BlogPost> {
    const isFormData = post instanceof FormData;
    const response = await apiClient.post<BlogPost>(
      API_ENDPOINTS.BLOG_POSTS,
      post,
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

  async updateBlogPost(id: number, post: FormData | Partial<BlogPost>): Promise<BlogPost> {
    const isFormData = post instanceof FormData;
    const response = await apiClient.patch<BlogPost>(
      `${API_ENDPOINTS.BLOG_POSTS}${id}/`,
      post,
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

  async deleteBlogPost(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.BLOG_POSTS}${id}/`);
  },

  // Hero Sections
  async getHeroSections(params?: {
    page?: number;
    is_active?: boolean;
  }): Promise<ListResponse<HeroSection>> {
    const response = await apiClient.get<ListResponse<HeroSection>>(API_ENDPOINTS.HERO_SECTIONS, { params });
    return response.data;
  },

  async getActiveHero(): Promise<HeroSection | null> {
    try {
      const response = await apiClient.get<HeroSection>(API_ENDPOINTS.ACTIVE_HERO);
      return response.data;
    } catch (error: any) {
      // If 404, no active hero exists
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching active hero:', error);
      return null;
    }
  },

  async createHeroSection(hero: FormData | Partial<HeroSection>): Promise<HeroSection> {
    const isFormData = hero instanceof FormData;
    const response = await apiClient.post<HeroSection>(
      API_ENDPOINTS.HERO_SECTIONS,
      hero,
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

  async updateHeroSection(id: number, hero: FormData | Partial<HeroSection>): Promise<HeroSection> {
    const isFormData = hero instanceof FormData;
    const response = await apiClient.patch<HeroSection>(
      `${API_ENDPOINTS.HERO_SECTIONS}${id}/`,
      hero,
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

  async deleteHeroSection(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.HERO_SECTIONS}${id}/`);
  },

  // Social Feed Configs
  async getSocialFeeds(params?: {
    page?: number;
    platform?: string;
    is_active?: boolean;
  }): Promise<ListResponse<SocialFeedConfig>> {
    const response = await apiClient.get<ListResponse<SocialFeedConfig>>(API_ENDPOINTS.SOCIAL_FEEDS, { params });
    return response.data;
  },

  async createSocialFeed(feed: Partial<SocialFeedConfig>): Promise<SocialFeedConfig> {
    const response = await apiClient.post<SocialFeedConfig>(API_ENDPOINTS.SOCIAL_FEEDS, feed);
    return response.data;
  },

  async updateSocialFeed(id: number, feed: Partial<SocialFeedConfig>): Promise<SocialFeedConfig> {
    const response = await apiClient.patch<SocialFeedConfig>(`${API_ENDPOINTS.SOCIAL_FEEDS}${id}/`, feed);
    return response.data;
  },

  async deleteSocialFeed(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.SOCIAL_FEEDS}${id}/`);
  },

  // Photos
  async getPhotos(params?: {
    page?: number;
    year?: number;
    is_active?: boolean;
  }): Promise<ListResponse<Photo>> {
    const response = await apiClient.get<ListResponse<Photo>>(API_ENDPOINTS.PHOTOS, { params });
    return response.data;
  },

  async getPhoto(id: number): Promise<Photo> {
    const response = await apiClient.get<Photo>(`${API_ENDPOINTS.PHOTOS}${id}/`);
    return response.data;
  },

  async createPhoto(photo: FormData | Partial<Photo>): Promise<Photo> {
    const isFormData = photo instanceof FormData;
    const response = await apiClient.post<Photo>(
      API_ENDPOINTS.PHOTOS,
      photo,
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

  async updatePhoto(id: number, photo: FormData | Partial<Photo>): Promise<Photo> {
    const isFormData = photo instanceof FormData;
    const response = await apiClient.patch<Photo>(
      `${API_ENDPOINTS.PHOTOS}${id}/`,
      photo,
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

  async deletePhoto(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.PHOTOS}${id}/`);
  },

  async bulkCreatePhotos(
    formData: FormData
  ): Promise<{ created?: number; errors?: string[]; photos?: Photo[] }> {
    const response = await apiClient.post<Photo[]>(
      `${API_ENDPOINTS.PHOTOS}bulk_create/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    // Backend returns array of photos on success, or object with errors on failure
    if (Array.isArray(response.data)) {
      return { photos: response.data, created: response.data.length, errors: [] };
    }
    return response.data;
  },
};

