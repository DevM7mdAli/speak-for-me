import type { ReactNode } from 'react';

import { BrandMark } from './brand-mark';

/**
 * The app's real screens, drawn in the page.
 *
 * Colours, radii and proportions are the mobile app's own: 16px control
 * radius, 2px borders, the 88dp minimum target that makes the emergency
 * buttons as large as they are. A nurse deciding whether this works at
 * their bedside is better served by the actual surface than by a stylised
 * impression of it.
 */

const SPEAKER = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-full w-full">
    <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
    <path
      d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const LUNGS = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-full w-full">
    <path
      d="M12 3v8M9 11C9 8 7 7 5.5 8.2 4 9.4 3.5 12 3.5 15c0 3 1 5 3 5s2.5-2 2.5-5v-4ZM15 11c0-3 2-4 3.5-2.8C20 9.4 20.5 12 20.5 15c0 3-1 5-3 5s-2.5-2-2.5-5v-4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const GLYPHS: Record<string, ReactNode> = {
  keyboard: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-full w-full">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M8 14h8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-full w-full">
      <path
        d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  lungs: LUNGS,
  body: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-full w-full">
      <circle cx="12" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 9v7m0 0-3 5m3-5 3 5M7 11h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  hand: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-full w-full">
      <path
        d="M12 20c3.9 0 6.5-2.6 6.5-6.2V9.3a1.4 1.4 0 0 0-2.8 0v2.2m0-2.2V6.4a1.4 1.4 0 0 0-2.8 0v4.8m2.8-2V11m-2.8.2V5.4a1.4 1.4 0 1 0-2.8 0v6M10 11.4V8.2a1.4 1.4 0 0 0-2.8 0v6.4l-1.4-1.8a1.5 1.5 0 0 0-2.3 1.9L6 20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  question: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-full w-full">
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.7 9.6a2.4 2.4 0 1 1 3.2 2.3c-.6.3-.9.8-.9 1.5v.4M12 16.6h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const TILES = [
  { key: 'keyboard', label: 'Type a message', emphasis: true },
  { key: 'star', label: 'Favourites' },
  { key: 'lungs', label: 'Breathing & tube' },
  { key: 'body', label: 'Pain & body' },
  { key: 'hand', label: 'Basic needs' },
  { key: 'question', label: 'Answers' },
];

function Shell({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative w-full max-w-[21.5rem] rounded-[3rem] border-[10px] border-[#0d1f1c] bg-[#0d1f1c] shadow-[0_10px_28px_-12px_rgba(0,0,0,0.45)]"
    >
      <div className="relative overflow-hidden rounded-[2.4rem] bg-[#f2f6f5]">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0d1f1c]" />
        {children}
      </div>
    </div>
  );
}

/** The home screen: emergency first, then the phrase categories. */
export function PhoneHome() {
  return (
    <Shell label="The Speak For Me home screen, showing the emergency buttons above a grid of phrase categories">
      <div className="flex flex-col gap-3 px-3 pb-5 pt-9 text-[#102a27]">
        <div className="flex items-center gap-2 px-1">
          <BrandMark className="h-7 w-7 rounded-[7px]" />
          <span className="text-[13px] font-bold">Speak For Me</span>
          <span className="ms-auto rounded-[9px] border-2 border-[#afc6c0] bg-white px-2.5 py-1 text-[11px] font-bold text-[#006c67]">
            عربي
          </span>
        </div>

        {/* 88dp minimum target, danger fill, speaker glyph — as shipped. */}
        <div className="flex items-center justify-center gap-2 rounded-[14px] border-2 border-[#c83331] bg-[#c83331] px-3 py-4 text-white">
          <span className="h-6 w-6">{SPEAKER}</span>
          <span className="text-[16px] font-bold">Call the nurse</span>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-[14px] border-2 border-[#c83331] bg-white px-3 py-3 text-[#c83331]">
          <span className="h-5 w-5">{LUNGS}</span>
          <span className="text-[14px] font-bold">I can&rsquo;t breathe well</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {TILES.map((tile) => (
            <div
              key={tile.key}
              className={`flex flex-col items-center gap-1.5 rounded-[14px] border-2 px-2 py-3 ${
                tile.emphasis
                  ? 'border-[#006c67] bg-[#006c67] text-white'
                  : 'border-[#007e79]/35 bg-white text-[#102a27]'
              }`}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-full ${
                  tile.emphasis ? 'bg-white/20 text-white' : 'bg-[#f2f6f5] text-[#007e79]'
                }`}
              >
                <span className="h-5 w-5">{GLYPHS[tile.key]}</span>
              </span>
              <span className="text-center text-[11px] font-medium leading-tight">
                {tile.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/**
 * The channel that matters when nobody hears the phone: the phrase, at
 * display size, in both languages.
 */
export function PhoneSpeaking({
  en,
  ar,
  urgent = true,
}: {
  en: string;
  ar: string;
  /** Emergency phrases take the red ground; everything else does not. */
  urgent?: boolean;
}) {
  return (
    <Shell label={`The Speak For Me screen showing the phrase "${en}" at full size in English and Arabic`}>
      <div
        className={`flex min-h-[30rem] flex-col items-center gap-4 px-5 pb-6 pt-12 transition-colors duration-500 ${
          urgent ? 'bg-[#c83331] text-white' : 'bg-[#f2f6f5] text-[#102a27]'
        }`}
      >
        <span className={`h-10 w-10 ${urgent ? '' : 'text-[#006c67]'}`}>{SPEAKER}</span>
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
            urgent ? '' : 'text-[#006c67]'
          }`}
        >
          Speaking
        </p>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-[30px] font-bold leading-[1.1]">{en}</p>
          <p
            dir="rtl"
            lang="ar"
            className={`text-[26px] font-bold leading-[1.4] ${
              urgent ? 'text-white/85' : 'text-[#4b6560]'
            }`}
          >
            {ar}
          </p>
        </div>
        <div
          className={`w-full rounded-[14px] border-2 py-3 text-center text-[13px] font-medium ${
            urgent ? 'border-white/40' : 'border-[#afc6c0]'
          }`}
        >
          Close
        </div>
      </div>
    </Shell>
  );
}
