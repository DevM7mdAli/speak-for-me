import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from './og';

export const alt =
  'Speak For Me — the phrase "Call the nurse" in English and Arabic. Bilingual, offline, not a nurse-call system.';
// Prerendered at build time: `output: 'export'` cannot serve a
// dynamic route handler.
export const dynamic = 'force-static';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: 'What a patient says when they cannot say it',
    en: 'Call the nurse',
    ar: 'أحتاج الممرض',
  });
}
