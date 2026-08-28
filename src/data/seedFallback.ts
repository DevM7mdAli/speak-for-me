import type { Category, Phrase } from './models';
import seed from './seed/phrases.en-ar.json';

/**
 * The seed content, shaped for the phrase store without touching SQLite.
 *
 * This JSON is compiled into the bundle, which makes it the app's floor:
 * when the database will not open — corrupt file, full disk, a migration
 * that threw — the patient still gets a working board instead of a splash
 * screen that never goes away.
 */

/**
 * Deterministic id derived from the phrase's own identity rather than
 * `randomUUID()` at insert time. Two consequences that matter: the
 * in-memory fallback and the database agree on ids, and reseeding no
 * longer orphans a patient's favourites.
 */
export function seedPhraseId(categoryId: string, textEn: string): string {
  const slug = textEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `seed:${categoryId}:${slug}`;
}

export function seedCategories(): Category[] {
  return seed.categories
    .map((category) => ({
      id: category.id,
      label: { en: category.en, ar: category.ar },
      iconName: category.iconName,
      sortOrder: category.sortOrder,
      isEmergency: Boolean(category.isEmergency),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function seedPhrasesByCategory(): Record<string, Phrase[]> {
  const now = new Date(0).toISOString();
  const byCategory: Record<string, Phrase[]> = {};

  for (const phrase of seed.phrases) {
    const list = (byCategory[phrase.category] ??= []);
    list.push({
      id: seedPhraseId(phrase.category, phrase.en),
      categoryId: phrase.category,
      text: { en: phrase.en, ar: phrase.ar },
      iconName: phrase.iconName,
      isCustom: false,
      isFavorite: false,
      // Ordered within its own category, not across the whole seed file.
      sortOrder: list.length,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local',
    });
  }

  return byCategory;
}
