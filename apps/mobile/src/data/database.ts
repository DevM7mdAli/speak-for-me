import * as SQLite from 'expo-sqlite';

import seed from './seed/phrases.en-ar.json';
import { seedPhraseId } from './seedFallback';

const DATABASE_NAME = 'speak-for-me.db';
const SCHEMA_VERSION = 3;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Single shared connection; migrated and seeded on first open. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate().catch((error) => {
      // Never cache a rejected promise: doing so turns one transient
      // failure into a permanently dead database for the whole process.
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.withExclusiveTransactionAsync(async (tx) => {
      await tx.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          label_en TEXT NOT NULL,
          label_ar TEXT NOT NULL,
          icon_name TEXT NOT NULL,
          sort_order INTEGER NOT NULL,
          is_emergency INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS phrases (
          id TEXT PRIMARY KEY,
          category_id TEXT NOT NULL REFERENCES categories(id),
          text_en TEXT NOT NULL,
          text_ar TEXT NOT NULL,
          text_ar_f TEXT,
          icon_name TEXT,
          photo_uri TEXT,
          is_custom INTEGER NOT NULL DEFAULT 0,
          is_favorite INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          last_used_at TEXT,
          sync_status TEXT NOT NULL DEFAULT 'local'
        );

        CREATE INDEX IF NOT EXISTS idx_phrases_category ON phrases(category_id, sort_order);
        CREATE INDEX IF NOT EXISTS idx_phrases_last_used ON phrases(last_used_at);

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
      await seedContent(tx);
    });
  }

  if (currentVersion < 2) {
    // v1 gave built-in phrases a randomUUID() at insert time, so their ids
    // differed on every install and could not survive a reseed. Re-key them
    // to ids derived from their content, carrying the patient's favourites
    // and usage history across by matching on the English text.
    await db.withExclusiveTransactionAsync(async (tx) => {
      await migrateSeedPhraseIds(tx);
    });
  }

  // Only for databases that already exist: a fresh one was just created at
  // the current schema by the block above.
  if (currentVersion >= 1 && currentVersion < 3) {
    // Arabic adjectives agree with the speaker, so phrases that change
    // with the patient's grammatical gender gain a second Arabic string.
    await db.withExclusiveTransactionAsync(async (tx) => {
      const columns = await tx.getAllAsync<{ name: string }>(
        "SELECT name FROM pragma_table_info('phrases')",
      );
      if (!columns.some((column) => column.name === 'text_ar_f')) {
        await tx.execAsync('ALTER TABLE phrases ADD COLUMN text_ar_f TEXT');
      }

      // Built-in phrases are replaced from the bundle so the new variants
      // and the expanded clinical set land. Custom phrases are untouched,
      // and categories are upserted rather than deleted — custom phrases
      // hold a foreign key into `my-words`, so clearing the table would
      // fail with foreign keys on.
      await tx.runAsync('DELETE FROM phrases WHERE is_custom = 0');
      await seedContent(tx);
    });
  }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  return db;
}

type Runner = Pick<SQLite.SQLiteDatabase, 'runAsync' | 'getAllAsync'>;

async function migrateSeedPhraseIds(db: Runner): Promise<void> {
  const existing = await db.getAllAsync<{
    id: string;
    text_en: string;
    is_favorite: number;
    last_used_at: string | null;
  }>('SELECT id, text_en, is_favorite, last_used_at FROM phrases WHERE is_custom = 0');

  for (const row of existing) {
    const match = seed.phrases.find((phrase) => phrase.en === row.text_en);
    if (!match) continue;

    const stableId = seedPhraseId(match.category, match.en);
    if (stableId === row.id) continue;

    // Row already re-keyed by an earlier partial run: keep the newer one.
    await db.runAsync('DELETE FROM phrases WHERE id = ?', [stableId]);
    await db.runAsync('UPDATE phrases SET id = ? WHERE id = ?', [stableId, row.id]);
  }
}

/** Insert built-in categories and phrases. Assumes empty tables. */
export async function seedContent(db: Pick<SQLite.SQLiteDatabase, 'runAsync'>): Promise<void> {
  for (const category of seed.categories) {
    await db.runAsync(
      `INSERT OR REPLACE INTO categories (id, label_en, label_ar, icon_name, sort_order, is_emergency)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category.id, category.en, category.ar, category.iconName, category.sortOrder, category.isEmergency ? 1 : 0],
    );
  }

  const now = new Date().toISOString();
  // Ordered within each category. A single running index across the whole
  // seed file disagreed with createPhrase(), which numbers per category.
  const orderByCategory: Record<string, number> = {};

  for (const phrase of seed.phrases) {
    const sortOrder = orderByCategory[phrase.category] ?? 0;
    orderByCategory[phrase.category] = sortOrder + 1;

    await db.runAsync(
      `INSERT OR REPLACE INTO phrases (id, category_id, text_en, text_ar, text_ar_f, icon_name, is_custom, is_favorite, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
      [
        seedPhraseId(phrase.category, phrase.en),
        phrase.category,
        phrase.en,
        phrase.ar,
        ('arFeminine' in phrase ? phrase.arFeminine : null) ?? null,
        phrase.iconName,
        sortOrder,
        now,
        now,
      ],
    );
  }
}
