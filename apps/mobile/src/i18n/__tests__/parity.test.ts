import en from '../en.json';
import ar from '../ar.json';

const flatten = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([key, child]) =>
        flatten(child, prefix ? `${prefix}.${key}` : key),
      )
    : [prefix];

/**
 * The product rests on every phrase and every label existing in both
 * languages. A key present in one file and missing from the other shows up
 * at the bedside as an untranslated string or a raw key.
 */
describe('translation parity', () => {
  const enKeys = flatten(en).sort();
  const arKeys = flatten(ar).sort();

  it('has the same keys in both languages', () => {
    expect(arKeys).toEqual(enKeys);
  });

  it('has no empty strings', () => {
    for (const [file, dict] of [['en', en], ['ar', ar]] as const) {
      const empties = flatten(dict).filter((key) => {
        const value = key
          .split('.')
          .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], dict);
        return typeof value === 'string' && value.trim() === '';
      });
      expect({ file, empties }).toEqual({ file, empties: [] });
    }
  });
});
