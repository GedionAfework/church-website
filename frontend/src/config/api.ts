// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REFRESH: '/auth/refresh/',
  CHECK_AUTH: '/auth/check/',
  DASHBOARD_STATS: '/dashboard/stats/',
  
  // Members
  MEMBERS: '/members/',
  FAMILIES: '/families/',
  FAMILY_MEMBERS: '/family-members/',
  
  // Structure
  ZONES: '/zones/',
  ZONE_GROUPS: '/zone-groups/',
  SERVICE_DIVISIONS: '/service-divisions/',
  ZONE_LEADERS: '/zone-leaders/',
  SERVICE_LEADERS: '/service-leaders/',
  
  // Content
  BLOG_POSTS: '/blog-posts/',
  HERO_SECTIONS: '/hero-sections/',
  SOCIAL_FEEDS: '/social-feeds/',
  ACTIVE_HERO: '/hero-sections/active/',
  
  // Roles & Permissions
  GROUPS: '/groups/',
  PERMISSIONS: '/permissions/',
  USERS: '/users/',
} as const;

