import type { MetadataRoute } from 'next';
import { legalDocuments } from '@speak-for-me/content';

import { SITE_URL } from './site';

/**
 * Every route is static and known at build time, so the sitemap is derived
 * from the same content the pages render — a legal document added to the
 * library appears here without anyone remembering to update a list.
 */
// Emitted as a static file by `output: 'export'`.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const legal = legalDocuments.map((doc) => ({
    url: `${SITE_URL}/legal/${doc.slug}/`,
    lastModified: new Date(doc.updated),
    changeFrequency: 'yearly' as const,
    // The medical disclaimer is the one page that changes how the app
    // should be deployed, so it outranks the other legal pages.
    priority: doc.slug === 'medical-disclaimer' ? 0.8 : 0.5,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/legal/`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    ...legal,
  ];
}
