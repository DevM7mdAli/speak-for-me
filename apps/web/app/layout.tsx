import type { Metadata, Viewport } from 'next';
import { Tajawal } from 'next/font/google';
import Link from 'next/link';

import { BrandMark } from './brand-mark';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './site';
import './globals.css';

/**
 * Tajawal, and only Tajawal — the same family the app loads, in the same
 * three weights it uses (AppText maps regular/medium/bold onto 400/500/700).
 *
 * A second display face made the site read as a different product from the
 * thing it is selling. Headings are separated by weight and tracking
 * instead, which is how the app separates them too.
 */
const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  // Resolves every relative URL below, and the generated OG image paths.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Speak For Me — bedside communication for patients who cannot speak',
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'AAC',
    'augmentative and alternative communication',
    'ICU communication',
    'intubated patient communication',
    'tracheostomy communication aid',
    'ventilated patient',
    'speech generating app',
    'Arabic AAC',
    'bilingual communication board',
    'offline communication app',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'health',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: '/',
    title: 'Speak For Me — bedside communication for patients who cannot speak',
    description: SITE_DESCRIPTION,
    locale: 'en_GB',
    // The app and the content ship in both languages; say so to crawlers.
    alternateLocale: ['ar'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Speak For Me',
    description:
      'Bedside communication for patients who cannot speak. Bilingual, offline, no account.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // Both themes are declared so browser chrome matches the band at the top
  // and bottom of the page rather than flashing white.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00423f' },
    { media: '(prefers-color-scheme: dark)', color: '#00423f' },
  ],
  colorScheme: 'light dark',
};

/**
 * Structured data. `SoftwareApplication` is the honest type — this is an
 * app, not a MedicalWebPage — and the description repeats the claim
 * boundary so a rich result cannot imply more than the product does.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'iOS, Android',
  isAccessibleForFree: true,
  inLanguage: ['en', 'ar'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  disclaimer:
    'Speak For Me is a communication aid, not a medical device and not a nurse-call system. It speaks a phrase aloud on the device it is installed on and does not alert staff.',
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
        <script
          type="application/ld+json"
          // Serialised from a literal we control, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-5 focus:py-3 focus:text-on-primary"
        >
          Skip to content
        </a>

        <header className="night border-b border-hairline">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 sm:px-10">
            <Link href="/" className="flex items-center gap-3 font-bold">
              <BrandMark className="h-9 w-9 rounded-[10px]" />
              <span className="display text-base font-bold">Speak For Me</span>
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

        <footer className="night border-t border-hairline">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 sm:px-10">
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

        {/* Cloudflare Web Analytics — cookieless, no cross-site tracking.
            A module script defers by default; `defer` is stated explicitly
            so that is visible to a reader and to the linter. */}
        <script
          type="module"
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "335bcdf20a9044578fc99aead8cf2851"}'
        />
      </body>
    </html>
  );
}
