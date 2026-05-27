export const SITE_NAME = import.meta.env.PUBLIC_SITE_NAME?.trim() || '';
const defaultApiBaseUrl = import.meta.env.DEV ? 'http://127.0.0.1:5000' : '';
const defaultSiteUrl = import.meta.env.DEV ? 'http://localhost:4321' : '';

export const API_BASE_URL = (
	import.meta.env.PUBLIC_API_BASE_URL?.trim() || defaultApiBaseUrl
).replace(/\/$/, '');

export const SITE_URL = (
	import.meta.env.PUBLIC_SITE_URL?.trim() || defaultSiteUrl
).replace(/\/$/, '');
