import type { LocalizedText, Phrase, PhraseInput } from './models';

/**
 * Local backup of the patient's own phrases.
 *
 * A bedside phone gets lost, wiped, or reassigned between shifts, and the
 * custom phrases are the one thing in this app that cannot be recreated
 * from the bundle. This is deliberately a plain file the caregiver moves
 * themselves: no account, no network, nothing for hospital IT to approve.
 *
 * Photos are excluded on purpose — the stored `photoUri` is a path inside
 * this install's sandbox and would not resolve anywhere else. Importing a
 * dangling path would produce broken tiles, which is worse than an icon.
 */
export const BACKUP_VERSION = 1;

export interface PhraseBackup {
  version: number;
  exportedAt: string;
  phrases: PhraseInput[];
}

export function buildBackup(phrases: Phrase[]): string {
  const backup: PhraseBackup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    phrases: phrases.map((phrase) => ({
      categoryId: phrase.categoryId,
      text: {
        en: phrase.text.en,
        ar: phrase.text.ar,
        ...(phrase.text.arFeminine ? { arFeminine: phrase.text.arFeminine } : {}),
      },
      iconName: phrase.iconName,
    })),
  };
  return JSON.stringify(backup, null, 2);
}

function isUsableText(value: unknown): value is LocalizedText {
  if (typeof value !== 'object' || value === null) return false;
  const text = value as Record<string, unknown>;
  // Both languages are required: a phrase missing one becomes blank the
  // moment the caregiver switches language, which is worse than absent.
  return (
    typeof text.en === 'string' &&
    text.en.trim() !== '' &&
    typeof text.ar === 'string' &&
    text.ar.trim() !== ''
  );
}

export function parseBackup(raw: string): PhraseBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('backup-unreadable');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('backup-unreadable');
  }

  const backup = parsed as Record<string, unknown>;
  if (backup.version !== BACKUP_VERSION) {
    // Refuse rather than guess: a newer format may mean something
    // different by the same field names.
    throw new Error('backup-version-unsupported');
  }
  if (!Array.isArray(backup.phrases)) {
    throw new Error('backup-unreadable');
  }

  const phrases: PhraseInput[] = [];
  for (const entry of backup.phrases) {
    if (typeof entry !== 'object' || entry === null) continue;
    const row = entry as Record<string, unknown>;
    if (!isUsableText(row.text)) continue;

    phrases.push({
      categoryId: typeof row.categoryId === 'string' ? row.categoryId : 'my-words',
      text: {
        en: row.text.en,
        ar: row.text.ar,
        ...(typeof (row.text as LocalizedText).arFeminine === 'string'
          ? { arFeminine: (row.text as LocalizedText).arFeminine }
          : {}),
      },
      iconName: typeof row.iconName === 'string' ? row.iconName : undefined,
    });
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: typeof backup.exportedAt === 'string' ? backup.exportedAt : '',
    phrases,
  };
}
