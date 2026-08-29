import { ImageResponse } from 'next/og';

// Prerendered at build time: `output: 'export'` cannot serve a
// dynamic route handler.
export const dynamic = 'force-static';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** The full mark, waveform included — there is room for it at 180px. */
export default function AppleIcon() {
  const bar = (height: number) => (
    <div style={{ display: 'flex', width: 11, height, borderRadius: 6, backgroundColor: '#006c67' }} />
  );

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
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 124,
            height: 106,
            borderRadius: 53,
            backgroundColor: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {bar(30)}
            {bar(58)}
            {bar(30)}
          </div>
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              right: -6,
              bottom: -6,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#e45a55',
              border: '5px solid #ffffff',
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
