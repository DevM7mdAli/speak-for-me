import { seedCategories, seedPhrasesByCategory } from '../seedFallback';

/**
 * SQLite is an optimisation. The seed JSON is compiled into the bundle, so
 * it is still readable when the database will not open — which is the only
 * reason the app can survive a corrupt or full disk at the bedside.
 */
describe('in-memory seed fallback', () => {
  it('provides the emergency category with its phrases', () => {
    const emergency = seedCategories().find((c) => c.id === 'emergency');
    expect(emergency?.isEmergency).toBe(true);
    expect(seedPhrasesByCategory().emergency.length).toBeGreaterThan(0);
  });

  it('carries the phrases a patient cannot be left without', () => {
    const all = Object.values(seedPhrasesByCategory()).flat();
    const english = all.map((p) => p.text.en.toLowerCase());

    for (const critical of ['call the nurse', "i can't breathe well", 'yes', 'no']) {
      expect(english).toContain(critical);
    }
  });

  it('gives every phrase both languages', () => {
    for (const phrase of Object.values(seedPhrasesByCategory()).flat()) {
      expect(phrase.text.en.trim()).not.toBe('');
      expect(phrase.text.ar.trim()).not.toBe('');
    }
  });

  it('gives every phrase a stable id that survives a rebuild', () => {
    const ids = Object.values(seedPhrasesByCategory())
      .flat()
      .map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.length > 0)).toBe(true);
  });

  it('only references categories that exist', () => {
    const known = new Set(seedCategories().map((c) => c.id));
    for (const categoryId of Object.keys(seedPhrasesByCategory())) {
      expect(known).toContain(categoryId);
    }
  });
});
