import { type MetadataRoute } from 'next';

const now = new Date().toISOString();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${process.env.APP_URL}`,
      lastModified: now,
    },
    {
      url: `${process.env.APP_URL}/sections`,
      lastModified: now,
    },
    {
      url: `${process.env.APP_URL}/avatar`,
      lastModified: now,
    },
    {
      url: `${process.env.APP_URL}/login`,
      lastModified: now,
    },
    {
      url: `${process.env.APP_URL}/register`,
      lastModified: now,
    },
    {
      url: `${process.env.APP_URL}/register`,
      lastModified: now,
    },
    {
      url: `${process.env.APP_URL}/privacy-policy`,
      lastModified: now,
    },
    {
      url: `${process.env.APP_URL}/terms`,
      lastModified: now,
    },
    {
      url: `${process.env.APP_URL}/docs`,
      lastModified: now,
    },
    {
      url: `${process.env.APP_URL}/search`,
      lastModified: now,
    },
  ];
}
