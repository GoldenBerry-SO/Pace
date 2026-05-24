import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pace.tools',
  srcDir: './site',
  publicDir: './site/public',
  output: 'static',
  build: {
    format: 'directory',
  },
  outDir: './build',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/privacy'),
    }),
  ],
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
