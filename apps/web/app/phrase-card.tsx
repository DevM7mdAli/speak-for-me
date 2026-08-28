import type { PhraseSample } from '@speak-for-me/content';

/**
 * The app's own phrase tile, rendered on the page.
 *
 * Same 16px control radius, same 2px border, same 88dp-equivalent minimum
 * height, same colours. Showing the real surface is more use to a nurse
 * deciding whether this works at their bedside than a stylised mockup of
 * it would be.
 */
export function PhraseCard({ phrase }: { phrase: PhraseSample }) {
  const urgent = phrase.tone === 'urgent';

  return (
    <div
      className={`flex min-h-[88px] flex-col justify-center gap-1 rounded-control border-2 px-5 py-4 ${
        urgent
          ? 'border-danger bg-danger text-on-danger'
          : 'border-border bg-surface text-ink'
      }`}
    >
      <span className="text-lead font-bold">{phrase.en}</span>
      <span
        dir="rtl"
        lang="ar"
        className={`text-lead ${urgent ? 'text-on-danger/85' : 'text-muted'}`}
      >
        {phrase.ar}
      </span>
    </div>
  );
}
