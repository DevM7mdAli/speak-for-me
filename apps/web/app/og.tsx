import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Shared Open Graph artwork.
 *
 * Rendered by Satori, which supports flexbox and a subset of CSS — no grid,
 * no custom properties — so this is written flat and explicit rather than
 * reusing the site's Tailwind tokens. The colours are still the app's:
 * the icon's teal ground, the icon's coral, the app's off-white.
 *
 * The fonts are the exact TTFs the mobile app loads, so a link shared into
 * Slack or WhatsApp renders in the same typeface a nurse sees at the bedside.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

// Read once at module scope: the files never depend on the request.
const [tajawalRegular, tajawalBold] = await Promise.all([
  readFile(join(process.cwd(), 'assets/fonts/Tajawal_400Regular.ttf')),
  readFile(join(process.cwd(), 'assets/fonts/Tajawal_700Bold.ttf')),
]);

const TEAL = '#00423f';
const CORAL = '#ff8f8a';
const MUTED = '#a8ccc8';
const WHITE = '#ffffff';

interface OgOptions {
  /** The English line, set largest. */
  en: string;
  /** The Arabic line, set right-aligned beneath it. */
  ar: string;
  /** Small label above the phrase. */
  eyebrow?: string;
  /** Replaces the phrase pair — used by the legal pages. */
  title?: string;
  subtitle?: string;
}

/**
 * Arabic, laid out right-to-left by hand.
 *
 * Satori does not implement the Unicode bidirectional algorithm and does
 * not support `direction: rtl`, so a plain Arabic string renders with its
 * words in source order — left to right — even though HarfBuzz shapes the
 * glyphs inside each word correctly. Splitting on spaces and reversing the
 * flex row puts the first word on the right, which is correct for text
 * that is entirely Arabic.
 *
 * This holds because every phrase here is pure Arabic. Mixing in Latin
 * words or digits would need real bidi and this would get them wrong.
 */
function ArabicLine({ text, style }: { text: string; style: React.CSSProperties }) {
  const words = text.trim().split(/\s+/);
  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', ...style }}>
      {words.map((word, i) => (
        <div key={`${word}-${i}`} style={{ display: 'flex', marginLeft: i === 0 ? 0 : '0.28em' }}>
          {word}
        </div>
      ))}
    </div>
  );
}

/** The app icon, drawn with the primitives Satori understands. */
function Mark({ size = 60 }: { size?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: '#006c67',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size * 0.66,
          height: size * 0.58,
          borderRadius: size * 0.29,
          backgroundColor: WHITE,
        }}
      >
        {/* The waveform from the mark: short, tall, short. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.06 }}>
          <div
            style={{
              width: size * 0.055,
              height: size * 0.15,
              borderRadius: size * 0.03,
              backgroundColor: '#006c67',
            }}
          />
          <div
            style={{
              width: size * 0.055,
              height: size * 0.3,
              borderRadius: size * 0.03,
              backgroundColor: '#006c67',
            }}
          />
          <div
            style={{
              width: size * 0.055,
              height: size * 0.15,
              borderRadius: size * 0.03,
              backgroundColor: '#006c67',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function renderOgImage({ en, ar, eyebrow, title, subtitle }: OgOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: TEAL,
          padding: '64px 72px',
          fontFamily: 'Tajawal',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Mark />
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: WHITE }}>
            Speak For Me
          </div>
        </div>

        {title ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 76,
                fontWeight: 700,
                color: WHITE,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div style={{ display: 'flex', fontSize: 32, color: MUTED, lineHeight: 1.4 }}>
                {subtitle}
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {eyebrow ? (
              <div style={{ display: 'flex', fontSize: 26, color: MUTED, marginBottom: 18 }}>
                {eyebrow}
              </div>
            ) : null}
            {/* The bilingual pairing the product is built around: English
                flush left, Arabic flush right, one message. */}
            <div
              style={{
                display: 'flex',
                fontSize: 104,
                fontWeight: 700,
                color: CORAL,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
              }}
            >
              {en}
            </div>
            <ArabicLine
              text={ar}
              style={{
                justifyContent: 'flex-start',
                fontSize: 88,
                fontWeight: 700,
                color: MUTED,
                lineHeight: 1.5,
              }}
            />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderTop: '2px solid rgba(255,255,255,0.18)',
            paddingTop: 26,
            fontSize: 25,
            color: MUTED,
          }}
        >
          <div style={{ display: 'flex' }}>Bilingual · Offline · No account</div>
          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.3)' }}>—</div>
          {/* The claim boundary travels with the link, not just the page. */}
          <div style={{ display: 'flex' }}>Not a nurse-call system</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Tajawal', data: tajawalRegular, style: 'normal', weight: 400 },
        { name: 'Tajawal', data: tajawalBold, style: 'normal', weight: 700 },
      ],
    },
  );
}
