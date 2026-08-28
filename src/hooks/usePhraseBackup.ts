import { useCallback, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import { buildBackup, parseBackup } from '@/data/phraseBackup';
import { phraseRepository } from '@/data/repositories';
import { usePhraseStore } from '@/store/phraseStore';

export type BackupResult =
  | { kind: 'idle' }
  | { kind: 'exported' }
  | { kind: 'imported'; count: number }
  | { kind: 'cancelled' }
  | { kind: 'failed'; reason: string };

/**
 * Export and import of the patient's own phrases as a plain file.
 *
 * Everything here reports its outcome rather than throwing: a caregiver
 * who taps Export needs to know whether a file exists, and silence is the
 * one answer that helps nobody.
 */
export function usePhraseBackup() {
  const importPhrases = usePhraseStore((s) => s.importPhrases);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BackupResult>({ kind: 'idle' });

  const exportPhrases = useCallback(async () => {
    setBusy(true);
    try {
      const phrases = await phraseRepository.getPhrases('my-words');
      const file = new File(Paths.cache, 'speak-for-me-phrases.json');
      if (file.exists) file.delete();
      file.create();
      file.write(buildBackup(phrases));

      if (!(await Sharing.isAvailableAsync())) {
        setResult({ kind: 'failed', reason: 'sharing-unavailable' });
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Speak For Me phrases',
      });
      setResult({ kind: 'exported' });
    } catch {
      setResult({ kind: 'failed', reason: 'export-failed' });
    } finally {
      setBusy(false);
    }
  }, []);

  const importFromFile = useCallback(async () => {
    setBusy(true);
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'public.json', '*/*'],
        copyToCacheDirectory: true,
      });
      if (picked.canceled) {
        setResult({ kind: 'cancelled' });
        return;
      }

      const raw = await new File(picked.assets[0].uri).text();
      const backup = parseBackup(raw);
      const count = await importPhrases(backup.phrases);
      setResult({ kind: 'imported', count });
    } catch (error) {
      setResult({
        kind: 'failed',
        reason: error instanceof Error ? error.message : 'import-failed',
      });
    } finally {
      setBusy(false);
    }
  }, [importPhrases]);

  return { busy, result, exportPhrases, importFromFile };
}
