import { DEFAULT_SETTINGS } from '../models';
import { migrateSettings } from '../settingsMigration';

/**
 * Settings written by an older build must keep working. A caregiver who
 * set high contrast for a patient with poor vision should not have it
 * silently turned off by an update.
 */
describe('migrateSettings', () => {
  it('returns defaults for a device that has never saved anything', () => {
    expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS);
  });

  it('returns defaults rather than throwing on unreadable data', () => {
    expect(migrateSettings('not json')).toEqual(DEFAULT_SETTINGS);
    expect(migrateSettings(42)).toEqual(DEFAULT_SETTINGS);
  });

  it('carries the old high-contrast flag onto the new theme setting', () => {
    const migrated = migrateSettings({ language: 'ar', highContrast: true });
    expect(migrated.theme).toBe('high-contrast');
    expect(migrated.language).toBe('ar');
  });

  it('leaves a device that never turned high contrast on in the light theme', () => {
    expect(migrateSettings({ language: 'en', highContrast: false }).theme).toBe('light');
  });

  it('does not override a theme the caregiver has already chosen', () => {
    const migrated = migrateSettings({ theme: 'dark', highContrast: true });
    expect(migrated.theme).toBe('dark');
  });

  it('defaults speech language to following the screen, as it always did', () => {
    const migrated = migrateSettings({ language: 'ar' });
    expect(migrated.speechLanguage).toBe('follow');
  });

  it('keeps settings it does not recognise out of the result', () => {
    const migrated = migrateSettings({ language: 'en', someRemovedFlag: true });
    expect(migrated).not.toHaveProperty('someRemovedFlag');
  });

  it('preserves a caregiver PIN across the migration', () => {
    expect(migrateSettings({ caregiverPinHash: 'abc123' }).caregiverPinHash).toBe('abc123');
  });
});
