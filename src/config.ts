export const SITE_NAME = import.meta.env.PUBLIC_SITE_NAME?.trim() || '';
export const API_BASE_URL = (import.meta.env.PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
