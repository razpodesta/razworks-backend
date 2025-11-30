// RUTA: apps/web-admin/src/app/sitemap.ts
import { i18n } from '@/config/i18n.config';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200';

  const publicRoutes = [
    '', // Dashboard / Login
    '/blog', // CMS
  ];

  const routes = publicRoutes.flatMap((route) =>
    i18n.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date().toISOString(),
    }))
  );

  return routes;
}
