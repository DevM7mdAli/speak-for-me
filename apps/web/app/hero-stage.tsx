'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { PhraseSample } from '@speak-for-me/content';

import { PhoneSpeaking } from './phone';

const HOLD_MS = 4200;

/**
 * The hero, which is a reproduction of the app's own phrase channel.
 *
 * When speech cannot be heard, the app throws the sentence onto the screen
 * at display size so it can be read from across the bay. The page opens
 * with that rather than describing it — and the device beside the type
 * shows the same sentence at the same moment, so the two are one message
 * at two scales rather than two unrelated decorations.
 *
 * Every phrase is rendered into the same grid cell and only the active one
 * is shown, so the block is always as tall as the longest phrase and
 * cycling never shoves the page around.
 */
export function HeroStage({
  phrases,
  children,
}: {
  phrases: PhraseSample[];
  children: ReactNode;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || phrases.length < 2) return;

    const id = setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, HOLD_MS);
    return () => clearInterval(id);
  }, [phrases.length]);

  const current = phrases[index];

  return (
    <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-20 pt-14 sm:px-10 lg:grid-cols-[1.15fr_auto] lg:items-center lg:gap-20 lg:pb-24">
      <div className="flex flex-col gap-10">
        <p className="max-w-[40ch] text-small text-muted">
          What a patient says when they cannot say it.
        </p>

        <div>
          {/* Decorative repetition of copy that also appears as static text
              further down, so it is hidden from assistive technology rather
              than announced every four seconds. */}
          <div aria-hidden className="grid text-phrase">
            {phrases.map((phrase, i) => {
              const active = i === index;
              return (
                <div
                  key={phrase.en}
                  className={`col-start-1 row-start-1 flex flex-col justify-center gap-1 transition-opacity duration-500 ${
                    active ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <p
                    className={`${active ? 'phrase-enter' : ''} display font-bold ${
                      phrase.tone === 'urgent' ? 'text-danger' : 'text-ink'
                    }`}
                  >
                    {phrase.en}
                  </p>
                  {/* Arabic ascenders and the hamza need more room than
                      Latin at this size. Right-aligned against the flush-left
                      English so the two directions read as two speakers. */}
                  <p
                    dir="rtl"
                    lang="ar"
                    className={`${active ? 'phrase-enter' : ''} pb-[0.1em] font-bold leading-[1.4] text-muted`}
                    style={active ? { animationDelay: '110ms' } : undefined}
                  >
                    {phrase.ar}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center gap-3" aria-hidden>
            {phrases.map((item, i) => (
              <span
                key={item.en}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === index ? 'w-10 bg-primary' : 'w-4 bg-hairline'
                }`}
              />
            ))}
          </div>
        </div>

        {children}
      </div>

      <div className="justify-self-center lg:justify-self-end">
        <PhoneSpeaking en={current.en} ar={current.ar} urgent={current.tone === 'urgent'} />
      </div>
    </div>
  );
}
