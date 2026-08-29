import { findLegalDocument, legalDocuments } from '@speak-for-me/content';

import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '../../og';

export const alt = 'Speak For Me legal documentation';
// Prerendered at build time: `output: 'export'` cannot serve a
// dynamic route handler.
export const dynamic = 'force-static';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Prerendered alongside the pages themselves. */
export function generateStaticParams() {
  return legalDocuments.map((doc) => ({ slug: doc.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = findLegalDocument(slug);

  return renderOgImage({
    en: '',
    ar: '',
    title: doc?.title ?? 'Legal',
    subtitle: doc?.summary,
  });
}
