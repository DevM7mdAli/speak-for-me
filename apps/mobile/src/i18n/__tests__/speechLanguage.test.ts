import { detectScriptLanguage, resolveSpeechLanguages } from '../speechLanguage';

describe('resolveSpeechLanguages', () => {
  it('follows the screen by default', () => {
    expect(resolveSpeechLanguages('ar', { speechLanguage: 'follow', speechLanguageLead: 'ar' }))
      .toEqual(['ar']);
    expect(resolveSpeechLanguages('en', { speechLanguage: 'follow', speechLanguageLead: 'ar' }))
      .toEqual(['en']);
  });

  it('speaks a fixed language regardless of what the screen shows', () => {
    // The patient reads Arabic; the nurse on shift reads only English.
    expect(resolveSpeechLanguages('ar', { speechLanguage: 'en', speechLanguageLead: 'ar' }))
      .toEqual(['en']);
    expect(resolveSpeechLanguages('en', { speechLanguage: 'ar', speechLanguageLead: 'en' }))
      .toEqual(['ar']);
  });

  it('speaks both languages, led by the one the caregiver chose', () => {
    expect(resolveSpeechLanguages('ar', { speechLanguage: 'both', speechLanguageLead: 'en' }))
      .toEqual(['en', 'ar']);
    expect(resolveSpeechLanguages('ar', { speechLanguage: 'both', speechLanguageLead: 'ar' }))
      .toEqual(['ar', 'en']);
  });

  it('never repeats a language', () => {
    const languages = resolveSpeechLanguages('en', {
      speechLanguage: 'both',
      speechLanguageLead: 'en',
    });
    expect(new Set(languages).size).toBe(languages.length);
  });
});

/**
 * Free text cannot be translated on device, so it is routed by the script
 * it is written in. Reading Arabic characters with an English voice — or
 * the reverse — produces noise, not speech.
 */
describe('detectScriptLanguage', () => {
  it('routes Arabic script to the Arabic voice', () => {
    expect(detectScriptLanguage('أحتاج ماء', 'en')).toBe('ar');
  });

  it('routes Latin script to the English voice even when the screen is Arabic', () => {
    expect(detectScriptLanguage('I need water', 'ar')).toBe('en');
  });

  it('falls back to the display language when there is no script to go on', () => {
    expect(detectScriptLanguage('123 ...', 'ar')).toBe('ar');
    expect(detectScriptLanguage('', 'en')).toBe('en');
  });
});
