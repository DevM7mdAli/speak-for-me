import { buildBackup, parseBackup } from '../phraseBackup';
import type { Phrase } from '../models';

const custom = (over: Partial<Phrase> = {}): Phrase => ({
  id: 'abc',
  categoryId: 'my-words',
  text: { en: 'My daughter', ar: 'ابنتي' },
  isCustom: true,
  isFavorite: true,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

/**
 * A patient's own words are the part of this app that cannot be recreated.
 * Bedside phones get lost, wiped and reassigned between shifts, so backup
 * is local and explicit — no account, no network, no hospital IT.
 */
describe('phrase backup', () => {
  it('round-trips a custom phrase', () => {
    const restored = parseBackup(buildBackup([custom()]));
    expect(restored.phrases).toHaveLength(1);
    expect(restored.phrases[0].text).toEqual({ en: 'My daughter', ar: 'ابنتي' });
  });

  it('preserves the Arabic feminine variant', () => {
    const withVariant = custom({
      text: { en: 'I am ready', ar: 'أنا جاهز', arFeminine: 'أنا جاهزة' },
    });
    const restored = parseBackup(buildBackup([withVariant]));
    expect(restored.phrases[0].text.arFeminine).toBe('أنا جاهزة');
  });

  it('records a version so a future format can be recognised', () => {
    expect(parseBackup(buildBackup([])).version).toBe(1);
  });

  it('rejects a file that is not a backup', () => {
    expect(() => parseBackup('{"hello":true}')).toThrow();
    expect(() => parseBackup('not json at all')).toThrow();
  });

  it('rejects a backup from a newer app rather than guessing', () => {
    const future = JSON.stringify({ version: 99, exportedAt: '', phrases: [] });
    expect(() => parseBackup(future)).toThrow();
  });

  it('drops entries that are missing a language instead of importing them broken', () => {
    const partial = JSON.stringify({
      version: 1,
      exportedAt: '2026-01-01T00:00:00.000Z',
      phrases: [
        { text: { en: 'fine', ar: 'جيد' } },
        { text: { en: 'no arabic' } },
        { text: { ar: 'لا إنجليزية' } },
      ],
    });
    expect(parseBackup(partial).phrases).toHaveLength(1);
  });

  it('does not carry photo paths, which would not resolve on another device', () => {
    const withPhoto = custom({ photoUri: 'file:///var/mobile/photo.jpg' });
    expect(buildBackup([withPhoto])).not.toContain('photo.jpg');
  });
});
