import { MaterialCommunityIcons } from '@expo/vector-icons';

import { seedCategories, seedPhrasesByCategory } from '../seedFallback';

/**
 * Home hides the emergency category from its grid and the strip is what
 * renders it, so a phrase in a category with no surface is invisible no
 * matter how correctly it is stored. This test is the reason a new airway
 * phrase cannot be quietly added into a dead end.
 */
describe('seed reachability', () => {
  const categories = seedCategories();
  const byCategory = seedPhrasesByCategory();

  it('gives every category something to show', () => {
    // 'my-words' is intentionally empty until a caregiver fills it; any
    // other empty category is a tile that opens onto a dead end.
    const empty = categories
      .filter((category) => category.id !== 'my-words')
      .filter((category) => (byCategory[category.id] ?? []).length === 0)
      .map((category) => category.id);
    expect(empty).toEqual([]);
  });

  it('leaves no phrase stranded in a category that does not exist', () => {
    const known = new Set(categories.map((c) => c.id));
    const orphans = Object.keys(byCategory).filter((id) => !known.has(id));
    expect(orphans).toEqual([]);
  });

  it('gives every phrase an icon that actually resolves', () => {
    const missing = Object.values(byCategory)
      .flat()
      .filter((phrase) => phrase.iconName && !(phrase.iconName in MaterialCommunityIcons.glyphMap))
      .map((phrase) => `${phrase.text.en} -> ${phrase.iconName}`);
    // A name that does not resolve silently falls back to a generic bubble,
    // which is how a pain phrase ends up looking like every other phrase.
    expect(missing).toEqual([]);
  });

  it('keeps the emergency set to what fits a one-tap strip', () => {
    // Not a hard limit, but a strip the patient has to scroll is a strip
    // whose last button is not reachable in one tap.
    expect(byCategory.emergency.length).toBeLessThanOrEqual(4);
  });
});
