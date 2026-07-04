import { create } from 'zustand';

import type { Category, Phrase, PhraseInput } from '@/data/models';
import { phraseRepository } from '@/data/repositories';

const RECENT_LIMIT = 8;

interface PhraseState {
  categories: Category[];
  /** Loaded phrases keyed by category id. */
  phrasesByCategory: Record<string, Phrase[]>;
  recentlyUsed: Phrase[];
  favorites: Phrase[];

  loadCategories: () => Promise<void>;
  loadCategory: (categoryId: string) => Promise<void>;
  loadMyPhrases: () => Promise<void>;

  recordUsage: (phraseId: string) => Promise<void>;
  toggleFavorite: (phrase: Phrase) => Promise<void>;
  createPhrase: (input: PhraseInput) => Promise<void>;
  updatePhrase: (id: string, input: PhraseInput) => Promise<void>;
  deletePhrase: (phrase: Phrase) => Promise<void>;
  resetToSeed: () => Promise<void>;
}

export const usePhraseStore = create<PhraseState>((set, get) => ({
  categories: [],
  phrasesByCategory: {},
  recentlyUsed: [],
  favorites: [],

  loadCategories: async () => {
    set({ categories: await phraseRepository.getCategories() });
  },

  loadCategory: async (categoryId) => {
    const phrases = await phraseRepository.getPhrases(categoryId);
    set((state) => ({
      phrasesByCategory: { ...state.phrasesByCategory, [categoryId]: phrases },
    }));
  },

  loadMyPhrases: async () => {
    const [recentlyUsed, favorites] = await Promise.all([
      phraseRepository.getRecentlyUsed(RECENT_LIMIT),
      phraseRepository.getFavorites(),
    ]);
    set({ recentlyUsed, favorites });
  },

  recordUsage: async (phraseId) => {
    await phraseRepository.recordUsage(phraseId);
    set({ recentlyUsed: await phraseRepository.getRecentlyUsed(RECENT_LIMIT) });
  },

  toggleFavorite: async (phrase) => {
    await phraseRepository.setFavorite(phrase.id, !phrase.isFavorite);
    await Promise.all([get().loadCategory(phrase.categoryId), get().loadMyPhrases()]);
  },

  createPhrase: async (input) => {
    await phraseRepository.createPhrase(input);
    await get().loadCategory(input.categoryId);
  },

  updatePhrase: async (id, input) => {
    await phraseRepository.updatePhrase(id, input);
    await Promise.all([get().loadCategory(input.categoryId), get().loadMyPhrases()]);
  },

  deletePhrase: async (phrase) => {
    await phraseRepository.deletePhrase(phrase.id);
    await Promise.all([get().loadCategory(phrase.categoryId), get().loadMyPhrases()]);
  },

  resetToSeed: async () => {
    await phraseRepository.resetToSeed();
    set({ phrasesByCategory: {}, recentlyUsed: [], favorites: [] });
    await get().loadCategories();
  },
}));
