export const SITE_NAME = import.meta.env.PUBLIC_SITE_NAME?.trim() || '';
export const API_BASE_URL = (import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321').replace(/\/$/, '');
