import * as SQLite from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

import seed from './seed/phrases.en-ar.json';

const DATABASE_NAME = 'speak-for-me.db';
const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Single shared connection; migrated and seeded on first open. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate();
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
      await tx.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
    });
  }

  return db;
}

/** Insert built-in categories and phrases. Assumes empty tables. */
export async function seedContent(db: Pick<SQLite.SQLiteDatabase, 'runAsync'>): Promise<void> {
  for (const category of seed.categories) {
    await db.runAsync(
      `INSERT INTO categories (id, label_en, label_ar, icon_name, sort_order, is_emergency)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category.id, category.en, category.ar, category.iconName, category.sortOrder, category.isEmergency ? 1 : 0],
    );
  }

  const now = new Date().toISOString();
  for (const [index, phrase] of seed.phrases.entries()) {
    await db.runAsync(
      `INSERT INTO phrases (id, category_id, text_en, text_ar, icon_name, is_custom, is_favorite, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
      [randomUUID(), phrase.category, phrase.en, phrase.ar, phrase.iconName, index, now, now],
    );
  }
}
