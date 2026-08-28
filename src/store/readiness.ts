import type { AppSettings } from '@/data/models';
import type { AppLanguage } from '@/i18n';
import { resolveSpeechLanguages } from '@/i18n/speechLanguage';
import type { LanguageSpeechCapability } from './speechStore';

export interface ReadinessItem {
  id: string;
  /** i18n key for the label. */
  labelKey: string;
  /** Interpolation values for the label, when it names a language. */
  labelValues?: Record<string, string>;
  done: boolean;
}

export interface BedsideReadiness {
  items: ReadinessItem[];
  /** True only when every derived item passes. */
  ready: boolean;
}

/**
 * Whether this device is set up for a patient.
 *
 * Everything here is derived from actual state rather than ticked by a
 * person, so it cannot report ready while the phone has no installed voice
 * for a language it is set to speak. The one item that does depend on a
 * human is the sound check: a voice being installed is not evidence that
 * anyone in the room heard it — the phone may be on silent or turned down.
 *
 * Physical checks a caregiver still has to make themselves (charger,
 * ringer switch, Guided Access) are listed in the UI as reminders and are
 * deliberately not counted here — claiming to have verified something this
 * code cannot see would be worse than not listing it.
 */
export function bedsideReadiness(
  settings: AppSettings,
  capabilities: Record<AppLanguage, LanguageSpeechCapability>,
): BedsideReadiness {
  const items: ReadinessItem[] = [
    {
      id: 'pin',
      labelKey: 'readiness.pin',
      done: Boolean(settings.caregiverPinHash),
    },
  ];

  // Only the languages this device will actually speak matter. A missing
  // Arabic voice is irrelevant on a phone set to speak English.
  for (const language of resolveSpeechLanguages(settings.language, settings)) {
    const name = language === 'en' ? 'settings.english' : 'settings.arabic';
    items.push({
      id: `voice-${language}`,
      labelKey: 'readiness.voice',
      labelValues: { language: name },
      done: capabilities[language]?.status === 'ready',
    });
    items.push({
      id: `heard-${language}`,
      labelKey: 'readiness.heard',
      labelValues: { language: name },
      done: Boolean(settings.speechCheckConfirmedAt[language]),
    });
  }

  return { items, ready: items.every((item) => item.done) };
}
