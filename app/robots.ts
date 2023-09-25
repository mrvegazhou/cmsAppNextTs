import { type MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/api',
        '/api/*',
        '/lib',
        '/lib/*',
        '/_next',
        '/_next/*',
        '/posts/new',
        '/posts/*/edit',
        '/message',
        '/follow',
      ],
    },
    sitemap: [
      `${process.env.APP_URL}/sitemap.xml`,
      `${process.env.APP_URL}/api/sitemap-index.xml`,
    ],
  };
}
