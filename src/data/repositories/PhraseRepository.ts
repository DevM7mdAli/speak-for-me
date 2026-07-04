import type { Category, Phrase, PhraseInput } from '../models';

/**
 * All phrase/category persistence goes through this interface.
 * Screens and stores never touch SQLite directly, so a future
 * CloudSyncRepository can be swapped in without UI changes.
 */
export interface PhraseRepository {
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;

  /** Phrases in a category, ordered by sortOrder. */
  getPhrases(categoryId: string): Promise<Phrase[]>;
  getPhrase(id: string): Promise<Phrase | null>;
  getFavorites(): Promise<Phrase[]>;
  /** Most recently spoken first. */
  getRecentlyUsed(limit: number): Promise<Phrase[]>;
  /** Substring match on the phrase text in one language, for typing suggestions. */
  searchPhrases(query: string, language: 'en' | 'ar', limit: number): Promise<Phrase[]>;

  /** Stamp lastUsedAt so the phrase surfaces in "recently used". */
  recordUsage(id: string): Promise<void>;
  setFavorite(id: string, isFavorite: boolean): Promise<void>;

  createPhrase(input: PhraseInput): Promise<Phrase>;
  updatePhrase(id: string, input: PhraseInput): Promise<void>;
  deletePhrase(id: string): Promise<void>;

  /** Wipe custom content and restore the built-in seed. */
  resetToSeed(): Promise<void>;
}
