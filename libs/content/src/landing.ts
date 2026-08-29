/** Real phrases from the app's seed, shown so the page uses the product's own words. */
export interface PhraseSample {
  en: string;
  ar: string;
  tone: 'urgent' | 'normal';
}

export const emergencySamples: PhraseSample[] = [
  { en: 'Call the nurse', ar: 'أحتاج الممرض', tone: 'urgent' },
  { en: "I can't breathe well", ar: 'لا أستطيع التنفس جيداً', tone: 'urgent' },
];

export const phraseSamples: PhraseSample[] = [
  { en: 'I need suction', ar: 'أحتاج شفط الإفرازات', tone: 'normal' },
  { en: 'The tube hurts', ar: 'الأنبوب يؤلمني', tone: 'normal' },
  { en: 'The pain is in my chest', ar: 'الألم في صدري', tone: 'normal' },
  { en: 'I want to see my family', ar: 'أريد رؤية عائلتي', tone: 'normal' },
];

export interface Capability {
  title: string;
  body: string;
}

export const capabilities: Capability[] = [
  {
    title: 'Works with no network, no account, no setup',
    body:
      'Everything is on the device: the phrases, the voices, the database. There is nothing to log into and nothing to configure before a patient can use it. A hospital Wi-Fi outage changes nothing.',
  },
  {
    title: 'The screen says it too',
    body:
      'A phrase is shown full-screen while it is spoken, large enough to read from across the bay. Audio is for the room; the screen is for the person who did not hear it — a nurse facing away, a noisy bay, a phone on silent.',
  },
  {
    title: 'Bilingual in both directions',
    body:
      'The patient reads Arabic while the phone speaks English for the nurse on shift. Or the reverse. Or both, one after the other — which also means that if one language has no voice installed, the other still speaks.',
  },
  {
    title: 'Fails out loud, never silently',
    body:
      'When speech does not play, the phrase fills the screen and an emergency vibrates. The app says plainly that no alert was sent rather than leaving anyone to assume one was.',
  },
];

/** The degradation order, which is a real sequence: each step is what happens when the one above it fails. */
export interface Channel {
  step: string;
  title: string;
  body: string;
}

export const channels: Channel[] = [
  {
    step: '01',
    title: 'It speaks',
    body: 'One tap sends the phrase to the device’s own voice, in English or Arabic, at a speed the caregiver sets. A haptic pulse confirms the tap even when the room is loud.',
  },
  {
    step: '02',
    title: 'If nobody hears it, the screen says it',
    body: 'The phrase fills the display at the size you see above, for as long as it is being spoken. Audio is for the room. The screen is for the person facing the other way.',
  },
  {
    step: '03',
    title: 'If the phone is silent, it shakes',
    body: 'An emergency phrase that produces no sound vibrates and turns the screen red. The app states plainly that no alert was sent, rather than letting anyone assume one was.',
  },
  {
    step: '04',
    title: 'If the app itself breaks, four buttons still work',
    body: 'Call the nurse, I can’t breathe, yes, and no are read from a file compiled into the app. They survive a corrupt database, a failed migration and a crashed screen.',
  },
];
