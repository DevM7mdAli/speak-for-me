import Link from 'next/link';
import { capabilities, emergencySamples, phraseSamples } from '@speak-for-me/content';

import { PhraseCard } from './phrase-card';

export default function LandingPage() {
  return (
    <>
      {/* Hero: what it does, in one sentence, next to the actual product
          surface. No abstraction — the tiles below are the real tiles. */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div className="flex flex-col gap-7">
            <h1 className="text-hero font-bold">
              When a patient cannot speak, the phone speaks for them.
            </h1>
            <p className="max-w-[52ch] text-lead text-muted">
              A bilingual communication aid for intubated, ventilated and post-surgical patients.
              One tap says it out loud in English or Arabic — and puts it on screen large enough to
              read from across the bay.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/#how"
                className="rounded-control bg-primary px-7 py-4 font-bold text-on-primary transition-colors hover:bg-primary-pressed"
              >
                How it works
              </Link>
              <Link
                href="/legal/medical-disclaimer"
                className="rounded-control border-2 border-border px-7 py-4 font-medium transition-colors hover:border-ink"
              >
                What it is not
              </Link>
            </div>
            <p className="text-small text-muted">
              Works offline. No account, no sign-in, nothing to configure at the bedside.
            </p>
          </div>

          <div
            className="flex flex-col gap-3 rounded-dialog border border-hairline bg-sunken p-5"
            aria-label="Example phrases from the app"
          >
            {emergencySamples.map((phrase) => (
              <PhraseCard key={phrase.en} phrase={phrase} />
            ))}
            {phraseSamples.slice(0, 3).map((phrase) => (
              <PhraseCard key={phrase.en} phrase={phrase} />
            ))}
          </div>
        </div>
      </section>

      {/* The page's one real risk: leading with a limitation, at the same
          visual weight as a feature. For a safety-adjacent tool it is the
          first thing a clinical reader needs, not a footnote. */}
      <section className="border-b-2 border-danger bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
            <h2 className="text-h1 font-bold text-danger">
              This is not a nurse-call system.
            </h2>
            <div className="flex max-w-[60ch] flex-col gap-5 text-lead">
              <p>
                The red buttons speak a phrase out loud through the phone&rsquo;s own speaker. They
                do not alert staff, page anyone, or connect to any hospital system. If nobody is in
                the room, nobody is notified.
              </p>
              <p className="text-muted">
                The app says so on screen when speech fails, rather than leaving anyone to assume an
                alert went out. Patients stay on the ward&rsquo;s own call system — Speak For Me is
                used alongside it, never instead of it.
              </p>
              <p>
                <Link
                  href="/legal/medical-disclaimer"
                  className="font-bold text-danger underline underline-offset-4"
                >
                  Read the full medical disclaimer
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-8 border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-[20ch] text-h1 font-bold">
            Built for the moment nothing else is working.
          </h2>
          <div className="mt-14 grid gap-x-14 gap-y-12 md:grid-cols-2">
            {capabilities.map((capability) => (
              <div key={capability.title} className="flex max-w-[46ch] flex-col gap-3">
                <h3 className="text-h3 font-bold">{capability.title}</h3>
                <p className="text-muted">{capability.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The dual-language capability, shown rather than described. */}
      <section className="border-b border-hairline bg-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="flex max-w-[52ch] flex-col gap-5">
            <h2 className="text-h1 font-bold">
              The screen and the speaker can use different languages.
            </h2>
            <p className="text-lead text-muted">
              A patient reading Arabic can have the phone speak English for the nurse on shift. Or
              the reverse. Or both, one after the other, with the caregiver choosing which leads.
            </p>
            <p className="text-muted">
              Speaking both is also a safety net: if one language has no voice installed on the
              device, the other still speaks, and the phrase is on screen in both either way.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-control border-2 border-border bg-ground p-6">
              <p className="text-small font-medium text-muted">The patient reads</p>
              <p dir="rtl" lang="ar" className="mt-2 text-h2 font-bold">
                الألم في صدري
              </p>
            </div>
            <div className="rounded-control border-2 border-primary bg-primary p-6 text-on-primary">
              <p className="text-small font-medium opacity-85">The room hears</p>
              <p className="mt-2 text-h2 font-bold">The pain is in my chest</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
            <h2 className="text-h1 font-bold">Designed for weak hands and tired eyes.</h2>
            <div className="flex max-w-[60ch] flex-col gap-5">
              <p className="text-lead">
                Every primary control is at least 88dp. Text scales to 160%. Three themes, chosen by
                a caregiver rather than followed from the operating system, because a bay is bright
                by day and dark at night.
              </p>
              <p className="text-muted">
                We are equally clear about what is missing: there is no switch scanning, eye-gaze or
                dwell selection yet, so the app cannot serve a patient with no reliable touch at all.
              </p>
              <p>
                <Link
                  href="/legal/accessibility"
                  className="font-bold text-primary underline underline-offset-4"
                >
                  Read the accessibility statement
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex max-w-[54ch] flex-col gap-5">
            <h2 className="text-h1 font-bold">Free, open source, and collects nothing.</h2>
            <p className="text-lead text-muted">
              There is no account to create and no server to send anything to. The database lives on
              the device and is gone when the app is uninstalled.
            </p>
            <p>
              <Link
                href="/legal/privacy"
                className="font-bold text-primary underline underline-offset-4"
              >
                Read the privacy policy
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
