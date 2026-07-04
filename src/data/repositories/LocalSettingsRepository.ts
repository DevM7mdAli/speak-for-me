import { getDatabase } from '../database';
import { DEFAULT_SETTINGS, type AppSettings } from '../models';
import type { SettingsRepository } from './SettingsRepository';

const SETTINGS_KEY = 'app_settings';

export class LocalSettingsRepository implements SettingsRepository {
  async get(): Promise<AppSettings> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [SETTINGS_KEY],
    );
    if (!row) {
      return { ...DEFAULT_SETTINGS };
    }
    try {
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(row.value) as Partial<AppSettings>) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  async save(settings: AppSettings): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [SETTINGS_KEY, JSON.stringify(settings)],
    );
  }

  async reset(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM settings WHERE key = ?', [SETTINGS_KEY]);
  }
}
