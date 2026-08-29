import type { LegalDocument } from './types';

/**
 * Legal copy for the marketing site.
 *
 * Written from what the application actually does, verified against the
 * source rather than assumed: no account, no network requests, no
 * analytics, and a SQLite database that never leaves the device. Every
 * document is marked `needsReview` — this is accurate, plain-language
 * drafting, not legal advice, and it needs a lawyer before publication.
 */

const MEDICAL_DISCLAIMER: LegalDocument = {
  slug: 'medical-disclaimer',
  title: 'Medical disclaimer',
  summary:
    'Speak For Me is a communication aid. It is not a medical device and not a nurse-call system.',
  updated: '2026-08-29',
  needsReview: true,
  sections: [
    {
      heading: 'This is not a nurse-call system',
      body: [
        'The red buttons in Speak For Me speak a phrase out loud through the phone’s own speaker. They do not alert staff, page anyone, trigger an alarm at a nurses’ station, or connect to any hospital system.',
        'If nobody is in the room, or nobody hears the phone, no one is notified. The app says so on screen when speech fails, and it says so on the button itself.',
        'Patients must remain on the ward’s own call system at all times. Speak For Me is used alongside it, never instead of it.',
      ],
    },
    {
      heading: 'This is not a medical device',
      body: [
        'The app does not diagnose, treat, monitor, or make clinical decisions. It does not record vital signs, produce clinical records, or feed data into any system of record.',
        'It is an augmentative and alternative communication (AAC) aid: it turns a tap into spoken words and displayed text, so that a person who cannot speak can be understood by someone in the room.',
      ],
    },
    {
      heading: 'It can fail, and it tells you when it does',
      body: [
        'Speech depends on a voice being installed on the device and on the device being audible. A phone on silent, at zero volume, with a flat battery, or without a voice installed for the chosen language will not be heard.',
        'The app is built to fail loudly rather than quietly: when speech does not play, the phrase is shown full-screen so it can be read from across the room, and an emergency phrase also vibrates. But a device that is switched off communicates nothing at all.',
      ],
      list: [
        'Keep the device charged and within the patient’s reach.',
        'Check the sound before each patient, using the check built into caregiver settings.',
        'Keep a printed communication board available as a backup.',
      ],
    },
    {
      heading: 'Clinical content',
      body: [
        'The built-in phrases are a starting point chosen for intubated, tracheostomy, ventilated and post-surgical patients. They are not a validated clinical instrument and are not a substitute for assessment by a speech and language therapist.',
        'Wards should review the phrase set for their own patients and add what is missing.',
      ],
    },
  ],
};

const PRIVACY: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy policy',
  summary:
    'Speak For Me has no account, makes no network requests, and stores everything on the device.',
  updated: '2026-08-29',
  needsReview: true,
  sections: [
    {
      heading: 'What the app collects',
      body: [
        'Nothing. Speak For Me has no sign-up, no login, no account, and no server. The app sends no analytics, crash reports, telemetry, or usage statistics anywhere.',
        'Typed messages, spoken phrases, custom phrases and photos never leave the device they were created on.',
      ],
    },
    {
      heading: 'What this website collects',
      body: [
        'The app and this website are separate, and it would be misleading to let the paragraph above stand for both.',
        'This website uses Cloudflare Web Analytics to count page views. It sets no cookies, does not fingerprint your browser or device, does not track you across other sites, and does not build a profile. It has no connection to the app: nothing a patient taps at a bedside is visible here, because the app never sends anything anywhere.',
      ],
    },
    {
      heading: 'What stays on the device',
      body: [
        'The app keeps a local database on the phone or tablet. It holds the built-in phrases, any phrases a caregiver adds, which phrases have been marked as favourites, when a phrase was last spoken, and the caregiver’s settings.',
      ],
      list: [
        'Custom phrases and their optional photos, copied into the app’s own private storage.',
        'A record of when each phrase was last used, so recent phrases can be offered first.',
        'Settings: language, spoken language, voice choice, speaking rate, text size, theme.',
        'A caregiver PIN, stored only as a hash and never as the digits themselves.',
      ],
    },
    {
      heading: 'Permissions the app asks for',
      body: [
        'Photo library access, and only when a caregiver chooses to attach a photo to a phrase they are creating. The app reads the single image that was picked and copies it into its own storage. It does not browse, index, or upload the photo library.',
        'The app does not request microphone access, does not record audio, and does not request location, contacts, camera, or notification permissions.',
      ],
    },
    {
      heading: 'Speech',
      body: [
        'Spoken output uses the text-to-speech engine built into the operating system. The phrase is handed to the device’s own voice.',
        'Some platform voices are downloaded and run entirely on the device; others may be processed by the operating system vendor. That behaviour belongs to Apple or Google, not to this app, and is governed by their privacy terms and the device’s own settings.',
      ],
    },
    {
      heading: 'Backups you make yourself',
      body: [
        'Caregiver settings include an export that writes custom phrases to a file and hands it to the operating system’s share sheet. Where that file goes — email, a messaging app, a cloud drive — is chosen by the person exporting it, and once it leaves the app it is governed by whatever service receives it.',
        'Photos are deliberately excluded from the export, because the file is meant to be portable and photo paths are not.',
      ],
    },
    {
      heading: 'Deleting everything',
      body: [
        'Uninstalling the app removes its database, its settings and any photos it stored. There is nothing held elsewhere to delete, and no account to close.',
        'To hand a device to a different patient without wiping its setup, caregiver settings include an option that clears the previous patient’s phrases, favourites and history while keeping the device configuration.',
      ],
    },
    {
      heading: 'Children and vulnerable users',
      body: [
        'The app is designed for use by patients who may be seriously ill, sedated, or unable to consent in the moment. Because it collects nothing and transmits nothing, using it creates no personal data outside the device itself.',
      ],
    },
  ],
};

const TERMS: LegalDocument = {
  slug: 'terms',
  title: 'Terms of use',
  summary: 'The terms you accept by installing and using Speak For Me.',
  updated: '2026-08-29',
  needsReview: true,
  sections: [
    {
      heading: 'What you are agreeing to',
      body: [
        'By installing or using Speak For Me you accept these terms. If you do not accept them, do not use the app.',
        'These terms sit alongside the medical disclaimer, which forms part of them. Read it before deploying the app at a bedside.',
      ],
    },
    {
      heading: 'Permitted use',
      body: [
        'The app is provided for use as a communication aid by patients, their families, and clinical staff. You may install it on as many devices as you need.',
        'You may not present the app as a nurse-call system, an alarm, a monitoring device, or a substitute for clinical observation, and you may not remove or obscure the notices that say it is none of those things.',
      ],
    },
    {
      heading: 'Content you add',
      body: [
        'Phrases and photos a caregiver adds stay on the device. You are responsible for what you add — in particular for any clinical or personal information a phrase contains, and for whether it is appropriate to store on a shared bedside device.',
        'Because the app has no server, there is nothing for us to moderate, retain, or disclose.',
      ],
    },
    {
      heading: 'No warranty',
      body: [
        'The app is provided as is, without warranty of any kind. Speech depends on hardware, on operating-system voices, and on the device being audible and charged — conditions outside the app’s control.',
        'To the fullest extent permitted by law, the authors accept no liability for any loss or harm arising from use of, or inability to use, the app. This does not limit liability that cannot be excluded by law.',
      ],
    },
    {
      heading: 'Licence',
      body: [
        'Speak For Me is released under the licence included with its source code. That licence governs copying, modification and redistribution, and its warranty disclaimer applies in full.',
      ],
    },
    {
      heading: 'Changes',
      body: [
        'These terms may change as the app changes. The date at the top of this page shows when the wording was last revised.',
      ],
    },
  ],
};

const ACCESSIBILITY: LegalDocument = {
  slug: 'accessibility',
  title: 'Accessibility',
  summary:
    'What Speak For Me does for patients with limited movement, low vision or a screen reader — and what it does not do yet.',
  updated: '2026-08-29',
  needsReview: true,
  sections: [
    {
      heading: 'Built for the bedside, not the desk',
      body: [
        'The app assumes a user who may be weak, shaky, sedated, or working with one hand. Every primary control is at least 88dp — roughly a fingertip and a half — and the emergency phrases are reachable in one tap from any patient screen.',
        'Every tap produces a haptic pulse, so a patient knows the app registered them even when they cannot hear the result.',
      ],
    },
    {
      heading: 'Seeing it',
      body: [
        'Text can be scaled up to 160%, and the layout collapses from two columns to one so nothing is clipped at the largest size.',
        'Three themes are available and are chosen by a caregiver rather than followed from the operating system, because a bay is bright by day and dark at night: light, night, and a high-contrast theme for low vision.',
        'While a phrase is being spoken it is also shown full-screen at display size, so it can be read from across the room by someone who did not hear it.',
      ],
    },
    {
      heading: 'Screen readers',
      body: [
        'Every control carries a label and a role, and status changes are announced explicitly on both iOS and Android rather than relying on a live region that only one platform supports.',
      ],
    },
    {
      heading: 'Language',
      body: [
        'English and Arabic ship together, with full right-to-left layout for Arabic. What the screen shows and what the phone says are separate settings, so a patient can read Arabic while the phone speaks English for staff — or speak both, one after the other.',
        'Arabic wording follows the grammatical form the patient uses about themselves, because Arabic adjectives agree with the speaker.',
      ],
    },
    {
      heading: 'What it does not do yet',
      body: [
        'Being honest about the gaps matters more than a compliance badge. Speak For Me does not yet support switch scanning, eye-gaze input, or dwell selection, so it cannot serve a patient with no reliable touch at all.',
        'The typing screen needs fine motor control and is intended for caregivers and mildly affected patients, not as the primary route for someone who cannot manage the phrase tiles.',
        'If any of these would decide whether the app is usable for your patients, we would rather you knew before installing it.',
      ],
    },
  ],
};

export const legalDocuments: LegalDocument[] = [
  MEDICAL_DISCLAIMER,
  PRIVACY,
  TERMS,
  ACCESSIBILITY,
];

export function findLegalDocument(slug: string): LegalDocument | undefined {
  return legalDocuments.find((doc) => doc.slug === slug);
}
