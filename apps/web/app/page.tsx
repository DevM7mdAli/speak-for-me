import Link from 'next/link';
import {
  capabilities,
  channels,
  emergencySamples,
  phraseSamples,
} from '@speak-for-me/content';

import { HeroStage } from './hero-stage';
import { PhoneHome } from './phone';
import { PhraseCard } from './phrase-card';

/* Short phrases only: the hero sets them at display size, and a phrase
   that wraps forces every other phrase to sit in its leftover space. */
const heroPhrases = [
  emergencySamples[0],
  phraseSamples[0],
  phraseSamples[1],
  { en: 'I need water', ar: 'أحتاج ماء', tone: 'normal' as const },
];

export default function LandingPage() {
  return (
    <>
      {/* The page opens as the app's fallback screen opens: the sentence,
          at size, before anything explains itself. */}
      <section className="night relative overflow-hidden">
        <HeroStage phrases={heroPhrases}>
          <h1 className="display max-w-[18ch] text-h2 font-bold">
            Speak For Me gets the words out of the bed and into the room.
          </h1>

          <p className="max-w-[46ch] text-lead text-muted">
            A bilingual communication aid for intubated, ventilated and post-surgical patients.
            Works offline. No account, nothing to configure at the bedside.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#channels"
              className="rounded-control bg-white px-7 py-4 font-bold text-night transition-colors hover:bg-muted"
            >
              How it works
            </Link>
            <Link
              href="#limits"
              className="rounded-control border border-hairline px-7 py-4 font-medium text-muted transition-colors hover:border-ink hover:text-ink"
            >
              What it is not
            </Link>
          </div>
        </HeroStage>
      </section>

      {/* A real sequence — each step is what happens when the one above it
          fails — so it earns its numbering. */}
      <section id="channels" className="scroll-mt-4 border-b border-hairline">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-32">
          <h2 className="display max-w-[14ch] text-h1 font-bold">
            Four ways to be heard, in the order they fail.
          </h2>

          <ol className="mt-16 flex flex-col">
            {channels.map((channel, index) => (
              <li
                key={channel.step}
                className={`reveal grid gap-x-10 gap-y-4 py-10 sm:grid-cols-[auto_1fr] lg:grid-cols-[7rem_22rem_1fr] ${
                  index === 0 ? '' : 'border-t border-hairline'
                }`}
              >
                <span className="display text-h2 font-bold text-primary tabular-nums">
                  {channel.step}
                </span>
                <h3 className="display text-h3 font-bold">{channel.title}</h3>
                <p className="max-w-[52ch] text-muted">{channel.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The page's real risk: a limitation given more visual weight than
          any feature. For a safety-adjacent tool it is what a clinical
          reader needs first. */}
      <section id="limits" className="scroll-mt-4 bg-accent text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-36">
          <h2 className="display max-w-[13ch] text-h1 font-bold">
            This is not a nurse-call system.
          </h2>
          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-20">
            <p className="max-w-[52ch] text-lead">
              The red buttons speak a phrase out loud through the phone&rsquo;s own speaker. They
              do not alert staff, page anyone, or connect to any hospital system.{' '}
              <span className="font-bold">If nobody is in the room, nobody is notified.</span>
            </p>
            <div className="flex max-w-[52ch] flex-col gap-6">
              <p className="text-white/80">
                Patients stay on the ward&rsquo;s own call system. Speak For Me is used alongside
                it, never instead of it — and the app says so on the button itself.
              </p>
              <Link
                href="/legal/medical-disclaimer"
                className="self-start border-b-2 border-white/60 pb-1 font-bold"
              >
                Read the full medical disclaimer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bilingual output, shown rather than claimed. */}
      <section className="border-b border-hairline bg-sunken">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-24">
            <div className="flex max-w-[46ch] flex-col gap-6">
              <h2 className="display text-h2 font-bold">
                The screen and the speaker can use different languages.
              </h2>
              <p className="text-lead text-muted">
                A patient reading Arabic can have the phone speak English for the nurse on shift.
                Or the reverse. Or both, one after the other.
              </p>
              <p className="text-muted">
                Speaking both is also a safety net: if one language has no voice installed, the
                other still speaks — and the phrase is on screen in both either way.
              </p>
            </div>

            <div className="reveal flex flex-col gap-4">
              <div className="rounded-dialog border-2 border-border bg-surface p-8">
                <p className="text-small font-medium text-muted">The patient reads</p>
                <p dir="rtl" lang="ar" className="mt-4 text-h2 font-bold leading-[1.25]">
                  الألم في صدري
                </p>
              </div>
              <div className="rounded-dialog bg-primary p-8 text-on-primary">
                <p className="text-small font-medium opacity-85">The room hears</p>
                <p className="display mt-4 text-h2 font-bold">The pain is in my chest</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-32">
          <h2 className="display max-w-[16ch] text-h1 font-bold">
            Built for the moment nothing else is working.
          </h2>
          <div className="mt-16 grid gap-x-16 gap-y-14 md:grid-cols-2">
            {capabilities.map((capability) => (
              <div key={capability.title} className="reveal flex max-w-[46ch] flex-col gap-4">
                <h3 className="display text-h3 font-bold">{capability.title}</h3>
                <p className="text-muted">{capability.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-hairline bg-sunken">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:py-32">
          <div className="flex max-w-[46ch] flex-col gap-6">
            <h2 className="display text-h1 font-bold">
              Designed for weak hands and tired eyes.
            </h2>
            <p className="text-lead text-muted">
              Every primary control is at least 88dp. Text scales to 160%. Three themes, chosen by
              a caregiver rather than followed from the operating system.
            </p>
            <p className="text-muted">
              We are equally clear about the gaps: there is no switch scanning, eye-gaze or dwell
              selection yet, so the app cannot serve a patient with no reliable touch at all.
            </p>
            <Link
              href="/legal/accessibility"
              className="self-start border-b-2 border-primary pb-1 font-bold text-primary"
            >
              Read the accessibility statement
            </Link>
          </div>

          <div className="reveal justify-self-center lg:justify-self-end">
            <PhoneHome />
          </div>
        </div>
      </section>

      <section className="night">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-36">
          <h2 className="display max-w-[18ch] text-h1 font-bold">
            Free, open source, and it collects nothing.
          </h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-20">
            <p className="max-w-[50ch] text-lead text-muted">
              No account to create, no server to send anything to. The database lives on the device
              and is gone when the app is uninstalled.
            </p>
            <Link
              href="/legal/privacy"
              className="self-start border-b-2 border-primary pb-1 font-bold text-primary"
            >
              Read the privacy policy
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
