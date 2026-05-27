import type { SitePublic, ThemePublic } from '@/lib/api/types';

export const DEFAULT_SITE: SitePublic = {
  name: 'Mi Sitio',
  short_description: 'Sitio oficial',
};

export const DEFAULT_THEME: ThemePublic = {
  preset: 'minimal',
  colors: {
    primary: '#1f6feb',
    secondary: '#0b3b6f',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#0f172a',
  },
  background_gradient: {
    from: '#ffffff',
    to: '#f8fafc',
    angle: 180,
  },
  header_variant: 'classic',
  footer_variant: 'standard',
  card_style: 'soft',
  hero_style: 'image-full',
  font_style: 'inter',
  enable_dark_section: false,
};