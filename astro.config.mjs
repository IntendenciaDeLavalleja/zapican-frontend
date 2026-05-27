// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { exclude: ['leaflet'] },
    ssr: { noExternal: ['react-hot-toast'] },
  },
});
