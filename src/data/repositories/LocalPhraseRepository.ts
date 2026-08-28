import type { SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

import { getDatabase, seedContent } from '../database';
import type { Category, Phrase, PhraseInput, SyncStatus } from '../models';
import type { PhraseRepository } from './PhraseRepository';

interface PhraseRow {
  id: string;
  category_id: string;
  text_en: string;
  text_ar: string;
  icon_name: string | null;
  photo_uri: string | null;
  is_custom: number;
  is_favorite: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  sync_status: string;
}

interface CategoryRow {
  id: string;
  label_en: string;
  label_ar: string;
  icon_name: string;
  sort_order: number;
  is_emergency: number;
}

function toPhrase(row: PhraseRow): Phrase {
  return {
    id: row.id,
    categoryId: row.category_id,
    text: { en: row.text_en, ar: row.text_ar },
    iconName: row.icon_name ?? undefined,
    photoUri: row.photo_uri ?? undefined,
    isCustom: row.is_custom === 1,
    isFavorite: row.is_favorite === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: row.last_used_at ?? undefined,
    syncStatus: row.sync_status as SyncStatus,
  };
}

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    label: { en: row.label_en, ar: row.label_ar },
    iconName: row.icon_name,
    sortOrder: row.sort_order,
    isEmergency: row.is_emergency === 1,
  };
}

export class LocalPhraseRepository implements PhraseRepository {
  private db(): Promise<SQLiteDatabase> {
    return getDatabase();
  }

  async getCategories(): Promise<Category[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<CategoryRow>('SELECT * FROM categories ORDER BY sort_order');
    return rows.map(toCategory);
  }

  async getCategory(id: string): Promise<Category | null> {
    const db = await this.db();
    const row = await db.getFirstAsync<CategoryRow>('SELECT * FROM categories WHERE id = ?', [id]);
    return row ? toCategory(row) : null;
  }

  async getPhrases(categoryId: string): Promise<Phrase[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<PhraseRow>(
      'SELECT * FROM phrases WHERE category_id = ? ORDER BY sort_order',
      [categoryId],
    );
    return rows.map(toPhrase);
  }

  async getPhrase(id: string): Promise<Phrase | null> {
    const db = await this.db();
    const row = await db.getFirstAsync<PhraseRow>('SELECT * FROM phrases WHERE id = ?', [id]);
    return row ? toPhrase(row) : null;
  }

  async getFavorites(): Promise<Phrase[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<PhraseRow>(
      'SELECT * FROM phrases WHERE is_favorite = 1 ORDER BY sort_order',
    );
    return rows.map(toPhrase);
  }

  async getRecentlyUsed(limit: number): Promise<Phrase[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<PhraseRow>(
      'SELECT * FROM phrases WHERE last_used_at IS NOT NULL ORDER BY last_used_at DESC LIMIT ?',
      [limit],
    );
    return rows.map(toPhrase);
  }

  async searchPhrases(query: string, language: 'en' | 'ar', limit: number): Promise<Phrase[]> {
    const db = await this.db();
    const column = language === 'ar' ? 'text_ar' : 'text_en';
    // % and _ are LIKE wildcards. A patient typing either means the
    // character, not "match anything".
    const escaped = query.replace(/[\\%_]/g, (char) => `\\${char}`);
    const rows = await db.getAllAsync<PhraseRow>(
      `SELECT * FROM phrases WHERE ${column} LIKE ? ESCAPE '\\' COLLATE NOCASE ORDER BY last_used_at DESC, sort_order LIMIT ?`,
      [`%${escaped}%`, limit],
    );
    return rows.map(toPhrase);
  }

  async recordUsage(id: string): Promise<void> {
    const db = await this.db();
    await db.runAsync('UPDATE phrases SET last_used_at = ? WHERE id = ?', [
      new Date().toISOString(),
      id,
    ]);
  }

  async setFavorite(id: string, isFavorite: boolean): Promise<void> {
    const db = await this.db();
    await db.runAsync('UPDATE phrases SET is_favorite = ?, updated_at = ? WHERE id = ?', [
      isFavorite ? 1 : 0,
      new Date().toISOString(),
      id,
    ]);
  }

  async createPhrase(input: PhraseInput): Promise<Phrase> {
    const db = await this.db();
    const now = new Date().toISOString();
    const nextOrder = await db.getFirstAsync<{ next: number }>(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM phrases WHERE category_id = ?',
      [input.categoryId],
    );
    const phrase: Phrase = {
      id: randomUUID(),
      categoryId: input.categoryId,
      text: input.text,
      iconName: input.iconName,
      photoUri: input.photoUri,
      isCustom: true,
      isFavorite: false,
      sortOrder: nextOrder?.next ?? 0,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local',
    };
    await db.runAsync(
      `INSERT INTO phrases (id, category_id, text_en, text_ar, icon_name, photo_uri, is_custom, is_favorite, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?)`,
      [
        phrase.id,
        phrase.categoryId,
        phrase.text.en,
        phrase.text.ar,
        phrase.iconName ?? null,
        phrase.photoUri ?? null,
        phrase.sortOrder,
        now,
        now,
      ],
    );
    return phrase;
  }

  async updatePhrase(id: string, input: PhraseInput): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE phrases
       SET category_id = ?, text_en = ?, text_ar = ?, icon_name = ?, photo_uri = ?, updated_at = ?
       WHERE id = ?`,
      [
        input.categoryId,
        input.text.en,
        input.text.ar,
        input.iconName ?? null,
        input.photoUri ?? null,
        new Date().toISOString(),
        id,
      ],
    );
  }

  async deletePhrase(id: string): Promise<void> {
    const db = await this.db();
    await db.runAsync('DELETE FROM phrases WHERE id = ?', [id]);
  }

  async clearPatientContent(): Promise<void> {
    const db = await this.db();
    await db.withExclusiveTransactionAsync(async (tx) => {
      await tx.execAsync(
        `DELETE FROM phrases WHERE is_custom = 1;
         UPDATE phrases SET is_favorite = 0, last_used_at = NULL;`,
      );
    });
  }

  async resetToSeed(): Promise<void> {
    const db = await this.db();
    await db.withExclusiveTransactionAsync(async (tx) => {
      await tx.execAsync('DELETE FROM phrases; DELETE FROM categories;');
      await seedContent(tx);
    });
  }
}
