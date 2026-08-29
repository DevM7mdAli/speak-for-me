import { ImageResponse } from 'next/og';

// Prerendered at build time: `output: 'export'` cannot serve a
// dynamic route handler.
export const dynamic = 'force-static';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * The favicon, drawn from the app icon rather than a separate asset: a
 * white speech bubble on the brand teal. At 32px the waveform inside the
 * bubble is illegible, so it is dropped and the coral dot kept — that dot
 * is what makes the mark recognisable at this size.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#006c67',
          borderRadius: 7,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 21,
            height: 18,
            borderRadius: 9,
            backgroundColor: '#ffffff',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e45a55',
              marginRight: -2,
              marginBottom: -2,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
