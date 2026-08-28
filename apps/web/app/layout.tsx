import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import Link from 'next/link';

import './globals.css';

/**
 * Tajawal is the app's own typeface, chosen because it carries Arabic and
 * Latin in one family — this page shows real bilingual phrases, so it has
 * to render both without switching fonts mid-sentence.
 */
const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Speak For Me — bedside communication for patients who cannot speak',
    template: '%s · Speak For Me',
  },
  description:
    'A bilingual English and Arabic communication aid for intubated, ventilated and post-surgical patients. Works offline, with no account and no network.',
  openGraph: {
    title: 'Speak For Me',
    description:
      'Bedside communication for patients who cannot speak. Bilingual, offline, no account.',
    type: 'website',
  },
};

const legalLinks = [
  { href: '/legal/medical-disclaimer', label: 'Medical disclaimer' },
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/legal/accessibility', label: 'Accessibility' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={tajawal.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-5 focus:py-3 focus:text-on-primary"
        >
          Skip to content
        </a>

        <header className="border-b border-hairline">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
            <Link href="/" className="flex items-center gap-3 font-bold">
              <span
                aria-hidden
                className="grid h-9 w-9 place-items-center rounded-[10px] bg-primary text-[15px] font-bold text-on-primary"
              >
                S
              </span>
              <span className="text-base">Speak For Me</span>
            </Link>
            <nav aria-label="Primary">
              <ul className="flex items-center gap-6 text-small">
                <li>
                  <Link href="/#how" className="text-muted hover:text-ink">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/legal/medical-disclaimer" className="text-muted hover:text-ink">
                    Limits
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="mt-24 border-t border-hairline bg-sunken">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
            <p className="max-w-[60ch] text-small text-muted">
              Speak For Me is a communication aid. It speaks a phrase out loud on the device it is
              installed on. It does not alert staff and is not a nurse-call system.
            </p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-8 gap-y-3 text-small">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-muted underline-offset-4 hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="text-small text-muted">
              Open source. English and Arabic. Built for ICU bedsides.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
